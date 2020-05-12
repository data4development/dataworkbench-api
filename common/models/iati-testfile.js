'use strict';

const debug = require('debug')('dwb:api:upload');
const axios = require('axios');
const md5 = require('md5');
const path = require('path');
const {uuid} = require('uuidv4');
const https = require('https');

const config = require('../config/google-storage');
const app = require('../../server/server');
const version = require('../../server/config.local');
const utils = require('../../utils/convertors');
const testdataset = require('./iati-testdataset.json');

const getFileBaseName = (url) => (`${uuid()}.xml`);

module.exports = function(Iatifile) {
  Iatifile.fileDownload = function(req, res, type, filename, cb) {
    Iatifile.download(config.container_upload[type], filename, req, res, cb);
  };

  Iatifile.remoteMethod('fileDownload', {
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}},
      {arg: 'res', type: 'object', http: {source: 'res'}},
      {arg: 'type', type: 'string', required: true},
      {arg: 'filename', type: 'string', required: true},
    ],
    http: {verb: 'get', path: '/file/:type/:filename'},
  });

  Iatifile.fileUpload = function(req, res, type, cb) {
    // todo: eliminate type from API and front-end, we always upload to 'source'
    // if (!config.container_upload.enum.includes(type)) {
    //   return cb({messsage: 'Unsupported type', statusCode: 400});
    // }

    debug('Starting upload in %s', type);
    const File = app.models['iati-testdataset'];

    Iatifile.upload(
      config.container_upload.source,
      req,
      res,
      (err, uploadedFile) => {
        if (err) {
          return cb(err);
        }
        const fileInfo = uploadedFile.files.file[0];

        File.create({
          filename: fileInfo.originalFilename,
          fileid: fileInfo.name,
          type: fileInfo.type,
          url: `${version.restApiRoot}/iati-testfiles/file/source/${fileInfo.name}`,
          status: 'File uploaded (step 1 of 3)',
        }, (error, result) => {
          if (err) {
            return cb(error);
          }

          return cb(null, result);
        });
      }
    );
  };

  Iatifile.remoteMethod('fileUpload', {
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}},
      {arg: 'res', type: 'object', http: {source: 'res'}},
      {arg: 'type', type: 'string', required: false},
    ],
    returns: [
      {
        arg: 'body',
        type: 'object',
        root: true,
        default: utils.propertiesToResponse(testdataset.properties),
      },
      {arg: 'Content-Type', type: 'application/json', http: {target: 'header'}},
    ],
    http: {verb: 'post', path: '/file/:type'},
  });

  Iatifile.fetchFileByURL = function(req, res, type, cb) {
    if (!config.container_upload.enum.includes(type)) {
      return cb({message: 'Unsupported type', statusCode: 400});
    }

    const {url} = req.body;

    const downloadFile = async (sourceUrl, fileName) => {
      const image = await axios.get(sourceUrl, {
        responseType: 'stream',
        timeout: 15 * 1000,
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      });

      return new Promise((resolve, reject) => {
        const uploadStream = Iatifile.uploadStream(
          config.container_upload.source,
          fileName,
        );

        const fileBuffer = [];

        image.data.on('data', (data) => {
          fileBuffer.push(data);
        });
        image.data.on('error', reject);
        image.data.on('end', () => {
          resolve(Buffer.concat(fileBuffer));
        });

        image.data.pipe(uploadStream);
      });
    };

    const saveFileMetadata = (file) => new Promise((resolve, reject) => {
      const TestDataset = app.models['iati-testdataset'];

      TestDataset.create(new TestDataset({
        name: `unknown_publisher-${file.name}`,
        filename: file.name,
        url: `${version.restApiRoot}/iati-testfiles/file/${type}/${file.name}`,
        sourceUrl: file.sourceUrl,
        md5: file.md5,
        tmpworkspaceId: file.tmpworkspaceId,
        status: 'File uploaded (step 1 of 3)',
      }), (err, data) => {
        if (err) {
          return reject(err);
        }

        resolve(data);
      });
    });

    const name = getFileBaseName(url);

    downloadFile(url, name)
      .then(async (fileAsBuffer) => {
        const md5Hash = md5(fileAsBuffer);

        const savedFile = await saveFileMetadata({
          md5: md5Hash,
          sourceUrl: url,
          name,
          tmpworkspaceId: req.query.tmpWorkspaceId,
        });

        debug(`saved file: ${name}  url: ${url}`);

        cb(null, savedFile);
      })
      .catch((error) => {
        console.error('fetchFilesByURL: ', error);
        cb({message: `App is unable to download file from this url ${url}`, statusCode: 400});
      });
  };

  Iatifile.remoteMethod('fetchFileByURL', {
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}},
      {arg: 'res', type: 'object', http: {source: 'res'}},
      {arg: 'type', type: 'string', required: false},
    ],
    returns: [
      {
        arg: 'body',
        type: 'object',
        root: true,
        default: utils.propertiesToResponse(testdataset.properties),
      },
      {arg: 'Content-Type', type: 'application/json', http: {target: 'header'}},
    ],
    http: {verb: 'post', path: '/url/:type'},
  });
};

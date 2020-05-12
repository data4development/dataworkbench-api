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

module.exports = function(Iatitestworkspace) {
  Iatitestworkspace.fileUpload = function(req, res, id, type, cb) {
    const File = app.models['iati-testfile'];

    File.upload(
      config.container_upload.source,
      req,
      res,
      (err, uploadedFile) => {
        if (err) {
          return cb(err);
        }
        const [fileInfo] = uploadedFile.files.file;
        const Workspace = app.models['iati-testworkspace'];

        Workspace.findById(id, (error, workspace) => {
          workspace.datasets.create({
            filename: fileInfo.originalFilename,
            fileid: fileInfo.name,
            type: fileInfo.type,
            url: `${version.restApiRoot}/iati-testfiles/file/source/${fileInfo.name}`,
            status: 'File uploaded (step 1 of 3)',
          }, (workspaceError, result) => {
            if (workspaceError) {
              return cb(workspaceError);
            }

            return cb(null, result);
          });
        });
      }
    );
  };

  Iatitestworkspace.remoteMethod('fileUpload', {
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}},
      {arg: 'res', type: 'object', http: {source: 'res'}},
      {arg: 'id', type: 'string', required: true},
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
    http: {verb: 'post', path: '/:id/file/:type'},
  });

  Iatitestworkspace.fetchFileByURL = function(req, res, type, id, cb) {
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
        const File = app.models['iati-testfile'];

        const uploadStream = File.uploadStream(
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
      const Workspace = app.models['iati-testworkspace'];

      Workspace.findById(file.tmpWorkspaceId, (error, workspace) => {
        workspace.datasets.create({
          name: `unknown_publisher-${file.name}`,
          filename: file.name,
          fileid: file.name,
          url: `${version.restApiRoot}/iati-testfiles/file/source/${file.name}`,
          sourceUrl: file.sourceUrl,
          md5: file.md5,
          status: 'File uploaded (step 1 of 3)',
        }, (err, data) => {
          if (err) {
            return reject(err);
          }

          resolve(data);
        });
      });
    });

    const name = `${uuid()}.xml`;

    downloadFile(url, name)
      .then(async (fileAsBuffer) => {
        const md5Hash = md5(fileAsBuffer);

        const savedFile = await saveFileMetadata({
          md5: md5Hash,
          sourceUrl: url,
          name,
          tmpWorkspaceId: id,
        });

        debug(`saved file: ${name}  url: ${url}`);

        cb(null, savedFile);
      })
      .catch((error) => {
        console.error('fetchFilesByURL: ', error);
        cb({message: `App is unable to download file from this url ${url}`, statusCode: 400});
      });
  };

  Iatitestworkspace.remoteMethod('fetchFileByURL', {
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}},
      {arg: 'res', type: 'object', http: {source: 'res'}},
      {arg: 'type', type: 'string', required: false},
      {arg: 'id', type: 'string', required: true},
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
    http: {verb: 'post', path: '/:id/url/:type'},
  });
};

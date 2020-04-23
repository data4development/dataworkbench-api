'use strict';

const debug = require('debug')('dwb:api:upload');
const axios = require('axios');

const config = require('../config/google-storage');
const app = require('../../server/server');
const version = require('../../server/config.local');
const utils = require('../../utils/convertors');
const testdataset = require('./iati-testdataset.json');

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
    if (!config.container_upload.enum.includes(type)) {
      return cb({messsage: 'Unsupported type', statusCode: 400});
    }

    debug('Starting upload in %s', type);
    const File = app.models['iati-testdataset'];

    Iatifile.upload(
      config.container_upload[type],
      req,
      res,
      (err, uploadedFile) => {
        if (err) {
          return cb(err);
        }
        const [fileInfo] = uploadedFile.files.files;

        File.create({
          filename: fileInfo.originalFilename,
          fileid: fileInfo.name,
          type: fileInfo.type,
          url: `${version.restApiRoot}/iati-testfiles/file/${type}/${fileInfo.name}`,
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
      {arg: 'type', type: 'string', required: true},
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

  Iatifile.fetchFilesByURL = function(body, res, type, cb) {
    const {urls} = body;

    axios({
      // url,
      method: 'GET',
      responseType: 'arraybuffer',
    });
  };

  Iatifile.remoteMethod('fetchFilesByURL', {
    accepts: [
      {arg: 'body', type: 'object', http: {source: 'body'}},
      {arg: 'res', type: 'object', http: {source: 'res'}},
      {arg: 'type', type: 'string', required: true},
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
    http: {verb: 'post', path: '/urls/:type'},
  });
};

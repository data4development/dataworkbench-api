'use strict';

const config = require('../config/google-storage');
const utils = require('../../utils/convertors');
const dataset = require('./iati-dataset.json');

module.exports = function(Iatifile) {
  Iatifile.fileDownload = function(req, res, type, filename, cb) {
    Iatifile.download(config.container_public[type], filename, req, res, cb);
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
    if (!config.container_public.enum.includes(type)) {
      return cb({messsage: 'Unsupported type', statusCode: 400});
    }

    Iatifile.upload(
      config.container_public[type],
      req,
      res,
      (err, uploadedFile) => {
        if (err) {
          return cb(err);
        }

        cb(null, uploadedFile);
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
        default: utils.propertiesToResponse(dataset.properties),
      },
      {arg: 'Content-Type', type: 'application/json', http: {target: 'header'}},
    ],
    http: {verb: 'post', path: '/file/:type'},
  });
};

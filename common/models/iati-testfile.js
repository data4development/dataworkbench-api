'use strict';

var config = require('../config/google-storage');
var app = require('../../server/server');
var version = require('../../server/config.local');
var utils = require('../../utils/convertors');
var testdataset = require('./iati-testdataset.json');

module.exports = function(Iatifile) {
  Iatifile.fileDownload = function(req, res, type, filename, cb) {
    Iatifile.download(config.container_upload[type], filename, req, res, cb);
  };

  Iatifile.remoteMethod('fileDownload', {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}},
      {arg: 'type', type: 'string', required: true},
      {arg: 'filename', type: 'string', required: true},
    ],
    http: {verb: 'get', path: '/file/:type/:filename'},
  });

  Iatifile.fileUpload = function(req, res, type, cb) {
    if (!config.container_upload.enum.includes(type)) {
      return cb({messsage: 'Unsupported type', statusCode: 400});
    }

    var File = app.models['iati-testdataset'];

    Iatifile.upload(
      config.container_upload[type],
      req,
      res,
      function(err, uploadedFile) {
        if (err) {
          return cb(err);
        }

        var fileInfo = uploadedFile.files.file[0];

        File.create({
          filename: fileInfo.originalFilename,
          fileid: fileInfo.name,
          type: fileInfo.type,
          url: version.restApiRoot + '/iati-testfiles/file/' + type + '/' + fileInfo.name,
          status: 'File uploaded'},
          function(err, data) {
            if (err !== null) {
              return cb(err);
            }

            cb(null, data);
          }
        );
      });
  };

  Iatifile.remoteMethod('fileUpload', {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}},
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
};

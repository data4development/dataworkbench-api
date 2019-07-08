'use strict';

var config = require('../config/google-storage');
var app = require('../../server/server');
var formidable = require('formidable');
var CONTAINERS_URL = '/api/iati-testfiles/';
var utils = require('../../utils/convertors');
var testdataset = require('./iati-testdataset.json');

module.exports = function(Iatitestfile) {
  Iatitestfile.fileDownload = function(req, res, type, filename, cb) {
    Iatitestfile.download(config.container_upload[type], filename, req, res, cb);
  };

  Iatitestfile.remoteMethod('fileDownload', {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}},
      {arg: 'type', type: 'string', required: true},
      {arg: 'filename', type: 'string', required: true},
    ],
    http: {verb: 'get', path: '/file/:type/:filename'},
  });

  Iatitestfile.fileUpload = function(req, res, type, cb) {
    if (!config.container_upload.enum.includes(type)) {
      return cb({messsage: 'Unsupported type', statusCode: 400});
    }

    var File = app.models['iati-testdataset'];
    var form = new formidable.IncomingForm();
    var filename = '';

    form.parse(req, function(err, fields, files) {
      filename = files.file.name;
    });

    Iatitestfile.upload(
      config.container_upload[type],
      req,
      res,
      function(err, uploadedFile) {
        if (err) {
          return cb(err);
        }

        var fileInfo = uploadedFile.files.file[0];

        File.create({
          filename: filename,
          fileid: fileInfo.name,
          type: fileInfo.type,
          shortUrl: CONTAINERS_URL + 'file/' + type + '/' + fileInfo.name,
          url: CONTAINERS_URL + fileInfo.container +
              '/download/' + fileInfo.name,
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

  Iatitestfile.remoteMethod('fileUpload', {
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

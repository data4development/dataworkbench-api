'use strict';

// var config = require('../config/google-storage');
// var app = require('../../server/server');
// var version = require('../../server/config.local');
// var utils = require('../../utils/convertors');
// var testdataset = require('./iati-testdataset.json');
// var debug = require('debug')('dwb:api:upload');

module.exports = function(File) {
  // File.upload = function(ctx, options, cb) {
  //   if (!options) options = {};

  //   debug('Starting upload');
  //   File.app.models['iati-testfile'].upload(ctx.req, ctx.result, options,
  //   		function(err, fileObj) {
  //     debug('Upload done');
  //     if (err) {
  //       cb(err);
  //     } else {
  //       var fileInfo = fileObj.files.file[0];
  //       debug('File %s uploaded as %s', fileInfo.originalFilename, fileInfo.name);
  //       File.create({
  //         filename: fileInfo.originalFilename,
  //         fileid: fileInfo.name,
  //         type: fileInfo.type,
  //         // container: fileInfo.container,
  //         url: '/iati-testfile/' + fileInfo.name,
  //         status: 'File uploaded'},
  //       function(err, obj) {
  //         if (err !== null) {
  //           cb(err);
  //         } else {
  //           cb(null, obj);
  //         }
  //       });
  //     }
  //   });
  // };

  // File.remoteMethod(
  //   'upload',
  //   {
  //     description: 'Uploads a file',
  //     accepts: [
  //       {arg: 'ctx', type: 'object', http: {source: 'context'}},
  //       {arg: 'options', type: 'object', http: {source: 'query'}},
  //     ],
  //     returns: {
  //       arg: 'fileObject', type: 'object', root: true,
  //     },
  //     http: {verb: 'post'},
  //   }
  // );
};

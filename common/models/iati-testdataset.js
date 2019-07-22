'use strict';

var CONTAINERS_URL = '/api/iati-testfiles/';
var CONTAINER_NAME = 'dataworkbench-test-staging-d4d-dataworkbench';
var debug = require('debug')('dwb:api:upload');

module.exports = function(File) {
  // NOTE: I think it' unneeded now
  File.upload = function(ctx, options, cb) {
    if (!options) options = {};
    ctx.req.params.container = CONTAINER_NAME;

    debug('Starting upload');
    File.app.models['iati-testfile'].upload(ctx.req, ctx.result, options,
    		function(err, fileObj) {
      debug('Upload done');
      if (err) {
        cb(err);
      } else {
        var fileInfo = fileObj.files.file[0];
        debug('File %s uploaded as %s', fileInfo.originalFilename, fileInfo.name);
        File.create({
          filename: fileInfo.originalFilename,
          fileid: fileInfo.name,
          type: fileInfo.type,
          // container: fileInfo.container,
          url: CONTAINERS_URL + fileInfo.container +
              '/download/' + fileInfo.name,
          status: 'File uploaded'},
        function(err, obj) {
          if (err !== null) {
            cb(err);
          } else {
            cb(null, obj);
          }
        });
      }
    });
  };

  File.remoteMethod(
    'upload',
    {
      description: 'Uploads a file',
      accepts: [
        {arg: 'ctx', type: 'object', http: {source: 'context'}},
        {arg: 'options', type: 'object', http: {source: 'query'}},
      ],
      returns: {
        arg: 'fileObject', type: 'object', root: true,
      },
      http: {verb: 'post'},
    }
  );
};

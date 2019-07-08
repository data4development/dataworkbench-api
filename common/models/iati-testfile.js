'use strict';

var CONTAINER_NAME = 'dataworkbench-test-staging-d4d-dataworkbench';

module.exports = function(Iatitestfile) {
  Iatitestfile.file = function(req, res, filename, cb) {
    Iatitestfile.download(CONTAINER_NAME, filename, req, res, cb);
  };

  Iatitestfile.remoteMethod('file', {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}},
      {arg: 'filename', type: 'string', required: true},
    ],
    http: {verb: 'get', path: '/file/:filename'},
  });
};

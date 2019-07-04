'use strict';

var CANTAINER_NAME = 'dataworkbench-test-staging-d4d-dataworkbench';

module.exports = function(Iatitestfile) {
  Iatitestfile.file = function(req, res, filename, cb) {
    Iatitestfile.download(CANTAINER_NAME, filename, req, res, cb);
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

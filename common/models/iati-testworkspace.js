'use strict';

const debug = require('debug')('dwb:api:upload');

const config = require('../config/google-storage');
const app = require('../../server/server');
const version = require('../../server/config.local');
const utils = require('../../utils/convertors');
const testdataset = require('./iati-testdataset.json');

module.exports = function(Iatitestworkspace) {
  Iatitestworkspace.fileUpload = function(req, res, id, type, cb) {
    if (!config.container_upload.enum.includes(type)) {
      return cb({messsage: 'Unsupported type', statusCode: 400});
    }

    debug('Starting upload in %s', type);

    const File = app.models['iati-testfile'];

    File.upload(
      config.container_upload[type],
      req,
      res,
      (err, uploadedFile) => {
        if (err) {
          return cb(err);
        }
        const [fileInfo] = uploadedFile.files.files;
        const Workspace = app.models['iati-testworkspace'];

        Workspace.findById(id, (error, workspace) => {
          workspace.datasets.create({
            filename: fileInfo.originalFilename,
            fileid: fileInfo.name,
            type: fileInfo.type,
            url: `${version.restApiRoot}/iati-testfiles/file/${type}/${fileInfo.name}`,
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
    http: {verb: 'post', path: '/:id/file/:type'},
  });
};

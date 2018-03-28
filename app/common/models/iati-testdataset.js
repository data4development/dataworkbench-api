var CONTAINERS_URL = '/api/iati-testfile/';
var CONTAINER_NAME = 'dataworkbench-test';

module.exports = function(File) {


    File.upload = function (ctx,options,cb) {
        if(!options) options = {};
        ctx.req.params.container = CONTAINER_NAME;
        File.app.models['iati-testfile'].upload(ctx.req,ctx.result,options,function (err,fileObj) {
            if(err) {
                cb(err);
            } else {
                var fileInfo = fileObj.files.file[0];
                File.create({
                    filename: fileInfo.name,
                    type: fileInfo.type,
                    container: fileInfo.container,
                    url: CONTAINERS_URL+fileInfo.container+'/download/'+fileInfo.name,
                    org_name: options.org_name,
                    tmpworkspaceId: options.tmpworkspaceId
                },function (err,obj) {
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
                { arg: 'ctx', type: 'object', http: { source:'context' } },
                { arg: 'options', type: 'object', http:{ source: 'query'} }
            ],
            returns: {
                arg: 'fileObject', type: 'object', root: true
            },
            http: {verb: 'post'}
        }
    );

};

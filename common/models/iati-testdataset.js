var CONTAINERS_URL = '/api/iati-testfile/';
var CONTAINER_NAME = 'dataworkbench-test';
var PUBSUB_TOPIC_NEW_FILE = 'newIatiFile';

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
                    // container: fileInfo.container,
                    url: CONTAINERS_URL+fileInfo.container+'/download/'+fileInfo.name,
                    tmpworkspaceId: options.ws
                },function (err,obj) {
                    if (err !== null) {
                        cb(err);
                    } else {
                        cb(null, obj);

                        // Send message with pub/sub to inform the upload of the new file
                        var pubSubMessage = {};
                        pubSubMessage.tempWorkspaceId = options.ws;
                        publishMessage(PUBSUB_TOPIC_NEW_FILE, pubSubMessage);
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

    // Send a message to Google Pub/sub to inform the upload of a new File
    function publishMessage(topicName, data) {
      // [START pubsub_publish_message]
      // Imports the Google Cloud client library
      const PubSub = require(`@google-cloud/pubsub`);

      // Creates a client
      // const pubsub = new PubSub();
      const pubsub = new PubSub({keyFilename: 'local/DataWorkbench-serviceaccount.json'});

      // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
      const dataBuffer = Buffer.from(JSON.stringify(data));

      pubsub
        .topic(topicName)
        .publisher()
        .publish(dataBuffer)
        .then(messageId => {
          console.log(`Message ${messageId} published.`);
        })
        .catch(err => {
          console.error('ERROR:', err);
        });
      // [END pubsub_publish_message]
    }


};

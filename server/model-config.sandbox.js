'use strict';

var _ = require('lodash');
var modelConfig = require('./model-config.json');
var api = require('./api/config.sandbox');
var modelList = Object.keys(api);

if (process.env.API_TYPE === 'public') {
  modelList.forEach(modelName => {
    _.set(
      modelConfig,
      `${modelName}.options.remoting.sharedMethods`,
      api[modelName].public
    );
  });
}

module.exports = modelConfig;

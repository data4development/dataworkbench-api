'use strict';

const modelConfig = require('./model-config.json');
const bootstrap = require('./custom-config/bootstrap');

module.exports = bootstrap(modelConfig);

'use strict';

const _ = require('lodash');
const p = require('../package.json');
const config = require('./config.json');

const version = p.version.split('.').shift();

module.exports = _.merge({config}, {
  restApiRoot: `/api${version > 0 ? `/v${version}` : ''}`,
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 3000,
  remoting: {
    sharedMethods: {
      '*': process.env.API_TYPE !== 'public',
    },
  },
});

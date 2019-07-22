'use strict';

const config = require('./middleware.json');
const _ = require('lodash');

module.exports = _.merge(config, {
  'final:after': {
    'strong-error-handler': {
      params: {
        log: false,
      },
    },
  },
});

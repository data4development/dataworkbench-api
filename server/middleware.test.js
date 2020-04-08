'use strict';

const _ = require('lodash');

const config = require('./middleware.json');

module.exports = _.merge(config, {
  'final:after': {
    'strong-error-handler': {
      params: {
        log: false,
      },
    },
  },
});

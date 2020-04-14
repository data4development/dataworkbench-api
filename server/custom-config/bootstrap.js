'use strict';

const _ = require('lodash');
const path = require('path');

const {NODE_ENV, API_TYPE} = process.env;
const fs = require('fs');

module.exports = (config) => {
  if (
    API_TYPE === 'public' &&
    fs.existsSync(path.resolve(__dirname, `./api.${NODE_ENV}.js`))
  ) {
    // eslint-disable-next-line
    const api = require(`./api.${NODE_ENV}`);
    const modelList = Object.keys(api);

    modelList.forEach((modelName) => {
      _.set(
        config,
        `${modelName}.options.remoting.sharedMethods`,
        api[modelName].public
      );
    });
  }

  return config;
};

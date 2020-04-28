'use strict';

const _ = require('lodash');
const path = require('path');

const {API_TYPE} = process.env;
const fs = require('fs');

console.log(`API_TYPE=${API_TYPE}`);

module.exports = (config) => {
  if (
    API_TYPE === 'public' &&
    fs.existsSync(path.resolve(__dirname, './api.public.js'))
  ) {
    // eslint-disable-next-line
    const api = require('./api.public');
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

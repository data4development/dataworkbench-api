'use strict';

const { API_TYPE } = process.env;
const isPublic = API_TYPE === 'public';

module.exports = {
  spec: ['test', isPublic ? 'test/public' : 'test/private']
};

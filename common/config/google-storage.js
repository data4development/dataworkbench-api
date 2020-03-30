'use strict';

module.exports = {
  container_public: {
    enum: ['source', 'feedback', 'json', 'svrl'],
    source: process.env.CONTAINER_PUBLIC_SOURCE ||
      'dataworkbench-iati-staging-d4d-dataworkbench',
    feedback: process.env.CONTAINER_PUBLIC_FEEDBACK ||
      'dataworkbench-iatifeedback-staging-d4d-dataworkbench',
    json: process.env.CONTAINER_PUBLIC_JSON ||
      'dataworkbench-json-staging-d4d-dataworkbench',
    svrl: process.env.CONTAINER_PUBLIC_SVRL ||
      'dataworkbench-svrl-staging-d4d-dataworkbench',
  },

  container_upload: {
    enum: ['source', 'feedback', 'json', 'svrl'],
    source: process.env.CONTAINER_UPLOAD_SOURCE ||
      'dataworkbench-test-staging-d4d-dataworkbench',
    feedback: process.env.CONTAINER_UPLOAD_FEEDBACK ||
      'dataworkbench-testfeedback-staging-d4d-dataworkbench',
    json: process.env.CONTAINER_UPLOAD_JSON ||
      'dataworkbench-testjson-staging-d4d-dataworkbench',
    svrl: process.env.CONTAINER_UPLOAD_SVRL ||
      'dataworkbench-testsvrl-staging-d4d-dataworkbench',
  },

  validator: {
    api_url: process.env.VALIDATOR_API_URL ||
      'http://localhost:18081/api/v1',
  },

  datastore: {
    api_url: process.env.DATASTORE_API_URL ||
      'https://iati.cloud/api',
  }
};

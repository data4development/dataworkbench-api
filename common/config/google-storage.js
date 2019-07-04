'use strict';

module.exports = {
  container: {
    enum: ['source', 'feedback', 'json', 'svrl'],
    source: process.env.SOURCE_CONTAINER ||
      'dataworkbench-test-staging-d4d-dataworkbench',
    feedback: process.env.FEEDBACK_CONTAINER ||
      'dataworkbench-testfeedback-staging-d4d-dataworkbench',
    json: process.env.JSON_CONTAINER ||
      'dataworkbench-testjson-staging-d4d-dataworkbench',
    svrl: process.env.SVRL_CONTAINER ||
      'dataworkbench-testsvrl-staging-d4d-dataworkbench',
  },
};

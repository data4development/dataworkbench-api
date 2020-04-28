'use strict';

if (process.env.RUN_JOBS === 'run') {
  console.log('starting jobs');

  // eslint-disable-next-line
  require('./jobs/datastore');
}

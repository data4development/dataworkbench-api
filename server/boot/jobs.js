'use strict';

if (process.env.RUN_JOBS === 'run') {
  console.log('starting jobs');
  require('./jobs/datastore');
}

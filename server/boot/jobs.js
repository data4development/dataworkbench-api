'use strict';

if (process.env.RUN_JOBS === 'run') {
  require('./jobs/datastore');
}

DataWorkbench API
=================

This is a Loopback application to provide an API for the DataWorkbench data.

Development
-----------

To run a local version without docker, and responsive to changes in the code:

```
npm install
NODE_ENV=sandbox nodemon server/server.js
```

The *.local.js and *.local.json configuration files will be excluded from the Docker image.

The folder `local` can contain for instance the Google account info, and is excluded from git.

Docker
------

To create a Docker image, run

```
docker build --no-cache --build-arg BUILD_ENV=sandbox -t my-api:v1 .
```

# Project documentation

## process.env

`API_TYPE` - could be `public|empty`. If it's `public` we close all routes and open only the routes which exist in `server/custom-config/api.__env__.js`

## Model-config

We added the specific layer for `model-config.__env__.js`. Every file must use `bootstrap(config)` from `server/custom-config/bootstrap.js`

**Example:**

```js
'use strict';

const modelConfig = require('./model-config.json');
const bootstrap = require('./custom-config/bootstrap');

module.exports = bootstrap(modelConfig);
```

## process.env

`RUN_JOBS` - could be `run|empty`. This var used to run `job tasks` only on one cluster instance.

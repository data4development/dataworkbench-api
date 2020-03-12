DataWorkbench API
=================

This is a Loopback application to provide an API for the DataWorkbench data.

Development
-----------

To run a local version without docker, and responsive to changes in the code:

```sh
npm install
nodemon server/server.js
```

This will use an in-memory database and local file storage in the `test/tmp`directory.

To run the tests:

```shell
npm test
```

To run a version connected to for instance a Google Kubernetes cluster, have a look at the configuration in `server/datasources.cluster-example.json` on how to override datasource settings, using local kubectl port-forwarding to a mongo database and a local service account file to access Google Cloud Storage.

To run with a different datasource configuration in `server/datasources.sandbox.json`:

```shell
NODE_ENV=sandbox nodemon server/server.js
```

Docker
------

To create a Docker image, run

```shell
docker build --no-cache --build-arg BUILD_ENV=sandbox -t my-api:v1 .
```

The *.local.js and *.local.json configuration files will be excluded from the Docker image.

The folder `local` can contain for instance the Google account info, and is excluded from git.

Project documentation
------

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

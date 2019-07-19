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

`DATASTORE_JOBS_PER_HOURS` - could be `1-23|default: 1`. It uses for configure how often run `Datastore clone` [script](./server/boot/jobs/datastore.js)

## Project architecture solution

### Datastore cloning

We had a task to copy all the files from [Datastore](https://api.datastore.iati.cloud/api/datasets). File with implementation is [here](./server/boot/jobs/datastore.js). 

**Main requirements:**

- Clone all the files from `Datastore` to `Google Storage`.
- Check `Datastore` for updates or new files every 1 hour (time can be configured by `process.env.DATASTORE_JOBS_PER_HOURS`).

**Main implementation moment:**

1) Fetching files.

Datastore has nearly 7000 files as for now.  These files can be split in 2000 items on every page. We fetch all data page by page and save it in our `Google Storage(GS)`. If the upload  to `GS` was successful, we save information about the file to `MongoDB`. Url for the first page is `https://api.datastore.iati.cloud/api/datasets/?fields=all&format=json&page=1&ordering=-sha1&page_size=2000`. You can get every next page from the `next` field.

Let's describe important queries:

`fields=all` - uses for fetching the `sha1` filed.

`ordering=-sha1` - is used for simplifying the comparison between `Datastore` data and our data from `MongoDB`(the current project database for current moment) because we try ordering our data in the same way. As the result, we have similar data splitting between pages.

2) How we decide which file to upload and which no to upload.

First of all, we fetch page data from `Datastore` and get all the `sha1` fields. The next step is getting information about the files from `MongoDB`. `MongoDB` has its own pagination by 2000 items per page. Then we get all `sha1` on the current page and compare with `sha1` from `Datastore`. The result of comparing is `diff` which has no cloned files. The next step is making sure that we didn't save these files. That's why we go to `MongoDB` and ask: [Do you have documents with our 'diff' sha1](./server/boot/jobs/datastore.js#L71). If `MongoDB` has already saved some `sha1` already saved we delete this `sha1` from `diff`. Finally, we have filtered `sha1` array which helps download only unsaved/new/updated files.

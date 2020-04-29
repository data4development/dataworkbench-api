'use strict';

const axios = require('axios');
const schedule = require('node-schedule');
const _ = require('lodash');
const md5 = require('md5');
const stream = require('stream');
const path = require('path');
const https = require('https');
const app = require('../../server');

const Dataset = app.models['iati-dataset'];
const iatifile = app.models['iati-file'];
// TODO: rename googleStorageConfig to more generic config identifier
const googleStorageConfig = require('../../../common/config/google-storage');

const saveFileMetadata = (file) => new Promise((resolve, reject) => {
  Dataset.create(new Dataset({
    name: `${file.publisher.name}/${file.name}`,
    url: file.source_url,
    publisher: file.publisher.name,
    filename: `${path.basename(file.source_url)}`,
    updated: file.date_updated,
    downloaded: file.date_updated,
    created: file.date_created,
    internal_url: file.internal_url,
    sha1: file.sha1,
    md5: file.md5,
    origin: 'datastore',
  }), (err, data) => {
    if (err) {
      return reject(err);
    }

    resolve(data);
  });
});

const cloneFile = async (file) => {
  const sourceFile = await axios.get(file.internal_url, {
    responseType: 'arraybuffer',
    timeout: 15 * 1000,
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });

  const md5hash = md5(sourceFile.data);

  console.log('md5:', md5hash, 'for downloaded file:', file.internal_url);

  const fileStream = new stream.PassThrough();

  fileStream.end(sourceFile.data);

  return new Promise((resolve, reject) => {
    const uploadStream = iatifile.uploadStream(
      googleStorageConfig.container_public.source,
      `${md5hash}.xml`,
    );

    fileStream.pipe(uploadStream);

    uploadStream.on('data', (data) => {});
    uploadStream.on('error', reject);
    uploadStream.on('finish', () => {
      resolve(md5hash);
    });
  });
};

const fetchDatastorePage = async (url) => {
  if (!url) {
    return [];
  }

  console.log('fetching page from datastore:', url);
  const {data: {next, results}} = await axios.get(url);

  return _.concat(results, await fetchDatastorePage(next));
};

const fetchFiles = async () => {
  console.log('datastore sync starting');
  const filesResponse =
    await axios.get(`${googleStorageConfig.validator.api_url}/iati-datasets?filter={"where":{"sha1":{"exists":true}}}`);
  const filesValidator = filesResponse.data;

  console.log('number of datasets in the validator:', filesValidator.length);

  const filesDatastoreRaw = await fetchDatastorePage(`${googleStorageConfig.datastore.api_url
  }/datasets/?format=json&page=1&page_size=${
    googleStorageConfig.datastore.pagesize}`);
  const filesDatastoreUrl = _.filter(filesDatastoreRaw,
    (o) => o.internal_url != null);
  const filesDatastore = _.filter(filesDatastoreUrl,
    (o) => o.sha1 !== '');

  const filesDiff = _.differenceWith(filesDatastore, filesValidator, (a, b) => a.sha1 === b.sha1);

  console.log('number of datasets in the datastore (raw):', filesDatastoreRaw.length);
  console.log('number of datasets in the datastore (with internal_url):', filesDatastoreUrl.length);
  console.log('number of datasets in the datastore (with internal_url and sha1):', filesDatastore.length);
  console.log('number of datasets to be retrieved (diff with validator):', filesDiff.length);

  const filteredResults = _.chunk(filesDiff, googleStorageConfig.datastore.workers);

  const processFile = async (file) => {
    try {
      const md5hash = await cloneFile(file);

      await saveFileMetadata({...file, md5: md5hash});
    } catch (err) {
      console.error('File error: ', err.message, file.internal_url);
    }
  };

  // eslint-disable-next-line
  for (const filesChunk of filteredResults) {
    try {
      console.log('start batch of', googleStorageConfig.datastore.workers);
      // eslint-disable-next-line
      await Promise.all(filesChunk.map(processFile));
    } catch (err) {
      console.log('Error sending: ', err.message);
    }
  }

  console.log('datastore sync completed');
};

console.log('datastore sync cron schedule:', googleStorageConfig.datastore.cronschedule);
const job = schedule.scheduleJob(googleStorageConfig.datastore.cronschedule, () => {
  fetchFiles();
});

module.exports = {name: 'datastore', job};

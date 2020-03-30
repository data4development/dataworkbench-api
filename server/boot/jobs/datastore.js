'use strict';

const axios = require('axios');
const schedule = require('node-schedule');
const app = require('../../server');
const Dataset = app.models['iati-dataset'];
const iatifile = app.models['iati-file'];
const path = require('path');
const https = require('https');
// TODO: rename googleStorageConfig to more generic config identifier
const googleStorageConfig = require('../../../common/config/google-storage');
const _ = require('lodash');
const md5 = require('md5');

const saveFileMetadata = file => new Promise((resolve, reject) => {
  Dataset.create(new Dataset({
    name: `${file.publisher.name}/${file.name}`,
    url: file.internal_url,
    publisher: file.publisher.name,
    filename: `${file.publisher.name}-${path.basename(file['source_url'])}`,
    updated: file['date_updated'],
    created: file['date_created'],
    sourceUrl: file['source_url'],
    sha1: file.sha1,
    md5: file.md5
  }), function(err, data) {
    if (err) {
      return reject(err)
    }

    resolve(data);
  });
});

const cloneFile = async (file) => {
  const image = await axios.get(file['internal_url'], {
    responseType: 'stream',
    timeout: 15 * 1000,
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  });
  
  return new Promise((resolve, reject) => {
    const uploadStream = iatifile.uploadStream(
      googleStorageConfig.container_upload.source,
      `${file.publisher.name}-${path.basename(file['source_url'])}`,
    );
    image.data.pipe(uploadStream);

    const fileBuffer = [];
    uploadStream.on('data', (data) => {
      fileBuffer.push(data);
    });
    uploadStream.on('error', reject);
    uploadStream.on('end', () => {
      resolve(Buffer.concat(fileBuffer));
    });
  });
}

const fetchDatastorePage = async(url) => {
  if (!url) {
    return [];
  }

  console.log('fetching page from datastore:', url);
  const {data: { next, results }} = await axios.get(url);

  return _.concat(
    _.filter(results, function(o) {return o.sha1 != ''}), 
    // await fetchDatastorePage(next)
  )
}

const fetchFiles = async () => {
  // const sha1sValidator = await Dataset.find({ order: 'sha1 ASC', fields: {sha1: true}, where: {sha1: {exists: true}} });
  const filesResponse = await axios.get(googleStorageConfig.validator.api_url + '/iati-datasets?filter={"where":{"sha1":{"exists":true}}}');
  const filesValidator = filesResponse.data;
  // const filesValidator = _.filter(filesResponse.data, {sha1: '833356ba0f36b5a1c5e27a1040b7978f61217f9f'});
  console.log('number of datasets in the validator:', filesValidator.length);

  const filesDatastore = _.filter(
    await fetchDatastorePage(googleStorageConfig.datastore.api_url + '/datasets/?format=json&page=1&page_size=100'),
    function(o) {return o.internal_url != null}
  );

  const filesDiff = _.differenceWith(filesDatastore, filesValidator, function (a,b) {return a.sha1 == b.sha1});

  console.log('number of datasets in the datastore:', filesDatastore.length);
  console.log('number of datasets to be retrieved:', filesDiff.length);

  const filteredResults = _.chunk(filesDiff, 5);

  const processFile = async file => {
    try {
      console.log('getting:', file.internal_url);
      const fileAsBuffer = await cloneFile(file);
      console.log('downloaded:', file.internal_url)
      const md5hash = md5(fileAsBuffer);
      console.log('md5 of new file:', md5hash);
      await saveFileMetadata({ ...file, md5: md5hash })
    } catch(err) {
      console.error('File error: ', err.message);
    }
  }

  for(let filesChunk of filteredResults) {
    try {
      console.log('start batch of 5');
      await Promise.all(filesChunk.map(processFile));
    } catch(err) {
      console.log('Error sending: ', err.message)
    }
  }
}

// const job = schedule.scheduleJob(`0 0 */${process.env.DATASTORE_JOBS_PER_HOURS || 1} * *`, () => {
//   fetchFiles();
// });

const job = fetchFiles();

module.exports = {name: 'datastore'};

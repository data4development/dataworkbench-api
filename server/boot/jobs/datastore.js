'use strict';

const axios = require('axios');
const schedule = require('node-schedule');
const app = require('../../server');
const Dataset = app.models['iati-dataset'];
const iatifile = app.models['iati-file'];
const path = require('path');
const https = require('https');
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
  })
});

const cloneFile = async (file) => {
  const image = await axios.get(file['source_url'], {
    responseType: 'stream',
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  });

  return new Promise((resolve, reject) => {
    const resp = iatifile.uploadStream(
      googleStorageConfig.container_upload.source,
      `${file.publisher.name}-${path.basename(file['source_url'])}`,
      {}
    );
    image.data.pipe(resp)

    const fileBuffer = [];
    resp.on('data', (data) => {
      fileBuffer.push(data);
    });
    resp.on('error', reject);
    resp.on('end', () => {
      resolve(Buffer.concat(fileBuffer));
    });
  });
}
const fetchPage = async (url, pageN) => {
  if (!url) {
    return
  }

  const files = await Dataset.find({ oder: 'sha1 DESC', limit: 2000, skip: (pageN - 1) * 2000 });
  const filesSha1 = files.map(({ sha1 }) => sha1);

  return axios.get(url)
    .then(async (resp) => {
      const {data: { next, results }} = resp;
      const resultSha1 = results.map(({ sha1 }) => sha1);
      const fileAndResultDiff = _.differenceWith(resultSha1, filesSha1, _.isEqual);
      const duplicatedSha1 = (await Dataset.find({ where: { sha1: { inq: fileAndResultDiff } }, fields: {'sha1': true} }))
        .map(({ sha1 }) => sha1)
      const filteredSha1 = _.differenceWith(fileAndResultDiff, duplicatedSha1, _.isEqual);

      if (!filteredSha1.length) {
        return fetchPage(next, pageN + 1);
      }

      const filteredResults = results.filter(({ sha1 }) => filteredSha1.indexOf(sha1) !== -1);

      for(const file of filteredResults) {
        try {
          const fileAsBuffer = await cloneFile(file);
          const md5hash = md5(fileAsBuffer);
          await saveFileMetadata({ ...file, md5: md5hash });
        } catch(err) {
          console.error('File error2: ', err.message);
        }
      }
      return fetchPage(next, pageN + 1);
    });
};
const job = schedule.scheduleJob('* * */1 * * *', () => {
  fetchPage('https://api.datastore.iati.cloud/api/datasets/?fields=all&format=json&page=1&ordering=-sha1&page_size=2000', 1);
});

module.exports = {name: 'datastore', job};

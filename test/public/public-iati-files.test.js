'use strict';

const fs = require('fs');

const api = require('../../server/server');
const version = require('../../server/config.local');
const config = require('../../common/config/google-storage');

const tmpdir = './test/tmp/'; // should match /server/datasources.test.json

describe('When working with public IATI files', () => {
  before(() => {
    config.container_public.enum.forEach((bucket) => {
      if (!fs.existsSync(tmpdir + config.container_public[bucket])) {
        fs.mkdirSync(tmpdir + config.container_public[bucket]);
      }
    });
  });

  after(() => {
  });

  it('should\'t have the iati-files endpoint', (done) => {
    chai.request(api)
      .get(`${version.restApiRoot}/iati-files/`)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });

  it('shouldn\'t have a container files endpoint', (done) => {
    chai.request(api)
      .get(`${version.restApiRoot}/iati-files/any-container-name/files`)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });

  it('shouldn\'t handle uploading a small file as source', (done) => {
    chai.request(api)
      .post(`${version.restApiRoot}/iati-files/file/source`)
      .attach('file', fs.readFileSync('./test/fixtures/file-small.xml'),
        'file-small.xml')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });

  it('shouldn\'t handle uploading a large file as source', (done) => {
    chai.request(api)
      .post(`${version.restApiRoot}/iati-files/file/source`)
      .attach('file', fs.readFileSync('./test/fixtures/file-large.xml'),
        'file-large.xml')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});

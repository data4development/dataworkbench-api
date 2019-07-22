'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const api = require('../../server/server');
const version = require('../../server/config.local');
const config = require('../../common/config/google-storage');

const should = chai.should();

chai.use(chaiHttp);

const fs = require('fs');
const tmpdir = './test/tmp/'; // should match /server/datasources.test.json

describe('When working with public IATI files', function() {
  before(function() {
    config.container_public.enum.forEach((bucket) => {
      if (!fs.existsSync(tmpdir + config.container_public[bucket])) {
        fs.mkdirSync(tmpdir + config.container_public[bucket]);
      }
    });
  });

  after(function() {
  });

  it('should\'t have the iati-files endpoint', function(done) {
    chai.request(api)
      .get(version.restApiRoot + '/iati-files/')
      .end(function(err, res) {
        res.should.have.status(404);
        done();
      });
  });

  it('shouldn\'t have a container files endpoint', function(done) {
    chai.request(api)
      .get(version.restApiRoot + '/iati-files/any-container-name/files')
      .end(function(err, res) {
        res.should.have.status(404);
        done();
      });
  });

  it('shouldn\'t handle uploading a small file as source', function(done) {
    chai.request(api)
      .post(version.restApiRoot + '/iati-files/file/source')
      .attach('file', fs.readFileSync('./test/fixtures/file-small.xml'),
              'file-small.xml')
      .end(function(err, res) {
        res.should.have.status(404);
        done();
      });
  });

  it('shouldn\'t handle uploading a large file as source', function(done) {
    chai.request(api)
      .post(version.restApiRoot + '/iati-files/file/source')
      .attach('file', fs.readFileSync('./test/fixtures/file-large.xml'),
              'file-large.xml')
      .end(function(err, res) {
        res.should.have.status(404);
        done();
      });
  });
});

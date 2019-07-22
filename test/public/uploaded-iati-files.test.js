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

describe('When working with uploaded files to test', function() {
  before(function() {
    config.container_upload.enum.forEach((bucket) => {
      if (!fs.existsSync(tmpdir + config.container_upload[bucket])) {
        fs.mkdirSync(tmpdir + config.container_upload[bucket]);
      }
    });
  });

  after(function() {
  });

  it('should have the iati-testdatasets endpoint', function(done) {
    chai.request(api)
      .get(version.restApiRoot + '/iati-testdatasets/')
      .end(function(err, res) {
        res.should.have.status(404);
        done();
      });
  });

  it(
    'shouldn\'t handle uploading a small file into a container',
    function(done) {
      chai.request(api)
        .post(
          `${
            version.restApiRoot
          }/iati-testfiles/${config.container_upload.source}/upload`
        )
        .attach('file', fs.readFileSync('./test/fixtures/file-small.xml'),
                'file-small.xml')
        .end(function(err, res) {
          res.should.have.status(404);
          done();
        });
    });

  it('shouldn\'t handle uploading a file as a dataset', function(done) {
    chai.request(api)
      .post(version.restApiRoot + '/iati-testdatasets/upload')
      .attach('file', fs.readFileSync('./test/fixtures/file-small.xml'),
              'file-small.xml')
      .end(function(err, res) {
        res.should.have.status(200);
        done();
      });
  });

  it('should handle uploading a large file as source', function(done) {
    chai.request(api)
      .post(version.restApiRoot + '/iati-testfiles/file/source')
      .attach('file', fs.readFileSync('./test/fixtures/file-large.xml'),
              'file-large.xml')
      .end(function(err, res) {
        res.should.have.status(404);
        done();
      });
  });

  it('shouldn\'t handle uploading a small file as source', function(done) {
    chai.request(api)
      .post(version.restApiRoot + '/iati-testfiles/file/source')
      .attach('file', fs.readFileSync('./test/fixtures/file-small.xml'),
              'file-small.xml')
      .end(function(err, res) {
        res.should.have.status(404);
        done();
      });
  });

  it('shouldn\'t handle uploading a small file as feedback', function(done) {
    chai.request(api)
      .post(version.restApiRoot + '/iati-testfiles/file/feedback')
      .attach('file', fs.readFileSync('./test/fixtures/file-small.xml'),
              'file-small.xml')
      .end(function(err, res) {
        res.should.have.status(404);
        done();
      });
  });

  it('shouldn\'t handle uploading a small file as json', function(done) {
    chai.request(api)
      .post(version.restApiRoot + '/iati-testfiles/file/json')
      .attach('file', fs.readFileSync('./test/fixtures/file-small.xml'),
              'file-small.xml')
      .end(function(err, res) {
        res.should.have.status(404);
        done();
      });
  });

  it('shouldn\'t handle uploading a small file as svrl', function(done) {
    chai.request(api)
      .post(version.restApiRoot + '/iati-testfiles/file/svrl')
      .attach('file', fs.readFileSync('./test/fixtures/file-small.xml'),
              'file-small.xml')
      .end(function(err, res) {
        res.should.have.status(404);
        done();
      });
  });
});

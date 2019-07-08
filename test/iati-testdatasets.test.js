'use strict';

var chai = require('chai');
var chaiHttp = require('chai-http');
var api = require('../server/server');
var version = require('../server/config.local');
var config = require('../common/config/google-storage');

var should = chai.should();

chai.use(chaiHttp);

var fs = require('fs');
var tmpdir = './test/tmp/'; // should match /server/datasources.test.json

describe('Work with test files', function() {
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
        res.should.have.status(200);
        done();
      });
  });

  it('should handle uploading a small file', function(done) {
    chai.request(api)
      .post(version.restApiRoot + '/iati-testfiles/' + config.container_upload.source + '/upload')
      .attach('file', fs.readFileSync('./test/fixtures/file-small.xml'),
              'file-small.xml')
      .end(function(err, res) {
        res.should.have.status(200);
        done();
      });
  });

  it('should handle uploading a file as a dataset', function(done) {
    chai.request(api)
      .post(version.restApiRoot + '/iati-testdatasets/upload')
      .attach('file', fs.readFileSync('./test/fixtures/file-small.xml'),
              'file-small.xml')
      .end(function(err, res) {
        res.should.have.status(200);
        done();
      });
  });
});

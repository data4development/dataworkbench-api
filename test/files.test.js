'use strict';

var chai = require('chai');
var chaiHttp = require('chai-http');
var api = require('../server/server');
var version = require('../server/config.local');
var config = require('../common/config/google-storage');

var should = chai.should();

chai.use(chaiHttp);

var fs = require('fs');
var tmpdir = './test/tmp/';

describe('Work with files', function() {
  before(function() {
    config.container_public.enum.forEach((bucket) => {
      if (!fs.existsSync(tmpdir + config.container_public[bucket])) {
        fs.mkdirSync(tmpdir + config.container_public[bucket]);
      }
    });
  });

  after(function() {
  });

  it('should have the iati-files endpoint', function(done) {
    chai.request(api)
      .get(version.restApiRoot + '/iati-files/')
      .end(function(err, res) {
        res.should.have.status(200);
        done();
      });
  });

  it('should have the iati-files container endpoint', function(done) {
    chai.request(api)
      .get(version.restApiRoot + '/iati-files/' + config.container_public.source + '/files')
      .end(function(err, res) {
        res.should.have.status(200);
        done();
      });
  });

  it('should handle uploading a small file', function(done) {
    chai.request(api)
      .post(version.restApiRoot + '/iati-files/file/source')
      .attach('file', fs.readFileSync('./test/fixtures/file-small.xml'),
              'file-small.xml')
      .end(function(err, res) {
        res.should.have.status(200);
        done();
      });
  });

  it('should handle uploading a large file', function(done) {
    chai.request(api)
      .post(version.restApiRoot + '/iati-files/file/source')
      .attach('file', fs.readFileSync('./test/fixtures/file-large.xml'),
              'file-large.xml')
      .end(function(err, res) {
        res.should.have.status(200);
        done();
      });
  });
});

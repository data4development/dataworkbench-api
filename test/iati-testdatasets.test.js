'use strict';

var chai = require('chai');
var chaiHttp = require('chai-http');
var api = require('../server/server');

var should = chai.should();

chai.use(chaiHttp);

var fs = require('fs');
var tmpdir = './test/tmp/';
var container = 'test-files';

describe('Work with test files', function() {
  before(function() {
    if (!fs.existsSync(tmpdir + container)) {
	  fs.mkdirSync(tmpdir + container);
    }
  });

  after(function() {
  });

  it('should have the iati-testdatasets endpoint', function(done) {
    chai.request(api)
      .get('/api/iati-testdatasets/')
      .end(function(err, res) {
        res.should.have.status(200);
        done();
      });
  });

  it('should handle uploading a small file', function(done) {
    chai.request(api)
      .post('/api/iati-testdatasets/upload')
      .attach('file', fs.readFileSync('./test/fixtures/file-small.xml'),
              'file-small.xml')
      .end(function(err, res) {
        res.should.have.status(200);
        done();
      });
  });
});

'use strict';

var chai = require('chai');
var chaiHttp = require('chai-http');
var api = require('../server/server');
var version = require('../server/config.sandbox');

var should = chai.should();

chai.use(chaiHttp);

describe('When checking the API', function() {
  it('should have the API available', function(done) {
    chai.request(api)
      .get('/')
      .end(function(err, res) {
        res.should.have.status(200);
        done();
      });
  });

  it('should have the API explorer available', function(done) {
    chai.request(api)
      .get('/explorer')
      .end(function(err, res) {
        res.should.have.status(200);
        done();
      });
  });

  it('should have the ping endpoint available', function(done) {
    chai.request(api)
      .get(version.restApiRoot + '/ping')
      .end(function(err, res) {
        res.should.have.status(200);
        done();
      });
  });
});

'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const api = require('../../server/server');
const version = require('../../server/config.local');
const config = require('../../common/config/google-storage');

var should = chai.should();

chai.use(chaiHttp);

describe('When working with publishers', function() {
  it('should be able to get the current publishers', function(done) {
    chai.request(api)
      .get(version.restApiRoot + '/iati-publishers/current')
      .end(function(err, res) {
        res.should.have.status(200);
        done();
      });
  });
});

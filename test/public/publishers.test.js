'use strict';

const api = require('../../server/server');
const version = require('../../server/config.local');

describe('When working with publishers', () => {
  it('should be able to get the current publishers', (done) => {
    chai.request(api)
      .get(`${version.restApiRoot}/iati-publishers/current`)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

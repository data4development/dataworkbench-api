'use strict';

console.log(
  `Type of API "${process.env.API_TYPE === 'public' ? 'public' : 'private'}"`
);

const api = require('../server/server');
const version = require('../server/config.local');

describe('When checking the API', () => {
  it('should be in the test environment', (done) => {
    process.env.NODE_ENV.should.equal('test');
    done();
  });

  it('should have the API available', (done) => {
    chai.request(api)
      .get('/')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it('should have the API explorer available', (done) => {
    chai.request(api)
      .get('/explorer')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it('should have the ping endpoint available', (done) => {
    chai.request(api)
      .get(`${version.restApiRoot}/ping`)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

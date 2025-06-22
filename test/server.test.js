const request = require('supertest');
const { expect } = require('chai');

const app = require('../server');

describe('Server routes', function() {
  it('GET / should return index.html', function(done) {
    request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200, done);
  });

  it('GET /api/pages should return detected pages', function(done) {
    request(app)
      .get('/api/pages')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.an('array').that.is.not.empty;
        expect(res.body.some(p => p.name === 'BMR')).to.be.true;
        done();
      });
  });

  it('should serve static files for a detected page', function(done) {
    request(app)
      .get('/BMR/index.html')
      .expect('Content-Type', /html/)
      .expect(200, done);
  });
});

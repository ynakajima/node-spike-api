'use strict';
require('mocha');
var should = require('chai').should();
var nock = require('nock');
var SpikeAPI = require('../lib/spike-api').SpikeAPI;
var Product = require('../lib/spike-api').Product;
var products = [
  new Product({
    id: '0001',
    title: 'product A',
    description: 'desc',
    price: 1000,
    currency: 'JPY',
    count: 1,
    stock: 100
  })
];

var isActualTest = typeof process.env.ACTUAL_TEST !== 'undefined';
var testConfig = isActualTest ?
    require('./config.json') :
    {
      secretKey: 'sk_test_xxxxxxxxxxxxxxxxx',
      cardToken: 'tok_xxxxxxxxxxxxxxxxxxxx'
    };

// test
describe('SpikeAPI', function() {

  describe('Constructor', function() {

    describe('new SpikeAPI();', function() {

      it('should create new instance.', function(){
        var client = new SpikeAPI();
        client.should.to.be.an.instanceof(SpikeAPI);
      });

    });

    describe('#postCharge()', function() {

      it('should return an error when invalid arguments.', function(done) {
        var client = new SpikeAPI();
        client.postCharge('', function(err) {
          err.should.to.be.an.instanceof(Error);
          done();
        });
      });

      it('should throw an error ' +
           'when invalid arguments and no callback.', function() {
        var client = new SpikeAPI();
        client.postCharge.should.throw(Error);
      });

      it('should return an error when invalid secret key.', function(done) {
        if (!isActualTest) {
          nock('https://api.spike.cc/')
            .post('/v1/charges')
            .reply(401, {}, {
              Status: '401 Unauthorized'
            });
        }
        var client = new SpikeAPI();
        client.postCharge('JPY', 1080, testConfig.cardToken, products,
                          function(err, result) {
          err.should.to.be.an.instanceof(Error);
          err.should.to.have.property('message', '401 Unauthorized');
          done();
        });
      });

      it('should return an error when invalid card token.', function(done) {
        if (!isActualTest) {
          nock('https://api.spike.cc/')
            .post('/v1/charges')
            .reply(400, {
              error: {
                type: 'invalid_request_error'
              }
            }, {
              Status: '400 Bad Request'
            });
        }
        var client = new SpikeAPI({
          secretKey: testConfig.secretKey
        });
        client.postCharge('JPY', 1080, '', products,
                          function(err, result) {
          err.should.to.be.an.instanceof(Error);
          err.should.to.have.property('message', '400 Bad Request');
          result.should.to.have.property('error');
          result.error.should.to.have.property(
            'type', 'invalid_request_error');
          done();
        });
      });

      it('should create a new charge ' +
         'when valid arguments.', function(done) {
        if (!isActualTest) {
          nock('https://api.spike.cc/')
            .post('/v1/charges')
            .reply(201, {
              'id': '20150213-090658-xxxxxxxxx',
              'object': 'charge',
              'created': 1423818418,
              'livemode': false,
              'paid': true,
              'amount': 1080,
              'currency': 'JPY',
              'refunded': false,
              'card': {},
              'captured': true,
              'refunds': [],
              'balance_transaction': '',
              'failure_message': null,
              'failure_code': null,
              'amount_refunded': null,
              'customer': null,
              'invoice': null,
              'description': null,
              'dispute': null,
              'metadata': {},
              'statement_description': null
            });
        }
        var client = new SpikeAPI({
          secretKey: testConfig.secretKey
        });
        client.postCharge('JPY', 1080, testConfig.cardToken, products,
                          function(err, result) {
          should.equal(err, null);
          result.should.to.be.a('object');
          result.should.to.have.property('id');
          result.should.to.have.property('object', 'charge');
          result.should.to.have.property('created');
          result.should.to.have.property('livemode');
          result.should.to.have.property('paid', true);
          result.should.to.have.property('captured', true);
          result.should.to.have.property('captured', true);
          result.should.to.have.property('amount', 1080);
          result.should.to.have.property('currency', 'JPY');
          result.should.to.have.property('refunded', false);
          result.should.to.have.property('amount_refunded', null);
          result.should.to.have.property('refunds');
          done();
        });
      });

    });

  });

});


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
      cardToken: 'tok_xxxxxxxxxxxxxxxxxxxx',
      chargeID: '20150213-090658-xxxxxxxxx'
    };

// test
describe('SpikeAPI', function() {

  /**
   * constructor
   */
  describe('SpikeAPI();', function() {

    it('should create new instance.', function(){
      var client = new SpikeAPI();
      client.should.to.be.an.instanceof(SpikeAPI);
    });

  });

  
  /**
   * SpileAPI#postCharge()
   */
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
                        function(err) {
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


  /**
   * SpileAPI#getCharge()
   */
  describe('#getCharge()', function() {

    it('should return an error when invalid arguments.', function(done) {
      var client = new SpikeAPI();
      client.getCharge('', function(err) {
        err.should.to.be.an.instanceof(Error);
        done();
      });
    });

    it('should throw an error ' +
         'when invalid arguments and no callback.', function() {
      var client = new SpikeAPI();
      client.getCharge.should.throw(Error);
    });

    it('should return an error when invalid secret key.', function(done) {
      if (!isActualTest) {
        nock('https://api.spike.cc/')
          .get('/v1/charges/' + testConfig.chargeID)
          .reply(401, {}, {
            Status: '401 Unauthorized'
          });
      }
      var client = new SpikeAPI();
      client.getCharge(testConfig.chargeID, function(err) {
        err.should.to.be.an.instanceof(Error);
        err.should.to.have.property('message', '401 Unauthorized');
        done();
      });
    });

    it('should return an error when invalid carge id.', function(done) {
      var invalidChargeID = 'xxxx';
      if (!isActualTest) {
        nock('https://api.spike.cc/')
          .get('/v1/charges/' + invalidChargeID)
          .reply(400, {
            error: {
              type: 'invalid_request_error'
            }
          }, {
            Status: '400 Bad Request'
          });
      }
      var client = new SpikeAPI({secretKey: testConfig.secretKey});
      client.getCharge(invalidChargeID, function(err, result) {
        err.should.to.be.an.instanceof(Error);
        err.should.to.have.property('message', '400 Bad Request');
        result.should.to.have.property('error');
        result.error.should.to.have.property(
          'type', 'invalid_request_error');
        done();
      });
    });

    it('should return charge info when valid arguments.', function(done) {
      if (!isActualTest) {
        nock('https://api.spike.cc/')
          .get('/v1/charges/' + testConfig.chargeID)
          .reply(200, {
            id: testConfig.chargeID,
            object: 'charge',
            created: 1423818584,
            livemode: false,
            paid: true,
            captured: true,
            amount: 1080,
            currency: 'JPY',
            refunded: false,
            amount_refunded: null,
            refunds: []
          });
      }
      var client = new SpikeAPI({secretKey: testConfig.secretKey});
      client.getCharge(testConfig.chargeID, function(err, result) {
        should.equal(err, null);
        result.should.to.be.a('object');
        result.should.to.have.property('id', testConfig.chargeID);
        result.should.to.have.property('object', 'charge');
        result.should.to.have.property('created', 1423818584);
        result.should.to.have.property('livemode', false);
        result.should.to.have.property('paid', true);
        result.should.to.have.property('amount', 1080);
        result.should.to.have.property('captured', true);
        result.should.to.have.property('currency', 'JPY');
        result.should.to.have.property('refunded', false);
        result.should.to.have.property('amount_refunded', null);
        done();
      });
    });
  });


  /**
   * SpileAPI#refundCharge()
   */
  describe('#refundCharge()', function() {

    it('should return an error when invalid arguments.', function(done) {
      var client = new SpikeAPI();
      client.refundCharge('', function(err) {
        err.should.to.be.an.instanceof(Error);
        done();
      });
    });

    it('should throw an error ' +
         'when invalid arguments and no callback.', function() {
      var client = new SpikeAPI();
      client.refundCharge.should.throw(Error);
    });

    it('should return an error when invalid secret key.', function(done) {
      if (!isActualTest) {
        nock('https://api.spike.cc/')
          .post('/v1/charges/xxxxx/refund')
          .reply(401, {}, {
            Status: '401 Unauthorized'
          });
      }
      var client = new SpikeAPI();
      client.refundCharge('xxxxx', function(err) {
        err.should.to.be.an.instanceof(Error);
        err.should.to.have.property('message', '401 Unauthorized');
        done();
      });
    });

    it('should return an error when invalid charge id.', function(done) {
      var invalidID = 'invalid-id';
      if (!isActualTest) {
        nock('https://api.spike.cc/')
          .post('/v1/charges/' + invalidID + '/refund')
          .reply(400, {
            error: {
              type: 'invalid_request_error'
            }
          }, {
            Status: '400 Bad Request'
          });
      }
      var client = new SpikeAPI({secretKey: testConfig.secretKey});
      client.refundCharge(invalidID, function(err, result) {
        err.should.to.be.an.instanceof(Error);
        err.should.to.have.property('message', '400 Bad Request');
        result.should.to.have.property('error');
        result.error.should.to.have.property(
          'type', 'invalid_request_error');
        done();
      });
    });

    it('should to refund the charge of the specified ID ' +
       'when valid arguments.', function(done) {
      // Create a new charge for refund.
      if (!isActualTest) {
        nock('https://api.spike.cc/')
          .post('/v1/charges')
          .reply(201, {
            'id': '20150213-090658-xxxxxxxxx',
            'created': 1423818418,
            'paid': true,
            'refunded': false
          });
      }
      var client = new SpikeAPI({secretKey: testConfig.secretKey});
      client.postCharge('JPY', 1080, testConfig.cardToken, products,
          function(err, result) {
        if (err) {
          return done(err);
        }

        // test #refundCharge()
        var chargeID = result.id;
        if (!isActualTest) {
          nock('https://api.spike.cc/')
            .post('/v1/charges/' + chargeID + '/refund')
            .reply(200, {
              id: chargeID,
              object: 'charge',
              paid: false,
              captured: true,
              amount: 1080,
              currency: 'JPY',
              refunded: true,
              refunds: [
                {
                  object: 'refund',
                  created: 1400220648,
                  amount: 1080,
                  currency: 'JPY'
                }
              ]
            });
        }

        var client = new SpikeAPI({secretKey: testConfig.secretKey});
        client.refundCharge(chargeID, function(err, result) {
          should.equal(err, null);
          result.should.to.have.property('id', chargeID);
          result.should.to.have.property('object', 'charge');
          result.should.to.have.property('paid', false);
          result.should.to.have.property('captured', true);
          result.should.to.have.property('refunded', true);
          result.should.to.have.property('refunds');
          result.refunds[0].should.to.have.property('object', 'refund');
          result.refunds[0].should.to.have.property('amount', 1080);
          done();
        });
      });
    });
  });


  /**
   * SpileAPI#getChargeList()
   */
  describe('#getChargeList()', function() {

    it('should return an error when invalid arguments.', function(done) {
      var client = new SpikeAPI();
      client.getChargeList('', function(err) {
        err.should.to.be.an.instanceof(Error);
        done();
      });
    });

    it('should throw an error ' +
         'when invalid arguments and no callback.', function() {
      var client = new SpikeAPI();
      client.getChargeList.should.throw(Error);
    });

    it('should return an error when invalid secret key.', function(done) {
      if (!isActualTest) {
        nock('https://api.spike.cc/')
          .get('/v1/charges?limit=10')
          .reply(401, {}, {
            Status: '401 Unauthorized'
          });
      }
      var client = new SpikeAPI();
      client.getChargeList(function(err) {
        err.should.to.be.an.instanceof(Error);
        err.should.to.have.property('message', '401 Unauthorized');
        done();
      });
    });

    it('should return an error when invalid limit.', function(done) {
      if (!isActualTest) {
        nock('https://api.spike.cc/')
          .get('/v1/charges?limit=200')
          .reply(400, {
            error: {
              type: 'invalid_request_error'
            }
          }, {
            Status: '400 Bad Request'
          });
      }
      var client = new SpikeAPI({secretKey: testConfig.secretKey});
      client.getChargeList(200, function(err, result) {
        err.should.to.be.an.instanceof(Error);
        err.should.to.have.property('message', '400 Bad Request');
        result.should.to.have.property('error');
        result.error.should.to.have.property(
          'type', 'invalid_request_error');
        done();
      });
    });

    it('should return charge info when valid arguments.', function(done) {
      if (!isActualTest) {
        nock('https://api.spike.cc/')
          .get('/v1/charges?limit=1')
          .reply(200, {
            'object': 'list',
            'url': '/v1/charges',
            'has_more': true,
            'data': [
              {id: 'xxxxxxx1', object: 'charge'},
              {id: 'xxxxxxx2', object: 'charge'}
            ]
          });
      }
      var client = new SpikeAPI({secretKey: testConfig.secretKey});
      client.getChargeList(1, function(err, result) {
        should.equal(err, null);
        result.should.to.be.a('object');
        result.should.to.have.property('object', 'list');
        result.should.to.have.property('url', '/v1/charges');
        result.should.to.have.property('has_more', true);
        result.data.should.to.have.length(2);
        result.data[0].should.to.have.property('object', 'charge');
        result.data[1].should.to.have.property('object', 'charge');
        done();
      });
    });
  });

});


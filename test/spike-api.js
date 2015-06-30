'use strict';
require('mocha');
var should = require('chai').should();
var nock = require('nock');
var Promise = require('bluebird');
var _ = require('lodash');
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
      chargeID: '20150213-090658-xxxxxxxxx',
      cardNumber: 4444333322221111,
      cardExpMonth: 1,
      cardExpYear: (new Date()).getFullYear() + 1,
      cardCvc: 111,
      cardName: 'KATSUAKI SATO'
    };


/**
 * Product
 */
describe('Product', function() {
  var product = null;

  beforeEach(function() {
    product = new Product();
  });

  /**
   * constructor
   */
  describe('constructor', function() {

    it('should create new instance.', function() {
      product.should.to.be.an.instanceof(Product);
      product.should.to.have.property('attrs');
      product.attrs.should.to.have.property('id', '');
      product.attrs.should.to.have.property('title', '');
      product.attrs.should.to.have.property('description', '');
      product.attrs.should.to.have.property('price', 0);
      product.attrs.should.to.have.property('currency', '');
      product.attrs.should.to.have.property('count', 0);
      product.attrs.should.to.have.property('stock', 0);
    });

  });

  /**
   * Product#set()
   */
  describe('#set()', function() {

    it('should set the value of the specified attribute name.', function() {
      var value = (Math.random(100) * 2000).toString(10);
      product.set.should.to.be.a('function');
      product.set('id', value);
      product.attrs.should.to.have.property('id', value);
    });

    it('should not set a value of on the missing attribute.', function() {
      var value = (Math.random(100) * 2000).toString(10);
      product.set('missing-attribute', value);
      should.not.exist(product.attrs['missing-attribute']);
    });

  });

  /**
   * Product#get()
   */
  describe('#get()', function() {

    it('should return the value of the specified attribute name.', function() {
      var value = (Math.random(100) * 2000).toString(10);
      product.attrs.id = value;

      var id = product.get('id', value);
      product.get.should.to.be.a('function');
      id.should.to.be.equal(value);
    });

  });

});


/**
 * SpikeAPI
 */
describe('SpikeAPI', function() {

  /**
   * constructor
   */
  describe('constructor', function() {

    it('should create new instance.', function() {
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
      client.postCharge({
        currency: 10  
      }, function(err) {
        err.should.to.be.an.instanceof(Error);
        err.message.should.to.equal('Invalid argments.');
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
      client.postCharge({
        currency: 'JPY',
        amount: 1080,
        card: testConfig.cardToken,
        products: products
      }, function(err) {
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
      client.postCharge({
        currency: 'JPY',
        amount: 1080,
        card: '',
        products: products
      }, function(err, result) {
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
      client.postCharge({
        currency: 'JPY',
        amount: 1080,
        card: testConfig.cardToken,
        products: products
      }, function(err, result) {
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
      client.getCharge(123, function(err) {
        err.should.to.be.an.instanceof(Error);
        err.message.should.to.equal('Invalid argments.');
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
        result.should.to.have.property('created');
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
      client.refundCharge(123, function(err) {
        err.should.to.be.an.instanceof(Error);
        err.message.should.to.equal('Invalid argments.');
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
      client.postCharge({
        currency: 'JPY',
        amount: 1080,
        card: testConfig.cardToken,
        products: products
      }, function(err, result) {
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
          .get('/v1/charges?limit=2')
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
      client.getChargeList(2, function(err, result) {
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


  /**
   * SpileAPI#postToken()
   */
  describe('#postToken()', function() {

    it('should return an error when invalid arguments.', function(done) {
      var client = new SpikeAPI();
      client.postToken({
        'card[number]': 'card number'
      }, function(err) {
        err.should.to.be.an.instanceof(Error);
        err.message.should.to.equal('Invalid argments.');
        done();
      });
    });

    it('should throw an error ' +
         'when invalid arguments and no callback.', function() {
      var client = new SpikeAPI();
      client.postToken.should.throw(Error);
    });

    it('should return an error when invalid secret key.', function(done) {
      if (!isActualTest) {
        nock('https://api.spike.cc/')
          .post('/v1/tokens')
          .reply(401, {}, {
            Status: '401 Unauthorized'
          });
      }

      var client = new SpikeAPI();
      client.postToken({
        'card[number]': testConfig.cardNumber,
        'card[exp_month]': testConfig.cardExpMonth,
        'card[exp_year]': testConfig.cardExpYear,
        'card[cvc]': testConfig.cardCvc,
        'card[name]': testConfig.cardName,
        'currency': 'JPY',
        'email': 'test@example.com'
      }, function(err) {
        err.should.to.be.an.instanceof(Error);
        err.should.to.have.property('message', '401 Unauthorized');
        done();
      });
    });

    it('should return an error when invalid arguments.', function(done) {
      var client = new SpikeAPI({
        secretKey: testConfig.secretKey
      });

      var cardData = {
        'card[number]': testConfig.cardNumber,
        'card[exp_month]': testConfig.cardExpMonth,
        'card[exp_year]': testConfig.cardExpYear,
        'card[cvc]': testConfig.cardCvc,
        'card[name]': testConfig.cardName,
        'currency': 'JPY'
        // email is not mandatory
      };

      var postToken = function (data){
        return new Promise(function (resolve){

          if (!isActualTest) {
            nock('https://api.spike.cc/')
              .post('/v1/tokens')
              .reply(400, {
                error: {
                  type: 'invalid_request_error'
                }
              }, {
                Status: '400 Bad Request'
              });
          }

          client.postToken(data, function(err, result) {
            err.should.to.be.an.instanceof(Error);
            err.should.to.have.property('message', '400 Bad Request');
            result.should.to.have.property('error');
            result.error.should.to.have.property(
              'type', 'invalid_request_error');

            resolve();
          });
        });
      };

      var promiseArray = Object.keys(cardData).map(function (key) {
        var cloned = _.clone(cardData);
        delete cloned[key];
        return postToken(cloned);
      });

      Promise.all(promiseArray)
      .then(function (){
        done();
      });

    });


    it('should return an error when invalid card number.', function(done) {
      if (!isActualTest) {
        nock('https://api.spike.cc/')
          .post('/v1/tokens')
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
      client.postToken({
        'card[number]': testConfig.cardNumber * 10000,
        'card[exp_month]': testConfig.cardExpMonth,
        'card[exp_year]': testConfig.cardExpYear,
        'card[cvc]': testConfig.cardCvc,
        'card[name]': testConfig.cardName,
        'currency': 'JPY',
        'email': 'test@example.com'
      }, function(err, result) {
        err.should.to.be.an.instanceof(Error);
        err.should.to.have.property('message', '400 Bad Request');
        result.should.to.have.property('error');
        result.error.should.to.have.property(
          'type', 'invalid_request_error');
        done();
      });
    });

    it('should return an error when past expire year.', function(done) {
      if (!isActualTest) {
        nock('https://api.spike.cc/')
          .post('/v1/tokens')
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
      client.postToken({
        'card[number]': testConfig.cardNumber,
        'card[exp_month]': testConfig.cardExpMonth,
        'card[exp_year]': (new Date()).getFullYear() - 1,
        'card[cvc]': testConfig.cardCvc,
        'card[name]': testConfig.cardName,
        'currency': 'JPY',
        'email': 'test@example.com'
      }, function(err, result) {
        err.should.to.be.an.instanceof(Error);
        err.should.to.have.property('message', '400 Bad Request');
        result.should.to.have.property('error');
        result.error.should.to.have.property(
          'type', 'invalid_request_error');
        done();
      });
    });

    it('should create a new token ' +
       'when valid arguments.', function(done) {
      if (!isActualTest) {
        nock('https://api.spike.cc/')
          .post('/v1/tokens')
          .reply(201, {
            'id': 'tok_ULkaZUOpAcAyIyGtFSEnqI2b',
            'object': 'token',
            'livemode': false,
            'created': 1426059219,
            'type': 'card',
            'currency': 'JPY',
            'source': {
              'object': 'card',
              'last4': String(testConfig.cardNumber).slice(-4),
              'brand': 'Visa',
              'exp_month': testConfig.cardExpMonth,
              'exp_year': testConfig.cardExpYear,
              'name': testConfig.cardName
            }
          });
      }
      var client = new SpikeAPI({
        secretKey: testConfig.secretKey
      });
      client.postToken({
        'card[number]': testConfig.cardNumber,
        'card[exp_month]': testConfig.cardExpMonth,
        'card[exp_year]': testConfig.cardExpYear,
        'card[cvc]': testConfig.cardCvc,
        'card[name]': testConfig.cardName,
        'currency': 'JPY',
        'email': 'test@example.com'
      }, function(err, result) {
        should.equal(err, null);
        result.should.to.be.a('object');
        result.should.to.have.property('id');
        result.should.to.have.property('object', 'token');
        result.should.to.have.property('created');
        result.should.to.have.property('livemode');
        result.should.to.have.property('type', 'card');
        //result.should.to.have.property('currency', 'JPY');
        result.source.should.be.a('object');
        result.source.should.to.have.property('object', 'card');
        result.source.should.to.have.property('last4', 
          String(testConfig.cardNumber).slice(-4));
        result.source.should.to.have.property('brand');
        result.source.should.to.have.property('exp_month', 
          testConfig.cardExpMonth);
        result.source.should.to.have.property('exp_year', 
          testConfig.cardExpYear);
        result.source.should.to.have.property('name', testConfig.cardName);
        done();
      });
    });

  });


  /**
   * SpileAPI#getToken()
   */
  describe('#getToken()', function() {

    it('should return an error when invalid arguments.', function(done) {
      var client = new SpikeAPI();
      client.getToken(123, function(err) {
        err.should.to.be.an.instanceof(Error);
        err.message.should.to.equal('Invalid argments.');
        done();
      });
    });

    it('should throw an error ' +
         'when invalid arguments and no callback.', function() {
      var client = new SpikeAPI();
      client.getToken.should.throw(Error);
    });

    it('should return an error when invalid secret key.', function(done) {
      if (!isActualTest) {
        nock('https://api.spike.cc/')
          .get('/v1/tokens/' + testConfig.cardToken)
          .reply(401, {}, {
            Status: '401 Unauthorized'
          });
      }
      var client = new SpikeAPI();
      client.getToken(testConfig.cardToken, function(err) {
        err.should.to.be.an.instanceof(Error);
        err.should.to.have.property('message', '401 Unauthorized');
        done();
      });
    });

    it('should return an error when invalid token id.', function(done) {
      var invalidTokenID = 'xxxx';
      if (!isActualTest) {
        nock('https://api.spike.cc/')
          .get('/v1/tokens/' + invalidTokenID)
          .reply(400, {
            error: {
              type: 'invalid_request_error'
            }
          }, {
            Status: '400 Bad Request'
          });
      }
      var client = new SpikeAPI({secretKey: testConfig.secretKey});
      client.getToken(invalidTokenID, function(err, result) {
        err.should.to.be.an.instanceof(Error);
        err.should.to.have.property('message', '400 Bad Request');
        result.should.to.have.property('error');
        result.error.should.to.have.property(
          'type', 'invalid_request_error');
        done();
      });
    });

    it('should return token info when valid arguments.', function(done) {
      if (!isActualTest) {
        nock('https://api.spike.cc/')
          .get('/v1/tokens/' + testConfig.cardToken)
          .reply(200, {
            id: testConfig.cardToken,
            object: 'token',
            livemode: false,
            created: 1426059219,
            type: 'card',
            currency: 'JPY',
            source: {}
          });
      }
      var client = new SpikeAPI({secretKey: testConfig.secretKey});
      client.getToken(testConfig.cardToken, function(err, result) {
        should.equal(err, null);
        result.should.to.be.a('object');
        result.should.to.have.property('id', testConfig.cardToken);
        result.should.to.have.property('object', 'token');
        result.should.to.have.property('created');
        result.should.to.have.property('livemode', false);
        result.should.to.have.property('type', 'card');
        //result.should.to.have.property('currency', 'JPY');
        result.source.should.to.be.a('object');
        done();
      });
    });
  });


  /**
   * Spike#_request()
   */
  describe('#_request()', function() {

    it('should return error when not connect to the network.', function(done) {
      nock.disableNetConnect();
      var url = 'https://api.spike.cc/';
      var client = new SpikeAPI({secretKey: testConfig.secretKey});
      var option = client.requestDefaults;
      client._request('get', url, option, function(err) {
        err.should.to.be.an.instanceof(Error);
        done();
        nock.enableNetConnect();
      });
    });
  });

});


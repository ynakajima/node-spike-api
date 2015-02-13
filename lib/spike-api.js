'use strict';
var _ = require('lodash');
var request = require('request');
var url = require('url');
var path = require('path');
var VERSION = require('../package.json').version;
var REST_BASE_URL = 'https://api.spike.cc/v1/';

/**
 * SpikeAPI
 */
function SpikeAPI(options) {
  this.options = _.assign({
    secretKey: '',
    publishableKey: ''
  }, options);

  this.requestDefaults = {
    auth: {
      user: this.options.secretKey,
      pass: ''
    },
    headers: {
      'Accept': '*/*',
      'Connection': 'close',
      'User-Agent': 'node-spike-api/' + VERSION
    },
    json: true
  };
}

/**
 * Create a new charge by REST API.
 * @param {string} currency Currency billing amount. ['USD'|'JPY']
 * @param {number} amount Amount of the billing.
 * @param {string} card Token that has been acquired in SPIKE Checkout.
 * @param {array} products Array of Product instance for billing.
 * @param {function} callback function(err, result)
 */
SpikeAPI.prototype.postCharge = function(
  currency, amount, card, products, callback
) {
  if (
      arguments.length !== 5 ||
      !_.isString(currency) ||
      !_.isNumber(amount) ||
      !_.isString(card) ||
      !_.isArray(products) ||
      !_.isFunction(callback)
  ) {
    _.each(arguments, function(arg) {
      if (_.isFunction(arg)) {
        callback = arg;
      }
    });

    var err = new Error('Invalid argments.');

    if (_.isFunction(callback)) {
      return callback(err);
    } else {
      throw Error(err);
    }
  }

  // api url
  var apiURL = url.resolve(REST_BASE_URL, 'charges');

  // create form data
  var formData = {
    amount: amount,
    currency: currency,
    card: card,
    products: JSON.stringify(products)
  };

  var options = _.assign(this.requestDefaults, {
    form: formData
  });

  // post API
  request.post(apiURL, options, function(err, res, body) {
    if (err) {
      return callback(err);
    }
    if (res.statusCode >= 400) {
      return callback(new Error(res.headers.status), body);
    }
    callback(null, body);
  });

};

/**
 * Product
 */
function Product(attrs) {
  this.attrs = _.assign({
    id: '',
    title: '',
    description: '',
    language: 'EN',
    price: 0,
    currency: '',
    count: 0,
    stock: 0
  }, attrs);
}

/**
 * getter
 * @param {string} attr Name of attribute.
 * @returns {stirng|number} Value of attribute.
 */
Product.prototype.get = function(attr) {
  return this.attrs[attr];
};

/**
 * setter
 * @param {string} attr Name of attribute.
 * @param {string|number} value Value of attribute.
 */
Product.prototype.set = function(attr, value) {
  if (!_.isUndefined(this.attrs[attr])) {
    this.attrs[attr] = value;
  }
};

/**
 * return JSON Object
 * @returns {object} JSON Object
 */
Product.prototype.toJSON = function() {
  return this.attrs;
};


// exports
module.exports = {
  SpikeAPI: SpikeAPI,
  Product: Product
};

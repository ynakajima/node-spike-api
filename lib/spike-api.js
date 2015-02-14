'use strict';
var _ = require('lodash');
var request = require('request');
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
  // validate argments
  var isValid = _validateArgs([
    'String', 'Number', 'String', 'Array', 'Function'
  ], arguments);

  if (isValid !== true) {
    return isValid.callback(isValid.err);
  }
  
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
  request.post(REST_BASE_URL + 'charges', options, function(err, res, body) {
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
 * Get a charge info by REST API.
 * @param {string} id Charge ID.
 * @param {function} callback function(err, result)
 */
SpikeAPI.prototype.getCharge = function(id, callback) {
  // validate argments
  var isValid = _validateArgs([
    'String', 'Function'
  ], arguments);

  if (isValid !== true) {
    return isValid.callback(isValid.err);
  }

  var options = this.requestDefaults;

  // get API
  request.get(REST_BASE_URL + 'charges/' + id, options,
      function(err, res, body) {
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
 * Refund the charge of specified ID by REST API.
 * @param {string} id charge id.
 * @param {function} callback function(err, result)
 */
SpikeAPI.prototype.refundCharge = function(id, callback) {
  // validate argments
  var isValid = _validateArgs([
    'String', 'Function'
  ], arguments);

  if (isValid !== true) {
    return isValid.callback(isValid.err);
  }

  // api url
  var apiURL = REST_BASE_URL + 'charges/' + id + '/refund';
  var options = this.requestDefaults;

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
 * Get a charge list by REST API.
 * @param {number} limit Acquisition number of list.
 * @param {function} callback function(err, result)
 */
SpikeAPI.prototype.getChargeList = function(limit, callback) {
  // validate argments
  if (_.isFunction(limit)) {
    callback = limit;
    limit = 10;
  }
  var isValid = _validateArgs([
    'Number', 'Function'
  ], arguments, 1);

  if (isValid !== true) {
    return isValid.callback(isValid.err);
  }
  
  var options = this.requestDefaults;

  // get API
  request.get(REST_BASE_URL + 'charges?limit=' + limit, options,
      function(err, res, body) {
    if (err) {
      return callback(err);
    }
    if (res.statusCode >= 400) {
      return callback(new Error(res.headers.status), body);
    }
    callback(null, body);
  });

};

// validate argments
function _validateArgs(argTypes, args, minArgs) {
  var isInvalid = false;
  minArgs = _.isNumber(minArgs) ? minArgs : argTypes.length;

  if (args.length < minArgs) {
    return _returnError(args);
  }

  for(var i = 0, l = argTypes.length; i < l; i++) {
    var argType = argTypes[i];
    var arg = args[i];
    if (args.length === argTypes.length && !_['is' + argType](arg)) {
      isInvalid = true;
      break;
    }
  }

  if (isInvalid) {
    return _returnError(args);
  } else {
    return true;
  }
}

function _returnError(args) {
  var err = new Error('Invalid argments.');
  var callback = null;

  _.each(args, function(arg) {
    if (_.isFunction(arg)) {
      callback = arg;
    }
  });

  if (_.isFunction(callback)) {
    return {
      callback: callback,
      err: err
    };
  } else {
    throw err; 
  }
}


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


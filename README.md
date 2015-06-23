# SPIKE REST API for Node.js
An asynchronous client library for the [SPIKE](https://spike.cc/) REST API.

[![Build Status](http://img.shields.io/travis/ynakajima/node-spike-api/master.svg?style=flat)](http://travis-ci.org/ynakajima/node-spike-api) [![Code Climate](http://img.shields.io/codeclimate/github/ynakajima/node-spike-api.svg?style=flat)](https://codeclimate.com/github/ynakajima/node-spike-api) [![coverrage](https://img.shields.io/coveralls/ynakajima/node-spike-api/master.svg?style=flat)](https://coveralls.io/r/ynakajima/node-spike-api) [![npm version](http://img.shields.io/npm/v/spike-api.svg?style=flat)](https://www.npmjs.org/package/spike-api) ![dependencies](http://img.shields.io/david/ynakajima/node-spike-api.svg?style=flat) [![license MIT](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/ynakajima/node-spike-api/blob/master/LICENSE)

```javascript
var SpikeAPI = require('spike-api').SpikeAPI;

var client = new SpikeAPI({
  secretKey: 'YOUR_SECRET_KEY'
});

client.getChargeList(function(err, result) {
  if (!err) {
    console.log(result);
  }
});
```

## Installation

`npm install spike-api`


## Post a new Charge
``POST https://api.spike.cc/v1/charges``

```javascript
var Product = require('spike-api').Product;

// new charge data
var newCharge = {
  currency: 'JPY'; // 'JPY' or 'USD'
  amount: 1080,
  card: 'CARD_TOKEN', // Token that has been acquired in SPIKE Checkout.
  products: 
    new Product({
      id: '0001',
      title: 'product A',
      description: 'desc',
      price: 1000,
      currency: 'JPY',
      count: 1,
      stock: 100
    })
  ]
};

// POST https://api.spike.cc/v1/charges
client.postCharge(newCharge, function(err, result) {
  if (!err) {
    console.log(result);
  }
});
```

#### result example:
```json
{
  "id": "20140609-064331-onjmfi1z5q",
  "object": "charge",
  "created": 1402375175,
  "livemode": false,
  "paid": true,
  "captured": true,
  "amount": 1080,
  "currency": "JPY",
  "refunded": false,
  "amount_refunded": null,
  "refunds": []
}
```

## Get a Charge info
``GET https://api.spike.cc/v1/charges/{CHARGE_ID}``

```javascript
var chargeID = '20140609-064331-onjmfi1z5q';

// GET https://api.spike.cc/v1/charges/{CHARGE_ID}
client.getCharge(chargeID, function(err, result) {
  if (!err) {
    console.log(result);
  }
});
```

#### result example:
```json
{
  "id": "20140609-064331-onjmfi1z5q",
  "object": "charge",
  "created": 1402375175,
  "livemode": false,
  "paid": true,
  "captured": true,
  "amount": 1900,
  "currency": "JPY",
  "refunded": false,
  "amount_refunded": null,
  "refunds": []
}
```

## Refund a Charge
``POST https://api.spike.cc/v1/charges/{CHARGE_ID}/refund``

```javascript
var chargeID = '20140609-064331-onjmfi1z5q';

// POST https://api.spike.cc/v1/charges/{CHARGE_ID}/refund
client.refundCharge(chargeID, function(err, result) {
  if (!err) {
    console.log(result);
  }
});
```

#### result example:
```json
{
  "id": "20140609-064331-onjmfi1z5q",
  "object": "charge",
  "livemode": false,
  "created": 1400220648,
  "paid": false,
  "captured": true,
  "amount": 100,
  "currency": "USD",
  "refunded": true,
  "amount_refunded": 100,
  "refunds": [
    {
      "object": "refund",
      "created": 1400220648,
      "amount": 100,
      "currency": "USD"
    }
  ]
}
```

## Get Charge List
``GET https://api.spike.cc/v1/charges``

```javascript
// Acquisition number of list
var limit = 2;

// GET https://api.spike.cc/v1/charges
client.getChargeList(limit, function(err, result) {
  if (!err) {
    console.log(result);
  }
});
```

#### result example:
```json
{
  "object": "list",
  "url": "/v1/charges",
  "has_more": false,
  "data": [
    {
      "id": "20140609-064331-onjmfi1z5q",
      "object": "charge",
      "created": 1402375175,
      "livemode": false,
      "paid": true,
      "captured": true,
      "amount": 1900,
      "currency": "JPY",
      "refunded": false,
      "amount_refunded": null,
      "refunds": []
    },
	{
      "id": "20140609-064332-xijafi4p6x",
      "object": "charge",
      "created": 1402375275,
      "livemode": false,
      "paid": true,
      "captured": true,
      "amount": 1080,
      "currency": "JPY",
      "refunded": false,
      "amount_refunded": null,
      "refunds": []
    }
  ]
}
```

## POST Token
``POST https://api.spike.cc/v1/tokens``

```javascript
var newCard = {
  'card[number]': 4444333322221111,
  'card[exp_month]': 1,
  'card[exp_year]': 2020,
  'card[cvc]': 111,
  'card[name]': 'KATSUAKI SATO',
  'currency': 'JPY'
};

// POST https://api.spike.cc/v1/charges
client.postToken(cardData, function(err, result) {
  if (!err) {
    console.log(result);
  }
});
```

#### result example:
```json
{ 
  "id": "tok_xEI0RJWqwC3HqO0TQOxoGRgx",
  "object": "token",
  "created": 1435069120,
  "livemode": false,
  "type": 'card',
  "source": 
  { 
    "object": 'card',
    "last4": '1111',
    "brand": 'Visa',
    "exp_month": 1,
    "exp_year": 2020,
    "name": "KATSUAKI SATO" 
  } 
}
```

## GET Token
``GET https://api.spike.cc/v1/tokens/{TOKEN_ID}``

```javascript
// POST https://api.spike.cc/v1/charges
client.getToken(cardToken, function(err, result) {
  if (!err) {
    console.log(result);
  }
});
```

#### result example:
```json
{ 
  "id": "tok_xEI0RJWqwC3HqO0TQOxoGRgx",
  "object": "token",
  "created": 1435069120,
  "livemode": false,
  "type": 'card',
  "source": 
  { 
    "object": 'card',
    "last4": '1111',
    "brand": 'Visa',
    "exp_month": 1,
    "exp_year": 2020,
    "name": "KATSUAKI SATO" 
  } 
}
```


## SPIKE API Reference
https://spike.cc/dashboard/developer/docs/api_reference


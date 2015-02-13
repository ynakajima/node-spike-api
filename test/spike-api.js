'use strict';
require('mocha');
require('chai').should();
var SpikeAPI = require('../lib/spike-api');

describe('SpikeAPI', function() {

  describe('Constructor', function() {

    describe('new SpikeAPI();', function() {

       it('should create new instance.', function(){
        var client = new SpikeAPI();
        client.should.to.be.an.instanceof(SpikeAPI);
      });
    
    });

  });

});


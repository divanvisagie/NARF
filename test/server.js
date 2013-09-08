'use strict';

var nnf = require('../lib/nnf.js'),
    request = require('request');

exports['Server'] = {
  setUp: function( done ) {
    // setup here
    this.nnfServer = nnf.createServer();
    this.nnfServer.listen(8080);

    var router = new nnf.Router({
      path: '/test',
      type: 'text/xml'
    });
    this.nnfServer.addRouter(router);

    this.proto = [
      { name: 'listen' },
      { name: 'close' },
      { name: 'addRouter' }
    ];

    this.instance = [
      { name: 'routers' },
      { name: 'type' }
    ];

    done();
  },
  shape: function( test ){
    test.expect( this.proto.length + this.instance.length );

    this.proto.forEach(function( method ) {
      test.equal( typeof this.nnfServer[ method.name ], 'function' );
    }, this);

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.nnfServer[ property.name ], 'undefined' );
    }, this);

    test.done();
  },
  '404': function( test ){
    test.expect(1);

    request('http://localhost:8080', function (error, response, body) {
      test.equal( body, '{"error":"not found"}' );
      test.done();
    });
  },
  tearDown: function( done ) {
    
    this.nnfServer.close();

    done();
  },
};
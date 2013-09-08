'use strict';

var nnf = require('../lib/nnf.js');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

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
      { name: 'routers' }
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
  tearDown: function( done ) {
    
    this.nnfServer.close();

    done();
  },
};

exports['Router'] = {

  setUp: function( done ){

    this.router = new nnf.Router({
      path: '/test',
      type: 'text/json'
    });

    this.proto = [
      { name: 'handle' }
    ];

    this.instance = [
      { name: 'path' },
      { name: 'type' },
      { name: 'auth' }
    ];
    done();
  },
  shape: function( test ){
    test.expect( this.proto.length + this.instance.length );

    this.proto.forEach(function( method ) {
      test.equal( typeof this.router[ method.name ], 'function' );
    }, this);

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.router[ property.name ], 'undefined' );
    }, this);

    test.done();
  },
  tearDown: function( done ){

    done();
  }
};

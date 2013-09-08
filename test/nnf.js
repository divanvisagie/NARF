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
exports['nnf'] = {

  setUp: function( done ){

    this.nnf = nnf;

    this.instance = [
      { name: 'Router' },
      { name: 'Server' },
      { name: 'createServer' }
    ];

    done();
  },
  shape: function( test ){

    test.expect( this.instance.length );

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.nnf[ property.name ], 'undefined' );
    }, this);

    test.done();
  },
  tearDown: function( done ){

    done();
  }
};




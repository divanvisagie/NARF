'use strict';

var nnf = require('../lib/nnf.js');

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

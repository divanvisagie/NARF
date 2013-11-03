'use strict';

var nnf = require('../lib/nnf.js'),
    request = require('request');

exports['Server'] = {

  setUp: function( done ) {
    // setup here
    this.nnfServer = nnf.createServer({
      type: 'text/json'
    });
    this.nnfServer.listen(8080);

    //function router
    var router = new nnf.Router({
      path: '/test',
      type: 'text/json'
    }).setHandler(function(data, cb){

      cb( { test: 'thing' } );
    });
    this.nnfServer.addRouter(router);

    //http router
    var hrouter = new nnf.Router({
      path : '/'
    }).setHandler({
      GET : {
        test : function( data, cb ){

          cb({ test: 'http router test success' });
        }
      }
    });
    this.nnfServer.addRouter( hrouter );


    var noGet = new nnf.Router({
      path : '/noget'
    }).setHandler({
     
    });
    this.nnfServer.addRouter( noGet );

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

  /*
    Test if not found errors are working
  */
  test_404: function( test ){
    test.expect(1);

    request('http://localhost:8080/nothing', function (error, response, body) {
      test.equal( body, '{"error":"not found"}' );
      test.done();
    });
  },

  /*
    test if router function handlers are working properly
  */
  function_router: function( test ){
    test.expect(1);

    request('http://localhost:8080/test', function (error, response, body) {
      test.equal( body, '{"test":"thing"}' );
      test.done();
    });
  },

  /*
    test if http functions are working properly
  */
  http_router: function( test ){
    test.expect(1);

    request('http://localhost:8080/?serverfunction=test', function (error, response, body) {
      test.equal( body, '{"test":"http router test success"}' );
      test.done();
    });
  },

  /*
    test if http functions return a 404 if they do not have a method namespace
  */
  http_router_404: function( test ){
    test.expect(1);

    request('http://localhost:8080/noget/?serverfunction=test', function (error, response, body) {
      test.equal( body, '{"error":"not found"}' );
      test.done();
    });
  },

  /*
    test if the client can request xml formatted data
  */
  request_xml: function( test ){
    test.expect(1);

    request({ 
      url: 'http://localhost:8080/noget/?serverfunction=test',
      headers: { 'Accept' : 'text/xml' }
    }, function (error, response, body) {
      test.equal( body, '<error>not found</error>' );
      test.done();
    });
  },

  tearDown: function( done ) {
    
    this.nnfServer.close();

    done();
  }
};
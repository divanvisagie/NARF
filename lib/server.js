/*
 * nnf
 * https://github.com/divanvisagie/nnf
 *
 * Copyright (c) 2013 Divan Visagie
 * Licensed under the MIT license.
 */

var util = require('util'),
    events = require('events'),
    http = require('http'),
    url = require('url');

var Router = require('./router');

var Server = function() {
  
  events.EventEmitter.call(this);

  var self = this;
  self.routers = {};

  self.httpServer = {};
};
util.inherits( Server, events.EventEmitter );

Server.prototype.listen = function( port, ip ){

  var self = this;

  this.httpServer = http.createServer(function( req, res ){

    var routerPath = url.parse( req.url, true ).pathname;

    if ( self.routers.hasOwnProperty( routerPath ) ){
      self.routers[ routerPath ].handle( req, res );
    }
    else {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('Not Found\n');
    }

  }).listen(port, ip);

  return this;
};

Server.prototype.close = function(){

  this.httpServer.close();

  return this;
};

Server.prototype.addRouter = function( router, cb ){

  if ( this.routers.hasOwnProperty( router.path ) ){
    cb( 'There is already a router for this path' );
    return this;
  }
  this.routers[ router.path || '/' ] = router; 

  return this;
};


//exports
module.exports.createServer = function( opts ){

  return new Server(opts);
};

module.exports.Server = Server;

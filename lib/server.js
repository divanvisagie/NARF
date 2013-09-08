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
    resExt = require('./res_extended'),
    url = require('url');

var Server = function( opts ) {
  
  events.EventEmitter.call(this);

  var self = this;
  self.type = opts && opts.type || 'text/json';
  self.routers = {};

  self.httpServer = {};
};
util.inherits( Server, events.EventEmitter );

Server.prototype.listen = function( port, ip ){

  //TODO: automatic ports with portastic
  var self = this;
  this.httpServer = http.createServer(function( req, res ){

    var routerPath = url.parse( req.url, true ).pathname;

    resExt.extend( res );

    if ( self.routers.hasOwnProperty( routerPath ) ){
      self.routers[ routerPath ].handle( req, res );
    }
    else {
        
      var type = self.type;

      if (req.headers.hasOwnProperty('accept')){
        if ( resExt.supportedTypes.indexOf(req.headers.accept) !== -1 ){
          type = req.headers.accept;
        }
      }

      res.writeHead(404, {'Content-Type': type });
      res.endWithType({ error: 'not found' }, type );
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

    if (cb) { cb( 'There is already a router for this path' ); } 
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

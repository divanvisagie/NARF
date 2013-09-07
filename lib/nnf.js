/*
 * nnf
 * https://github.com/divanvisagie/nnf
 *
 * Copyright (c) 2013 Divan Visagie
 * Licensed under the MIT license.
 */

'use strict';

var util = require('util'),
    events = require('events'),
    http = require('http');

var Server = function() {
  
  events.EventEmitter.call(this);

  var self = this;

  self.httpServer = {};
};
util.inherits( Server, events.EventEmitter );

Server.prototype.listen = function( port, ip ){

  this.httpServer = http.createServer(function( req, res ){

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');

  }).listen(port, ip);
};

Server.prototype.close = function(){

  this.httpServer.close();
};

Server.prototype.addRoute = function(){

  //TODO: this should possibly have a constructor of its own and a name change
};

module.exports.createServer = function(opts){

  return new Server(opts);
};
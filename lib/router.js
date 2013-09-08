/*
 * nnf
 * https://github.com/divanvisagie/nnf
 *
 * Copyright (c) 2013 Divan Visagie
 * Licensed under the MIT license.
 */

var util = require('util'),
    events = require('events'),
    url = require('url'),
    jsonxml = require('jsontoxml');

var Router = function( opts ){

  var self = this;

  self.supportedTypes = [
    'text/json',
    'text/xml',
    'text/plain'
  ];

  self.path = opts.path || '/';
  self.type = opts.type || 'text/json';

  self.auth = opts.auth || function( data, cb ){

    cb( true );
  };
};
util.inherits(Router, events.EventEmitter);

Router.prototype.processType = function( data, type, req, res ){

  switch( type ){

    case( 'text/json' ):
      res.end(JSON.stringify( data ));
      break;

    case( 'text/xml' ):
      res.end(jsonxml( data ));
      break;
  }
};

Router.prototype.handle = function( req, res ){

  var self = this;

  var type = this.type;

  if (req.headers.hasOwnProperty('accept')){

    if ( self.supportedTypes.indexOf(req.headers.accept) !== -1 ){
      type = req.headers.accept;
    }

    console.log('meh', type );
  }

  var urlObject = url.parse( req.url, true ).query;

  var auth = url.parse( req.url, true ).auth;


  res.writeHead(200, { 'Content-Type': type });

  /*
    TODO:
    here we call the function that will call the client defined functions
    if authentication is valid
  */
  self.auth({ request: req, response: res }, function( result ){

    if ( result ){
      self.processType({ text: 'Hello From Router at ' +  self.path }, type, req, res );
    }
    else {
      self.processType({ error: 'Authentication failed' }, type, req, res );
    }

  });

  // res.writeHead(200, {'Content-Type': 'text/plain'});
  // res.end('Hello From Router at ' +  self.path);
};

module.exports = Router;

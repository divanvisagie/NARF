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
    url = require('url'),
    resExt = require('./res_extended');

/*
  Router constructor
*/
var Router = function( opts ){

  var self = this;

  self.path = opts.path || '/';
  self.type = opts.type || 'text/json';

  self.auth = opts.auth || function( data, cb ) {

    cb( true );
  };

  self.handler = opts.handler || function( data, cb ) {

    cb({ handler: 'Not Implemented' });
  };

  /*Internal private functions*/
  var handleFunctionCall = function( data, type ) {

    var urlObject = url.parse( data.request.url, true ).query;
    data.query = urlObject;

    /*
      There are two types of handlers, object handlers and function handlers.
      
      function handlers are simple, they call the function that is passed in as
      a handler and return the callback data to the client in the requested or
      default format
    */
    if (typeof self.handler === 'function'){

      self.handler( data, function( returnData ){

        data.response.endWithType(returnData, type);
      });
    } else if (typeof self.handler === 'object') {

      var method = data.request.method;

      /*
        advanced handler object over here
      */
      var funcName = urlObject.serverfunction || 
                     data.request.headers.serverfunction || false;

      if ( funcName && self.handler[method] && self.handler[method][funcName]) {      

        self.handler[method][funcName]( data, function( returnData ){

          data.response.endWithType(returnData, type);
        });
    
      } else {

        data.response.endWithType({ 'error' : 'unsupported function' }, type);
      }
    }

    return self;
  };

  var handle = function( req, res ){

    var type = self.type;

    if (req.headers.hasOwnProperty('accept')) {
      if ( resExt.supportedTypes.indexOf(req.headers.accept) !== -1 ) {
        type = req.headers.accept;
      }
    }

    /*
      First we run the authentication function to see if the request is valid.
      The callback's returning value is set by the auth function which is user
      defined but returns true if not user defined
    */
    self.auth({ request: req, response: res }, function( result ) {

      if ( result ){
        res.writeHead(200, { 'Content-Type': type });
        handleFunctionCall({

          request: req,
          response: res
        }, type );
      }
      else {
        res.writeHead(403, { 'Content-Type': type });
        res.endWithType({ error: 'Authentication failed' }, type );
      }

    });

    return self;
  };

  Object.defineProperty(self, 'handle', {
    writable: false,
    value: handle
  });

  return self;
};
util.inherits(Router, events.EventEmitter);

Router.prototype.setHandler = function( handler ) {

  this.handler = handler;
  return this;
};

Router.prototype.setAuth = function( authHandler ) {

  this.auth = authHandler;
  return this;
};

module.exports = Router;

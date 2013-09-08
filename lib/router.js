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
    resExt = require('./res_extended');

var Router = function( opts ){

  var self = this;


  self.path = opts.path || '/';
  self.type = opts.type || 'text/json';

  self.auth = opts.auth || function( data, cb ){

    cb( true );
  };

  self.handler = opts.handler || function( data, cb ){

    cb({ handler: 'Not Implemented' });
  };

  return self;
};
util.inherits(Router, events.EventEmitter);

Router.prototype.handleFunctionCall = function( data, type ){

  var self = this;

  var urlObject = url.parse( data.request.url, true ).query;
  data.query = urlObject;

  if (typeof self.handler === 'function'){

    self.handler( data, function( returnData ){

      data.response.endWithType(returnData, type);
    });
  }else if (typeof self.handler === 'object') {

    var method = data.request.method;

    /*advanced handler object over here*/
    var funcName = urlObject.serverfunction || 
                   data.request.headers.serverfunction || false;

    if ( funcName && self.handler[method] && self.handler[method][funcName]){      

      self.handler[method][funcName]( data, function( returnData ){

        data.response.endWithType(returnData, type);
      });
  
    } else {

      data.response.endWithType({ 'error' : 'unsupported function' }, type);
    }
  }

  return self;
};

Router.prototype.setHandler = function( handler ){

  this.handler = handler;

  return this;
};

Router.prototype.handle = function( req, res ){

  var self = this;

  var type = this.type;

  if (req.headers.hasOwnProperty('accept')){
    if ( resExt.supportedTypes.indexOf(req.headers.accept) !== -1 ){
      type = req.headers.accept;
    }
  }

  res.writeHead(200, { 'Content-Type': type });

  self.auth({ request: req, response: res }, function( result ){

    if ( result ){
      self.handleFunctionCall({

        request: req,
        response: res
      }, type );
    }
    else {
      res.endWithType({ error: 'Authentication failed' }, type );
    }

  });

  return self;
};

module.exports = Router;

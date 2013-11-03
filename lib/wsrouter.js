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

var WSRouter = function(){

  var self = this;
  
};

util.inherits(WSRouter, events.EventEmitter);

WSRouter.prototype.setHandler = function( handler ) {

  return this;
};

WSRouter.prototype.setAuth = function( authHandler ) {

  return this;
};

module.exports = WSRouter;
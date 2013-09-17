/*
 * nnf
 * https://github.com/divanvisagie/nnf
 *
 * Copyright (c) 2013 Divan Visagie
 * Licensed under the MIT license.
 */

var Server = require('./server');

module.exports.Server = Server;
module.exports.Router = require('./router');


module.exports.createServer = function( opts ){
  var S = require('./server');
  return new S(opts);
};
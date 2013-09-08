/*
 * nnf
 * https://github.com/divanvisagie/nnf
 *
 * Copyright (c) 2013 Divan Visagie
 * Licensed under the MIT license.
 */

'use strict';

var server = require('./server');

module.exports.createServer = server.createServer;
module.exports.Server = server.Server;

module.exports.Router = require('./router');

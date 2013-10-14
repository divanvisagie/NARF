/*
  Created By: Divan Visagie

  Core utilities for nnf
*/
var portastic = require('portastic');

function findPort( options, callback ) {

  portastic.find( options, function( err, ports ) {

    if (err) {
      throw err;
    }

    if ( !ports[0] ){
      throw 'No free ports found in range';
    }

    callback( ports[0] );
  }); 
}

module.exports.findPort = findPort;
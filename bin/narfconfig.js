#!/usr/bin/env node

var fs = require( 'fs' );

function configure( path ){


  fs.writeFile( 'config.json', JSON.stringify( require( './config' ) ),
  function( err ){

    if (err) throw err;
  } );
}

function generateKeys(){

  var array = [

    '#!/bin/bash',
    'openssl genrsa -out key.pem',
    'openssl req -new -key key.pem -out csr.pem',
    'openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem',
    'rm csr.pem'
  ];

  var stream = fs.createWriteStream( 'generate_cert.sh' );
  stream.once( 'open', function( data ){

    for(var i in array) {
      stream.write(array[i] + '\n');
    }

  });
}

function runTests(){

  var colors = require( 'colors' );
  var tests = require( '../tests/test.js' );

  try {

    tests.performTest();
  } catch ( ex ) {

    console.log( ex );
  }
}


/* Script entry point */
process.argv.forEach(function( arg, index ){

  if( arg === 'configure' || arg === '-c' ){

    console.log( 'Should configure at path : ' + process.argv[1] );
    configure( process.argv[1] );
  }
  else if( arg === 'generate'|| arg === '-g' ){

    generateKeys();
  }
  else if( arg === 'test'|| arg === '-t' ){

    runTests();
  }

});
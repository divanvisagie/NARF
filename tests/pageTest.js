var narf = require( '../lib/narf' );

narf.pageServer( {

  port : 8080,
  path :  __dirname + '/www_root',
  error_page : 'err.html'
} );
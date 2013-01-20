var narf = require( '../lib/narf' );
var q = require( 'q' );


var APIFunctions = { //forward facing functions

	GET : {  //headers object and parsed url are passed as a parameter for get functions

		loopBack : function( headers, url ){
				
			console.log( headers );
			return { 'headers' : headers, 'parsedURL' : url };
		}
	},

	POST : {  //post body is passed as a parameter for POST functions

		loopBack : function( body ){

			return body;
		}
	}
};

var socketFunctions = {

	updateAll : function( messageData ){

		console.log( messageData );
	}
};

function connectionHandler( request ){

	return true;
}

/*test with cliusters*/
var cluster = require( 'cluster' );
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // Fork workers.

  console.log( 'found ' + numCPUs + ' cpus' );
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
  });
} else {

	/* Setting configs example */
	narf.configure( {

		"port" : 8002

	} ).then( function( v ){

		console.log( v );

		/* Starting an http server and then attaching a socket server */
		narf.startHTTPServer( APIFunctions ,function( httpServer ){
			
			narf.narfSocketServer( socketFunctions, connectionHandler );
		} );

	} );

}



var httpProxy = require( 'http-proxy' ),
	q = require( 'q' ),
	narf = require( '../lib/narf' );

/* set up the actual narf server */
var APIFunctions = {

	GET : {

		loopBack : function ( headers, url, ret ){

			
			ret( headers );
		}
	},
	POST : {}
};



var SocketFunctions = {

	loopBack : function( messageData, conn ){

		if( messageData.message ){

			narf.getConnectedClients().forEach( function( connection ){

				connection.send( JSON.stringify( { message : messageData.message } ) );
			});

		}else{
			connection.send( JSON.stringify( { message : '' } ) );
		}
	}
};

function socketConnectionHandler ( req ){

	return true;
}

// narf.configure( {

// 	port : 8082,
// 	debug : true,
// 	asc : true//,
// 	//socket_protocol : 'echo-protocol',
// 	//auth_function : authentication_function

// } ).then( narf.startHTTPServer( APIFunctions, function( hs ){

// 	narf.narfSocketServer( SocketFunctions, socketConnectionHandler, function connectionClosed(){} );
// 	//deferred.resolve( 'Set up complete' );

// } ) );

// narf.configure( {

// 	port : 8081,
// 	debug : true,
// 	asc : true//,
// 	//socket_protocol : 'echo-protocol',
// 	//auth_function : authentication_function

// } ).then( narf.startHTTPServer( APIFunctions, function( hs ){

// 	narf.narfSocketServer( SocketFunctions, socketConnectionHandler, function connectionClosed(){} );
// 	//deferred.resolve( 'Set up complete' );

// } ) );

/* Set up a balancer for  the api server*/
var nodes = [
	{
		host : '127.0.0.1',
		port : 8001
	},
	{
		host : '127.0.0.1',
		port : 8002
	}
];

narf.balancer( nodes, 8080 );
/*start a narf pageserver*/

narf.pageServer( {

	port : 8079,
	path : __dirname + '/www_root'
	
} );




/*Put up a proxy server*/

var options = {

	router:{

		'localhost/api' : '127.0.0.1:8080',
		'127.0.0.1/api' : '127.0.0.1:8080',

		'localhost/page' : '127.0.0.1:8079',
		'127.0.0.1/page' : '127.0.0.1:8079'
	}
};

httpProxy.createServer(options).listen(8000);

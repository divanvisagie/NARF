var httpProxy = require( 'http-proxy' ),
	q = require( 'q' ),
	narf = require( 'narf' );




/* set up the actual narf server */

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

narf.configure( {

	port : 8080,
	debug : true,
	asc : true//,
	//socket_protocol : 'echo-protocol',
	//auth_function : authentication_function

} ).then( narf.startHTTPServer( null, function( hs ){

	narf.narfSocketServer( SocketFunctions, socketConnectionHandler, function connectionClosed(){} );
	//deferred.resolve( 'Set up complete' );

} ) );


narf.pageServer( {

	port : 8079,
	path : __dirname + '/www_root'
	
} );

var options = {

	router:{

		'localhost/api' : '127.0.0.1:8080',
		'127.0.0.1/api' : '127.0.0.1:8080',

		'localhost/page' : '127.0.0.1:8079',
		'127.0.0.1/page' : '127.0.0.1:8079'
	}
};

httpProxy.createServer(options).listen(8000);

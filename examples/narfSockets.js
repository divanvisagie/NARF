var narf = require( '../lib/narf' );

/* Starting an http server and then attaching a socket server */
narf.startHTTPServer( null, function( httpServer ){
	
	var SocketFunctions = {

		sendToClients : function( messageData ){

			if( messageData.message ){

				narf.getConnectedClients().forEach( function( connection ){

					connection.send( JSON.stringify( { message : messageData.message } ) );
				});
			}else{

				connection.send( JSON.stringify( { message : ' ' } ) );
			}
		}
	};

	narf.narfSocketServer( httpServer, SocketFunctions, function( request ){
		return true;
	} );
} );
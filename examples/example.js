var narf = require( 'narf' );


/* Setting configs example */
narf.configure( {

	"port" : 8080
} );

var APIFunctions = { //forward facing functions

	GET : {  //headers object and parsed url are passed as a parameter for get functions

		loopBack : function( headers, url ){
				
			return { 'headers' : headers, 'parsedURL' : url };
		}
	},

	POST : {  //post body is passed as a parameter for POST functions

		loopBack : function( body ){

			return body;
		}
	}
};

/* Starting an http server and then attaching a socket server */
narf.startHTTPServer( APIFunctions, function( httpServer ){
	
	narf.startSocketServer( httpServer, function( request ){

		var connection = request.accept( null, request.origin ); //accept the connection request
		connection.on( 'message', function( message ){ //the user has sent a message

			if ( message.type === 'utf8' ){

				console.log( message ); //process

				if( typeof message === 'string' ) message = JSON.parse( message );

				connection.send( JSON.stringify({ message : 'hello client' }) );
			}
		} );

		connection.on( 'close', function( connection ){ //The user has closed the connection
			
			console.log( 'Client closed connection' );
		} );

	} );
} );
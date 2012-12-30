var narf = require( '../lib/narf' );
var q = require( 'q' );


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

var socketFunctions = {

	updateAll : function( messageData ){

		console.log( messageData );
	}
};

function connectionHandler( request ){

	return true;
}

/* Setting configs example */
narf.configure( {

	"port" : 8080

} ).then( function( v ){

	console.log( v );

	/* Starting an http server and then attaching a socket server */
	narf.startHTTPServer( APIFunctions ,function( httpServer ){
		
		narf.narfSocketServer( socketFunctions, connectionHandler );
	} );


} );



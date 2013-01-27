var narf = require( '../lib/narf' ),
	q = require( 'q' );


var APIFunctions = { //forward facing functions

	GET : {  //headers object and parsed url are passed as a parameter for get functions

		loopBack : function( headers, url, ret ){
				
			console.log( headers );
			ret( { 'headers' : headers, 'parsedURL' : url } );
		},

		getHello : function( headers, url, ret ){

			ret( { 'Hello' : 'world' } );
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

var auth_function = function( request, url_object ){

	var deferred = q.defer();
	deferred.resolve( false );
	return deferred.promise;
};

/* Start the server */
var narfHttp = new narf.httpServer({

	port : 'auto'
});
console.log( narfHttp );


narfHttp.start();

narfHttp.on( 'port', function( data ){
	console.log( data );
	//console.log( narfHttp.server );

} );

narfHttp.on( 'error', function( err ){

	console.log( err );
} );


narfHttp.addAPI( APIFunctions, {
	authentication : auth_function
} );

narfHttp.addPageServer( {
	path : __dirname + '/www_root',
	url : '/page'
} );




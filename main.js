/*
	--------- Node API REST Framework ---------

	Created By: Divan Visagie 2012-11-20
	Last Edited By: Divan Visagie 2012-11-22
*/
var http = require( 'http' ),
	url = require( 'url' ), //for handeling url parameters
	config = require ( './config' ),
	api_functions = require( './api_functions' );
	
var ERROR = {

	UNSUPPORTED_FUNCTION : { 'error' : 'Unsupported Server function' },
	UNSUPPORTED_GET_FUNCTION : { 'error' : 'The server does not provide the GET functionality you requested' },
	NUKE_ATTACK : { 'error' : 'Data was larger than 1e6 ,this is viewed as suspicious activity' }
};

//create an http server
http.createServer( function( request, response ){

	//write the response headers
	response.writeHead( 200, {

		'Content-Type' : 'text/json',
		'Access-Control-Allow-Origin' : '*' //allow any access origin
	} );

	//parse the url from request to an object
	var url_object = url.parse( request.url, true ).query;

	var func_to_use; //determine which function to perform using either the url or header
	if ( request.headers.serverfunction )
		func_to_use = request.headers.serverfunction;
	else if ( url_object.serverfunction && config.url_selection )
		func_to_use = url_object.serverfunction;
	else
		func_to_use = undefined;

	//determine the request method
	if ( request.method === 'POST' ){

		console.log( 'Called POST :' + func_to_use );

		var body_data = '';

		request.on( 'data', function( data ){

			if ( data.length > 0 ) body_data += data;

			if ( config.limit_post_size && body_data.length > config.post_size_limit ){

				console.log('Data was larger than 1e6 ,possible flood attack');
				body_data = '';

				request.connection.destory();
				response.end( JSON.stringify( NUKE_ATTACK ) );
			}

		} );
		request.on( 'end', function(){

			var obj;

			try{

				if( typeof body_data === 'string' )
					obj = JSON.parse( body_data );
				else
					obj = body_data;
			}
			catch ( ex ){
				console.log( 'Error parsing object: ' + ex );
			}
			
			var toReturn;
			if( request.headers.serverfunction ){
				if( api_functions.POST.hasOwnProperty( func_to_use ) && typeof api_functions.POST[ func_to_use ] === 'function' )
					toReturn = api_functions.POST[ func_to_use ]( obj || null );
				
				else
					toReturn = ERROR.UNSUPPORTED_FUNCTION;
			}
			else
				toReturn = ERROR.UNSUPPORTED_FUNCTION;

			if ( typeof toReturn != 'string' ) //make sure the the object has been stringified
				toReturn = JSON.stringify( toReturn );

			response.end( toReturn );
		});

	}
	else if ( request.method === 'GET' ){

		var toReturn;
		if( func_to_use ){

			if( api_functions.GET.hasOwnProperty( func_to_use ) && typeof api_functions.GET[ func_to_use ] === 'function' )
				toReturn = api_functions.GET[ func_to_use ]( request.headers, url_object );
			else
				toReturn = ERROR.UNSUPPORTED_FUNCTION;
		}
		else
			toReturn = ERROR.UNSUPPORTED_FUNCTION;

		if ( typeof toReturn != 'string' ) //make sure the the object has been stringified
			toReturn = JSON.stringify( toReturn );

		response.end( toReturn );
	}
		
}).listen( config.port );
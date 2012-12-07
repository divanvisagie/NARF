/*
	----------------- NARF -----------------

	Created By: Divan Visagie 2012-11-20
	Last Edited By: Divan Visagie 2012-12-07
*/

var url = require( 'url' ), //for handeling url parameters
	config = require ( './config' ),
	os = require( 'os' ),
	events = require( 'events' ),
	colors = require( 'colors' ),
	portastic = require( 'portastic' );

var ERROR = {

	UNSUPPORTED_FUNCTION : { 'error' : 'Unsupported Server function' },
	UNSUPPORTED_GET_FUNCTION : { 'error' : 'The server does not provide the GET functionality you requested' },
	NUKE_ATTACK : { 'error' : 'Data was larger than the specified limit ,this is viewed as suspicious activity' }
};

var http_server; //used to store the http server for use by websockets


exports.configure = function ( config_JSON ){ //TODO: iterate through properties and change those appropriate

	if( config_JSON ){

		for ( var property in config_JSON ){

			config[property] = config_JSON[property];
		}
	}
	else
		throw 'Invalid Configuration';
};

var server_events = new events.EventEmitter();

exports.startHTTPServer = function( api_functions, callback ){

	if ( config.debug ){

		console.log( 'Running server on: ' + os.hostname() );
		console.log( os.type() + ' ' + os.release() + ' ' +  os.arch() );
	}

	var port_to_use = null;
	if ( config.port === 'auto' ){ /* handle automatic port detection */

		console.log( 'finding a port' );
		var options = {
			min : config.auto_port_min,
			max : config.auto_port_max
		};

		portastic.find( options, function( err, ports ) { /* retrieve an array of ports */

			if (err)
				throw err;

			/* decide which port to use */
			portastic.test( ports, function( err, data ){

				if( data[0] ){ /* Use first available port */

					console.log( 'Running server on: ' + data[0] );
					if(data[0])
						start_server( data[0] );
					else
						throw 'no suitable ports found';
				}
				else
					throw 'could not find a suitable port';
			} );

		} );
	}
	else{
		console.log( 'Running server on: ' + config.port );
		start_server( config.port );
	}

	function server_handler( request, response ){

		//write the response headers
		response.writeHead( 200, {

			'Content-Type' : 'text/json',
			'Access-Control-Allow-Origin' : '*' //allow any access origin
		} );

		/* parse the url from request to an object */
		var url_object = url.parse( request.url, true ).query;

		var func_to_use; /* determine which function to perform using either the url or header */
		if ( request.headers.serverfunction )
			func_to_use = request.headers.serverfunction;
		else if ( url_object.serverfunction && config.url_selection )
			func_to_use = url_object.serverfunction;
		else
			func_to_use = undefined;

		//determine the request method
		if ( request.method === 'POST' ){

			var body_data = '';

			request.on( 'data', function( data ){

				if ( data.length > 0 ) body_data += data;

				if ( config.limit_post_size && body_data.length > config.post_size_limit ){

					console.log('Data was larger than 1e6 ,possible flood attack');
					body_data = '';

					//request.connection.destory();
					response.end( JSON.stringify( ERROR.NUKE_ATTACK ) );
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

				if(toReturn)
					response.end( toReturn );
				else
					response.end( JSON.stringify( config.default_return ) );

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

			if(toReturn)
					response.end( toReturn );
			else
				response.end( JSON.stringify( config.default_return ) );
		}
	}

	function start_server( port ){  //start the appropriate server

		if ( !config.https ){

			var http = require( 'http' );

			http_server = http.createServer( server_handler ).listen( port, function(){

				server_events.emit('serverStarted', http_server );
			} );
		}
		else{

			var fs = require( 'fs' ),
				https = require( 'https' );

			var options = {
				key: fs.readFileSync( config.key_path ),
				cert: fs.readFileSync( config.cert_path )
			};

			https.createServer( options, server_handler ).listen( port );
		}
	}

	/* The callback should be used instead of the return,
		as multithreading can cause breakage */
	if( callback && typeof callback === 'function' )
		server_events.on( 'serverStarted', callback );
	else{

		console.log( 'WARNING: '.red + 'The return of the httpServer variable has been depricated due to instability, you should use a callback instead.'.yellow );

		return http_server; /* Depricated and not reccomended */
	}
};



/* support for web socket server */
exports.startSocketServer = function( server, callback ){

	console.log( 'Starting socket server' );

	var WebSocketServer = require( 'websocket' ).server;

	var websocket_server = new WebSocketServer({

		httpServer  : server || http_server
	});

	websocket_server.on( 'request', function ( request ){

		callback ( request );

	} );
};


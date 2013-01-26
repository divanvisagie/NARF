/*
	----------------- NARF -----------------

	Created By: Divan Visagie 2012-11-20
	Last Edited By: Divan Visagie 2013-1-26
*/
var	url = require( 'url' ),
	events = require( 'events' ),
	colors = require( 'colors' ),
	q = require( 'q' ),
	portastic = require( 'portastic' );

var ERROR = {

	UNSUPPORTED_FUNCTION : { 'error' : 'Unsupported Server function' },
	UNSUPPORTED_GET_FUNCTION : { 'error' : 'The server does not provide the GET functionality you requested' },
	NUKE_ATTACK : { 'error' : 'Data was larger than the specified limit ,this is viewed as suspicious activity' },
	AUTH_FAILURE : { 'error' : 'Authentication failed' }
};

exports.pageServer = require( './pageServer' ).narfPageServer;
exports.balancer = require( './router' ).balancer;

/* export legacy functions */
var legacy = require( './legacy' );
exports.startHTTPServer = legacy.startHTTPServer;
exports.configure = legacy.configure;
exports.narfSocketServer = legacy.narfSocketServer;

/*
   narf_log is a redifinition of console.log.
   It can be 'turned off' so that it represents
   a blank function instead
*/
var narf_log = function(){};
function set_debug( debug ){

	if( debug )
		narf_log = console.log;
	else
		narf_log = function(){};
}
exports.setDebug = set_debug;

var auth_function = function( request, url_object ){

	var deferred = q.defer();
	deferred.resolve( true );
	return deferred.promise;
};

function get_auto_port(){

	
}

var page_handler = function( config, request, response ){

	var ev = new events.EventEmitter();

	/* Diplays the cannot be found message if 404 occurs */
	function pageError( response, pagePath ){

		var fileStream = fs.createReadStream( pagePath || __dirname +  '/page_error.html' );
		fileStream.on('data', function ( data ) {
			response.write( data );
		});
		fileStream.on('end', function() {
			response.end();
		});

		response.writeHead( 404, { 'Content-Type' : 'text/html' } );
	}

	/* Evaluate the config to make sure everything is ok */

	if ( !config.port )
		ev.emit( 'error', 'PageServer requires a port' );
	else if ( !config.path )
		ev.emit( 'error', 'PageServer requires a path' );

	if( config.port && config.path ){

		var uri = url.parse(request.url).pathname;
			
		if( uri === '/' ) uri += 'index.html';

		var filepath = config.path + uri;

		/* Check if the requested file exists */
		fs.exists( filepath, function( exists ) {

			if( !exists ){
				console.log( filepath + ' does not exist' );

				/* Hanlde 404 if requested page does not exist */
				response.writeHead(404, {'Content-Type': 'text/plain'});

				if(!config.error_page){
					pageError( response );
				}
				else{
					var err_page_path = config.path + config.error_page;
					console.log( 'error page path'.cyan + err_page_path );
					fs.exists( err_page_path, function( exists ){

						if( exists ){
							console.log( 'found error page' );

							var fileStream = fs.createReadStream( err_page_path );
							fileStream.on('data', function ( data ) {
								response.write( data );
							});
							fileStream.on('end', function() {
								response.end();
							});

						}
						else{
							/* 404 inception occurs when the custom 404 page cannot be found */
							pageError( response );
						}
					} );
				}
			}else{

				/* Get the mime type */
				var type = mime.lookup( filepath );
				
				var fileStream = fs.createReadStream( filepath );
				fileStream.on('data', function ( data ) {
					response.write( data );
				});
				fileStream.on('end', function() {
					response.end();
				});

				response.writeHead( 200, { 'Content-Type' : type } );
			}
		} );

	

		return ev;
	}
};

/* Function to handle instances of API functions */
var api_function_handler = function( api_instance, request, response ){

	/*TODO: handle authentication function correctly*/

	console.log( 'api func handle' );
	console.log( api_instance );

	response.writeHead( 200, {

		'Content-Type' : 'text/json',
		'Access-Control-Allow-Origin' : '*' /* allow any access origin */
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

	console.log( func_to_use );

	/* determine the request method */
	if ( request.method === 'POST' ){
		
		var body_data = '';

		request.on( 'data', function( data ){

			if ( data.length > 0 ) body_data += data;

			if ( config.limit_post_size && body_data.length > config.post_size_limit ){

				narf_log('Data was larger than the maximum specified size ,possible flood attack');
				body_data = '';

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
				narf_log( 'Error parsing object: ' + ex );
			}

			

			auth_function( request, url_object  ).then( function( valid ){

				if( !valid )
					response.end( JSON.stringify( ERROR.AUTH_FAILURE ) );
				else{

					var to_return;
					if( func_to_use && api_instance.api_functions ){
						if( api_instance.api_functions.POST && api_instance.api_functions.POST.hasOwnProperty( func_to_use ) && typeof api_instance.api_functions.POST[ func_to_use ] === 'function' ){
							narf_log( 'executing POST function' );

							to_return = api_instance.api_functions.POST[ func_to_use ]( obj || null , url_object, function( return_object ){

								if ( typeof return_object != 'string' ) /* make sure the the object has been stringified */
									return_object = JSON.stringify( return_object );
								response.end( return_object );
							} );
						}
						
						else
							to_return = ERROR.UNSUPPORTED_FUNCTION;
					}
					else
						to_return = ERROR.UNSUPPORTED_FUNCTION;

					if ( typeof to_return != 'string' ) /* make sure the the object has been stringified */
						to_return = JSON.stringify( to_return );

					if(to_return)
						response.end( to_return );
					/*Auto return functionality was disabled due to async breakage*/

				}
			} );
				
		});

	}
	else if ( request.method === 'GET' ){

		auth_function( request, url_object  ).then( function( valid ){

			if( !valid )
				response.end( JSON.stringify( ERROR.AUTH_FAILURE ) );
			else{

				var to_return;
				if( func_to_use && api_instance.api_functions ){

					if( api_instance.api_functions.GET && api_instance.api_functions.GET.hasOwnProperty( func_to_use ) && typeof api_instance.api_functions.GET[ func_to_use ] === 'function' )
						to_return = api_instance.api_functions.GET[ func_to_use ]( request.headers, url_object, function( return_object ){


							console.log( 'should be responding now'.red );
							if ( typeof return_object != 'string' ) /* make sure the the object has been stringified */
								return_object = JSON.stringify( return_object );
							response.end( return_object );

						} );
					else{
						to_return = ERROR.UNSUPPORTED_FUNCTION;
					}
				}
				else{
					to_return = ERROR.UNSUPPORTED_FUNCTION;
				}

				if ( typeof to_return != 'string' ) /* make sure the the object has been stringified */
					to_return = JSON.stringify( to_return );

				if(to_return)
						response.end( to_return );

				/*Auto return functionality was disabled due to async breakage*/
			}
		});
	}
};

var narf_http_server = function ( config ){

	events.EventEmitter.call( this );
	
	this.server = {};
	this.config = config;

	this.API_list = {}; /* though it is named API_list , this is where all the services for this port are stored including page servers*/
	
	var self = this; /* This allows server_handler to access 'this' variables in narf_http_server */
	this.server_handler = function( request, response ){

		/* TODO: Fix url selection when handling pageservers */

		/* Obtain the url  */
		var q_index = request.url.indexOf( '?' );

		var func_key;
		if( q_index !== -1 )
			func_key = request.url.substr( 0, q_index );
		else
			func_key = request.url;

		func_key = func_key || '/'; /* sometimes the url key can be nothing so default it to '/' so selection will still work */


		/* parse the url from request to an object */
		var url_object = url.parse( request.url, true ).query;

		console.log( 'func key',func_key );
		console.log( request.url );
		/* call the appropriate function */
		if( self.API_list.hasOwnProperty( func_key ) ){

			if( self.API_list[ func_key ].type === 'API' )
				api_function_handler( self.API_list[ func_key ], request, response );
			else if ( self.API_list[ func_key ].type === 'page' ){
				console.log( 'handling page'.cyan );
				page_handler( self.API_list[ func_key ].config, request, response );
			}

		}else{

			response.writeHead( 404, {

				'Content-Type' : 'text/json',
				'Access-Control-Allow-Origin' : '*' /* allow any access origin */
			} );
			response.end( JSON.stringify( ERROR.UNSUPPORTED_FUNCTION ) );
			console.log( 'function is unsupported because there was nothing for func_key'.cyan , func_key );
			console.log(self.API_list);
		}
				
	};

};
narf_http_server.prototype = Object.create(events.EventEmitter.prototype, {
	constructor : {
		value : narf_http_server,
		enumerable : false
	}
});
narf_http_server.prototype.start = function(){

	var self = this;

	var start_server = function(){

		console.log( 'conf is'.cyan );
		console.log( self.config );

		/*Set up the http server*/
		if ( !self.config.https ){

			var http = require( 'http' );

			self.server = http.createServer( self.server_handler ).listen( self.config.port, function(){

				self.emit( 'server', self.server );
				self.emit( 'port', self.config.port );
			} );
		}
		else{

			var fs = require( 'fs' ),
				https = require( 'https' );

			var options = {

				key: fs.readFileSync( self.config.key_path ),
				cert: fs.readFileSync( self.config.cert_path )

			};

			self.server = https.createServer( options, self.server_handler ).listen( self.config.port );
		}

	};

	console.log( 'config port is', this.config.port );
	if ( this.config.port === 'auto' ){ /* handle automatic port detection */

		narf_log( 'finding a port' );
		var p_options = {
			min : this.config.auto_port_min || 8000,
			max : this.config.auto_port_max || 8080
		};

		portastic.find( p_options, function( err, ports ) { /* retrieve an array of ports */

			if (err)
				throw err;

			/* decide which port to use */
			portastic.test( ports, function( err, data ){

				if( data[0] ){ /* Use first available port */

					narf_log( 'Running server on: ' + data[0] );
					if(data[0]){
						self.config.port = data[0];
						start_server( );
					}
					else
						throw 'no suitable ports found';
				}
				else
					throw 'could not find a suitable port';
			} );

		} );
	}else
		start_server( );

	
	
};
narf_http_server.prototype.addAPI = function( api_functions, config ){

	config = config || {};

	if ( !config.hasOwnProperty( 'url' ) || !config.url )
		config.url = '/';

	if( this.API_list[ config.url ] )
		this.emit( 'error', 'A service for this url already exists' );
	else{
		this.API_list[ config.url ] = {

			'type' : 'API',
			'api_functions' : api_functions,
			'config' : config
		};
	}

};
narf_http_server.prototype.addSocket = function( socket_functions ){

};
narf_http_server.prototype.addPageServer = function( config ){

	if ( !config.hasOwnProperty( 'url' ) || !config.url )
		config.url = '/';

	if( this.API_list[ config.url ] )
		this.emit( 'error', 'A service for this url already exists' );
	else if ( !config )
		this.emit( 'error', 'addPageServer() requires a config' );
	else{

		this.API_list[ config.url ] = {

			'type' : 'page',
			'config' : config
		};
	}

};
module.exports.httpServer = narf_http_server;


//
/*
	----------------- NARF -----------------

	Created By: Divan Visagie 2012-11-20
	Last Edited By: Divan Visagie 2013-1-30
*/
var	url = require( 'url' ),
	events = require( 'events' ),
	colors = require( 'colors' ),
	q = require( 'q' ),
	fs = require( 'fs' ),
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
exports.getConnectedClients = legacy.getConnectedClients;

/*
   narf_log is a redifinition of console.log.
   It can be 'turned off' so that it represents
   a blank function instead

   Parameters	- Boolean
*/
var narf_log = function(){};
function set_debug( debug ){

	if( debug )
		narf_log = console.log;
	else
		narf_log = function(){};
}
exports.setDebug = set_debug;

/* The default authentication function automatically accepts all connections */
var auth_function = function( request, url_object ){

	var deferred = q.defer();
	deferred.resolve( true );
	return deferred.promise;
};

/*
	Function to handle instances of API functions

	Parameters:

	config		- The configuration for the api function
	request		- The http request
	response	- The http response
*/
var api_function_handler = function( config, request, response ){


	config.authentication = config.authentication || auth_function;

	response.writeHead( 200, {

		'Content-Type' : 'text/json',
		'Access-Control-Allow-Origin' : '*' /* allow any access origin */
	} );

	/* parse the url from request to an object */
	var url_object = url.parse( request.url, true ).query;


	var func_to_use; /* determine which function to perform using either the url or header */
	if ( request.headers.serverfunction )
		func_to_use = request.headers.serverfunction;
	else if ( url_object.serverfunction && config.url_selection || true )
		func_to_use = url_object.serverfunction;
	else
		func_to_use = undefined;

	
	/* determine the request method */
	if ( request.method === 'POST' ){
		
		var body_data = '';

		request.on( 'data', function( data ){

			if ( data.length > 0 ) body_data += data;

			if ( config.datalimit && body_data.length > config.datalimit ){

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

			config.authentication( request, url_object  ).then( function( valid ){

				if( !valid )
					response.end( JSON.stringify( ERROR.AUTH_FAILURE ) );
				else{

					var to_return;
					if( func_to_use && config.functions ){
						if( config.functions.POST.hasOwnProperty( func_to_use ) && typeof config.functions.POST[ func_to_use ] === 'function' ){
							narf_log( 'executing POST function' );

							config.functions.POST[ func_to_use ]( { 'body' : obj || null , 'url' : url_object , 'headers' : request.headers }, function( return_object ){

								if ( typeof return_object != 'string' ) /* make sure the the object has been stringified */
									return_object = JSON.stringify( return_object );
								response.end( return_object );
							}  );
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

		config.authentication( request, url_object  ).then( function( valid ){

			if( !valid )
				response.end( JSON.stringify( ERROR.AUTH_FAILURE ) );
			else{

				var to_return;
				if( func_to_use && config.functions ){

					if( config.functions.GET.hasOwnProperty( func_to_use ) && typeof config.functions.GET[ func_to_use ] === 'function' )
						config.functions.GET[ func_to_use ]( { 'headers' : request.headers, 'url' : url_object }, function( return_object ){

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

/*
	narf_http_server is represented externally as:
	HttpServer and is a class that represents a custom http
	server with narf functions

	Parameters:

	config	- configuration object for the http server which uses the following properties:

				port - port to run the server on
 */
var narf_http_server = function ( conf ){

	if( !conf )
		conf = {};

	events.EventEmitter.call( this );
	
	this.server = {};
	this.config = conf;
	this.connected_clients = [];

	this.API_list = {}; /* though it is named API_list , this is where all the services for this port are stored including page servers*/
	

	var self = this; /* This allows server_handler to access 'this' variables in narf_http_server */
	this.server_handler = function( request, response ){

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

		
		/* call the appropriate function */
		if( self.API_list.hasOwnProperty( func_key ) ){
				api_function_handler( self.API_list[ func_key ].config, request, response );
		
		}else{

			response.writeHead( 404, {

				'Content-Type' : 'text/json',
				'Access-Control-Allow-Origin' : '*' /* allow any access origin */
			} );
			response.end( JSON.stringify( { error : 'No such function exists' } ) );
			narf_log( 'function is unsupported because there was nothing for func_key'.cyan , func_key );
			
		}
				
	};

};
narf_http_server.prototype = Object.create(events.EventEmitter.prototype, {
	constructor : {
		value : narf_http_server,
		enumerable : false
	}
});

/* start up the httpserver */
narf_http_server.prototype.start = function( port ){

	var self = this;
	
	
	if( !this.config ) this.config = {}; /* Create a config if there is none */
	if( port ) /* check for port reassignment from args */
		this.config.port = port;

	var start_server = function(){

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

			/* the port parameter for start is optional but will overrid self.config.port */
			self.server = https.createServer( options, self.server_handler ).listen( self.config.port );
		}

	};

	narf_log( 'config port is', this.config.port );
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

	return self;
	
};
/*
	addAPI adds a set of API functions to the http server
	
	Parameters:

	config	- The api configuration object which uses the following properties

				functions : the socket functions
				url: the url at which the api will sit
				datalimit : an optional limit on the size of the data
*/
narf_http_server.prototype.addAPI = function( config ){

	/*
		Config needs

		functions : the socket functions
		url: the url at which the api will sit
		datalimit : an optional limit on the size of the data
	*/

	/* TODO: move a lot of the checking code from runtime to here for efficiency */
	if( !config || !config.hasOwnProperty( 'functions' ) ){

		this.emit( 'error', 'addAPI() requires a config parameter with at least a functions:  property' );
	}else
		if( !config.functions.hasOwnProperty( 'GET' ) || !config.functions.hasOwnProperty( 'POST' ) )
				this.emit( 'error', 'The functions object must contain GET and POST' );




	if ( !config.hasOwnProperty( 'url' ) || !config.url )
		config.url = '/';

	if( this.API_list[ config.url ] )
		this.emit( 'error', 'A service for this url already exists' );
	else{
		this.API_list[ config.url ] = {

			'type' : 'API',
			'config' : config
		};
	}

};
/*
	httpServer.addSocket()

	Takes object parameter: config

	Config needs

		functions : the socket functions
		request : the request callback
		close : the close callback
		protocol : sets the socket protocol , can be null

*/
narf_http_server.prototype.addWebSocket = function( config ){

	if ( !config.hasOwnProperty( 'asc' ) )
		config.asc = true;

	var self = this; /* provides access to this */

	narf_log( 'Starting narf socket server' );

	var WebSocketServer = require( 'websocket' ).server;
	var websocket_server = new WebSocketServer({

		'httpServer'  : this.server
	});

	websocket_server.on( 'request', function ( request ){

		var connection;
		
		var should_connect = config.request( request );

		if ( typeof should_connect != 'object' ){  /* Lets the caller determine if the request should be accepted */
			if( should_connect ){

				connection = request.accept( config.protocol , request.origin ); /* accept the connection request */

				self.connected_clients.push( connection );
			}
		}else{

			connection = should_connect;

			if( config.asc ) /* autocache socket connections ? */
				connected_clients.push( connection );
		}

		try{
			connection.on( 'message', function( message ){ /* the user has sent a message */

				if ( message.type === 'utf8' ){ /* only accept utf8 messages */

					/* If the message is in string format it must be parsed as JSON */
					if( typeof message === 'string' ) message = JSON.parse( message );

					try{

						/*The data is stored in message.utf8Data , so we need to extract it*/
						var message_data = typeof message.utf8Data === 'string' ? JSON.parse( message.utf8Data ) : message.utf8Data ;

						if ( message_data.serverfunction && config.functions[message_data.serverfunction] && typeof config.functions[message_data.serverfunction] === 'function' ){

							config.functions[message_data.serverfunction]( { 'messageData' : message_data, 'connection' : connection } );
						}
						else{
							narf_log( 'Message is of unrecognised type ' +  typeof message_data );
						}
					}
					catch ( ex ){

						narf_log( ex );
					}
				}
			} );

			connection.on( 'close', function( reason_code ){ /* The user has closed the connection */

				if( config.asc ){
						/* remove the client connection from the array and free some memory*/
						var i = self.connected_clients.indexOf( connection );

						self.connected_clients.splice(i,1);
						narf_log('Removing from connected client list');
						
				}else {

					/* handle the close callback */
					if( config.close ){
						config.close( connection, reason_code );
					} else {

						narf_log( 'WARNING: '.red + 'narfSocketServer() requires a second callback to handle disconnections if asc is disabled.'.yellow );
					}
				}

			} );

		} catch ( ex ){

			narf_log( ex );
		}
	} );
};
module.exports.HttpServer = narf_http_server;


//
NARF 
====

Narf is a basic framework for creating a JSON API with node , it currently supports both GET and POST as well as web sockets.

The idea with NARF is that all you have to do for GET, POST and Socket is put the functions you want exposed in a particular object and everything else will be handled for you. For GET and POST data is returned to the client by either a return statement (not recommended) or by use of the ret( [object data] ) function.

## Usage

### Installation 

	npm install narf

If you want command line functionality then the following is suggested:

	sudo npm install -g narf
	
#### Stability

Narf is under continuous development and is therefore subject to API changes, luckily npm allows for version specification, if you wish to use an older version of narf 
simply use: 

	npm install narf@x.x.x

### Setup

To create a narf server all you need is to create an object with your GET and POST functions, if you wish to return an object to the client simply use a return statement to return a valid javascript object , if you do not return an object a default object will be returned as specified in lib/config.json under "default_return". After you create your functions, simply import the narf library and run narf.startHTTPServer( APIFunctions ).

## Functions

	narf.configure()

	narf.startHTTPServer()

	narf.startSocketServer()

	narf.narfSocketServer()

	narf.pageServer()


## Configuration:
### narf.configure()

The default configuration for the server is located in lib/config.json and looks like the following:

    {
	  "debug" : true,
	  "port" : 8080,
	  "auto_port_min" : 8000,
	  "auto_port_max" : 8100,

	  "https" : false,
	  "key_path" : "./key.pem",
	  "cert_path" : "./cert.pem",

	  "limit_post_size" : true,
	  "post_size_limit" : 1e6,
	  "url_selection" : true,
	  "asc" : true,
	  "socket_protocol" : null
	}
    
By defualt it covers the server port , a post 
body size limit and an option to remove the limit as well as a bool value to determine if the client should
be able to select serverfunction via the url.

You can modiy the configuration using narf.configure() by loading another configuration file :

	narf.configure( require( './config' ) );

or just resetting the values you wish to change:

	narf.configure( {

		"port" : "auto"

	} ).then( ... );

Note: It is always a good idea to use narf.configure( ... ).then( function(value){ ...startHTTP here... } ) due to the 
asynchronous nature of javascript. 

You can also generate a config file by typing the following into your terminal:
	
	narf configure

or:

	narf -c

#### port

The port property lets you assign the NARF server to a port, alternatively you can use the value "auto" and then set the auto_port_min and auto_port_max appropriately to have narf automatically assign itself a port.

#### Authentication

Authentication can be set up on a narf api by setting the value of auth_function , the function should accept a
request and url_object as parameters and utilise q for promises , eg:

	function authentication_function( request, url_object ){

		var deferred = q.defer();
		console.log( request.headers );
		var api_key = '50e85fe18e17e3616774637a82968f4c';

		if ( request.headers.key ){

			if( request.headers.key === api_key )
				deferred.resolve( true );
			else
				deferred.resolve( false );
		}
		else if ( url_object.key ){

			if( request.headers.key === api_key )
				deferred.resolve( true );
			else
				deferred.resolve( false );
		}
		else
			deferred.resolve( false );

		return deferred.promise;
	}

	narf.configure( {

		auth_function : authentication_function
	} )


## HTTP Server
### narf.startHTTPServer()

Below is an example of a simple narf HTTP server, in just these few lines , you can get a server running with GET and POST functionality:

	var narf = require( 'narf' );

	var APIFunctions = {

		GET : {  //headers object, parsed url and return callback are passed as a parameter for get functions

			loopBack : function( headers, url, ret ){
					
				ret( { 'headers' : headers, 'parsedURL' : url } );
			}
		},

		POST : {  //post body is passed as a parameter for POST functions

			loopBack : function( body, url, ret ){

				ret( body );
			}
		}
	};

	narf.startHTTPServer( APIFunctions );
	
## Sockets 
### narf.startSocketServer() / narf.narfScoketServer()

If you want to add socket functionality to your HTTP server , pass a callback function to handle it as follows:

	narf.startHTTPServer( APIFunctions, function( httpServer ){
	
		narf.startSocketServer( httpServer, function( request ){ ... } );
	} );
First the HTTP server is passed to the callback function in startHTTPServer(). Then the request in the socket server is passed to the callback function in startSocketServer() , from there , you have control to accept the request 
and do the rest of the processing.


There are two types of socket servers 

	narf.startSocketServer( httpserver, function( request ){ ... } )

and 

	narf.narfSocketServer( httpServer, SocketFunctions, function( request ){ ... } )

narf.startSocketServer() creates a socket server and then responsibility is passed on you.

narf.narfSocketServer() however is similar to startHTTPServer in that you pass a set of public functions
that will be exposed to the client, a parsed message data object and the connection are passed to these functions, the example below is a socket server that updates a text field on all clients:

	var narf = require( 'narf' );
	
	/* Starting an http server and then attaching a socket server */
	narf.startHTTPServer( null, function( httpServer ){
		
		var SocketFunctions = {

			updateAll : function( messageData, conn ){

				if( messageData.message ){

					narf.getConnectedClients().forEach( function( connection ){
						
						if (conn != connection)
							connection.send( JSON.stringify( { message : messageData.message } ) );
					});

				}else{
					connection.send( JSON.stringify( { message : '' } ) );
				}
			}
		};
	
		narf.narfSocketServer( httpServer, SocketFunctions, function( request ){
			return true;
		} );
	} );

You can fetch a list of connected clients by calling:

	narf.getConnectedClients()



## Static pages:
### narf.pageServer()

With narf.pageServer() you can serve static pages on a specified port. To start a page server simply call the narf.pageServer function and pass in a configuration object containting the port and path properties, port sets the port number for the web server and path sets the path to the directory from which you wish to serve static pages.

eg:

	narf.pageServer( {

		port : 8080,
		path :  __dirname + '/www_root',
		error_page : 'err.html'
	} );

The error_page parameter is optional, the server will route the user to this page in the event of a 404, it this property is left out, the default narf error page will appear.

## Example.js

Examples of narf implementation can be found in examples/ or on the narf <a href="https://github.com/divanvisagie/NARF/wiki/Usage-Examples">wiki</a>.

## Configurable Functionality

### POST Body Limit

By default POST will only accept data shorter than 1e6 in length for security purposes , this
constraint may be modified or disabled in lib/config.json

### HTTPS

HTTPS is switched off by default in the config due to its requirements, if you wish to switch it on you will need to provide the relative paths to your key and certificate files.

If you want to create your own files for testing you can run generate_cert.sh( only tested on OSX ), but these certificates will be viewed as untrusted.

to generate a generate_cert.sh file run the following command:

	narf generate
or:

    narf -g

## Testing

Unit tests for narf are located in the tests directory , to run:

	node ./tests/test.js 

or:

	npm test narf

## Compatibility

NARF is only tested under OSX but should run smoothly on other platforms

## License 

### MIT License

Copyright (C) 2012 Divan Visagie

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
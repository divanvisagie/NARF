NARF 
====

Narf is a basic framework for creating a JSON API with node , it currently supports both GET and POST as well as web sockets.

The idea with NARF is that all you have to do for GET and POST is put the functions you want exposed in a particular object and everything else will be handled for you.

Narf runs on the default port 8080, this can be changed in lib/config.json

## Usage

To create a narf server all you need is to create an object with your GET and POST functions, if you wish to return an object to the client simply use a return statement to return a valid javascript object , if you do not return an object a default object will be returned as specified in lib/config.json under "default_return". After you create your functions, simply import the narf library and run narf.startHTTPServer( APIFunctions ).

### Example 

Below is an example of a simple narf server, in just these few lines , you can get a server running with GET and POST functionality:

	var narf = require( 'narf' );

	var APIFunctions = {

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

	narf.startHTTPServer( APIFunctions );

If you want to add a socket server to your server you will have to store the HTTP server variable :

	var httpServer = narf.startHTTPServer( APIFunctions );

And then pass it to the socket server with a callback function.

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

The request in the socket server is passed to the callback function , from there , you have control to accept the request 
and do the rest of the processing.

### Example.js

An example of narf implementation can be found in examples/example.js

### POST Body Limit

By default POST will only accept data shorter than 1e6 in length for security purposes , this
constraint may be modified or disabled in lib/config.json

## Configuration

The default configuration for the server is located in lib/config.json. if you want to pass a custom configuration to narf you should do so using narf.configure( config_JSON )

eg:

	narf.configure( require( './config' ) );

or:

	narf.configure({
		
			"debug" : true,
			"port" : 8081,
			"auto_port_min" : 8000,
			"auto_port_max" : 8100,

			"https" : false,
			"key_path" : "./key.pem",
			"cert_path" : "./cert.pem",

			"limit_post_size" : true,
			"post_size_limit" : 1e6,
			"url_selection" : true,
			"default_return" : { 

				"result" : "succeeded"
   		}
	});


By defualt it covers the server port , a post 
body size limit and an option to remove the limit as well as a bool value to determine if the client should
be able to select serverfunction via the url.

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
	  "default_return" : { 

	  		"result" : "succeeded"
	   }
	}

### port

The port property lets you assign the NARF server to a port, alternatively you can use the value "auto" and then set the auto_port_min and auto_port_max appropriately to have narf automatically assign itself a port.

## HTTPS

HTTPS is switched off by default in the config due to its requirements, if you wish to switch it on you will need to provide the relative paths to your key and certificate files.

If you want to create your own files for testing you can run generate_cert.sh( only tested on OSX ), but these certificates will be viewed as untrusted.

## Testing

There is a simple test located in the tests directory , to run:

	node ./tests/test.js 

This is a simple client to check if the server is working properly.

## Dependancies

### Portastic

Portastic allows automatic port assignment for NARF

	npm install portastic

### Websocket

Websocket allows for , well websocket support

	npm install websocket

## License 

### MIT License

Copyright (C) 2012 Divan Visagie

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

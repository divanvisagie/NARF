HttpServer
==========

HttpServer is the main object in creating narf web services, all methods for creating narf style services are performed on this object.

Setup of this object is as follows , it takes one object costructor and that is the config object.

	var narf = require( 'narf' );


	var narfHttp = new narf.HttpServer({

		port : 'auto'

	}).start();

The configuration pbject supports the following properties

[ insert table here ]


## Functions

start()



## Events

### port

The port event is fired when the HttpServer 

	narfHttp.on( 'port', function( port ){

		console.log( data );

	} );

### error

	narfHttp.on( 'error', function( err ){

		console.log( err );
	} );








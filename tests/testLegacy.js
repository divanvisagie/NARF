#! /usr/bin/env node

/*
	Test API key: 50e85fe18e17e3616774637a82968f4c
*/

var hostname = 'localhost';

var http = require( 'http' ),
	colors = require( 'colors' ),
	events = require( 'events' ),
	sys = require( 'sys' ),
	request = require( 'request' ),
	fs = require( 'fs' ),
	q = require( 'q' );

function performRequest( method ){

	var deferred = q.defer();
	var toReturn;

	var testObject = {

		'testText' : 'here is some text',
		'testNumber' : 1001001
	};

	var userString = JSON.stringify( testObject );

	var headers = {

		'Content-Type' : 'text/json',
		'Content-Length' : userString.length,
		'serverfunction' : 'loopBack',
		'key' : '50e85fe18e17e3616774637a82968f4c'
	};

	var options = {

		host: hostname,
		port: 8080,
		headers: headers
	};

	options.method = method || 'POST';

	var req = http.request( options, function ( res ) {

		res.setEncoding('utf-8');

		var responseString = '';

		res.on('data', function(data) {
			responseString += data;
		});

		res.on('end', function() {
			var resultObject = JSON.parse(responseString);

			
			//console.log(responseString);

			if ( method === 'POST' ){
				if ( responseString === '{"testText":"here is some text","testNumber":1001001}' )
					toReturn = true;
				else{
					toReturn = false;
					
				}
			}
			else{
				if ( responseString === '{"headers":{"content-type":"text/json","content-length":"53","serverfunction":"loopBack","key":"50e85fe18e17e3616774637a82968f4c","host":"localhost:8080","connection":"keep-alive"},"url":{}}' )
					toReturn = true;
				else
					toReturn = false;
				console.log( 'response string: '.red + responseString );
			}

			deferred.resolve( toReturn );
		} );
	});

	req.write(userString);
	req.end();

	return deferred.promise;
}

function nukeTest(){

	var deferred = q.defer();

	var testObject = {

	'testText' : 'here is some text',
	'testNumber' : 1001001
	};

	//build some massive data
	testObject.nukeData = '';

	while (testObject.nukeData.length < 1e7)
		testObject.nukeData += 'a';

	var userString = JSON.stringify(testObject);

	var headers = {

		'Content-Type' : 'text/json',
		'Content-Length' : userString.length,
		'serverfunction' : 'loopBack',
		'key' : '50e85fe18e17e3616774637a82968f4c'
	};

	var options = {
		host: hostname,
		port: 8080,
		method: 'POST',
		headers: headers
	};

	options.method = 'POST';


	var req = http.request( options, function ( res ) {
		res.setEncoding('utf-8');

		var responseString = '';

		res.on('data', function(data) {

			responseString += data;
		});

		res.on('end', function() {

			var resultObject = JSON.parse( responseString );

			if( responseString === '{"error":"Data was larger than the specified limit ,this is viewed as suspicious activity"}' )
				deferred.resolve( true );
			else
				deferred.resolve( false );
		});

	});

	req.write( userString );
	req.end();


	return deferred.promise;
}

/*Test web socket functionality*/
function socketTest(){

	var deferred = q.defer();
	var WebSocketClient = require( 'websocket' ).client;

	var client = new WebSocketClient();


	client.on( 'connectFailed', function( error ){

		console.log( 'Connection error: '.red + error.red);
		deferred.resolve( false );
	});

	client.on( 'connect', function( connection ){

		console.log( 'Websocket client connected' );
		connection.on( 'error', function( error ){

			console.log('Connection error: ' + error.toString() );
			deferred.resolve( false );
		} );

		connection.on( 'close', function(){

			console.log('echo-protocol Connection Closed');
		} );

		connection.on( 'message', function( message ){

			if (message.type === 'utf8') {
				//console.log("Received: '" + message.utf8Data + "'");
				if ( message.utf8Data === '{"message":"test message"}' )
					deferred.resolve( true );
				else
					deferred.resolve( false );
			}
		} );

		function sendMessage(){

			if (connection.connected) {
	
				var obj = JSON.stringify( { serverfunction : 'loopBack', message : 'test message' } );
				connection.sendUTF( obj );
			}
		}
		sendMessage();

	} );

	client.connect('ws://localhost:8080/', 'echo-protocol');
	
	return deferred.promise;
}

function authTest(){


}


/* Start unit Tests*/
function startTest(){

	var testCount = 5;
	var testCountFlag = 0;
	var testPassed = true;

	var e = new events.EventEmitter();

	e.on( 'increment', function( val ){

		testCountFlag += val;
		if (testCountFlag >= testCount){

			console.log( 'All tests completed.' );
			e.emit( 'complete', testPassed );
		}
	} );

	console.time('GET');
	performRequest( 'GET' ).then( function( passed ){

		console.timeEnd('GET');
		console.log(passed ? 'passed'.cyan : 'failed'.red);

		if (!passed) testPassed = passed;

		e.emit('increment',1);
	} );

	console.time( 'POST' );
	performRequest( 'POST' ).then( function( passed ){

		console.timeEnd( 'POST' );
		console.log(passed ? 'passed'.cyan : 'failed'.red);
		
		if (!passed) testPassed = passed;

		e.emit( 'increment',1 );
	} );

	console.time( 'Nuke' );
	nukeTest( ).then( function( passed ){

		console.timeEnd( 'Nuke' );
		console.log( passed ? 'passed'.cyan : 'failed'.red );

		if (!passed) testPassed = passed;
		
		e.emit('increment',1);
	} );

	console.time( 'Socket' );
	socketTest( ).then( function( passed ){

		console.timeEnd( 'Socket' );
		console.log( passed ? 'passed'.cyan : 'failed'.red );

		if (!passed) testPassed = passed;
		
		e.emit( 'increment',1 );
	} );

	console.time( 'Page' );
	request( 'http://localhost:8079', function( error, response, body ){

		//console.log( body );

		/* See if the body matches the file we have */
		var fileStream = fs.createReadStream( __dirname + '/www_root/index.html' );
		var d = '';
		fileStream.on('data', function ( data ) {
			d += data;

		});
		fileStream.on('end', function() {

			var passed = false;
			if( body === d )
				passed = true;

			console.log( passed ? 'passed'.cyan : 'failed'.red );
			if (!passed) testPassed = passed;

			console.timeEnd( 'Page' );
			e.emit( 'increment',1 );
		
		});

		


	} );

	
	return e;
}

function tearDown(){

	process.exit();
}

function authentication_function( req, url_object ){

	var deferred = q.defer();
	var api_key = '50e85fe18e17e3616774637a82968f4c';

	if ( req.headers.key ){

		if( req.headers.key === api_key )
			deferred.resolve( true );
		else
			deferred.resolve( false );
	}
	else if ( url_object.key ){

		if( req.headers.key === api_key )
			deferred.resolve( true );
		else
			deferred.resolve( false );
	}
	else
		deferred.resolve( false );

	return deferred.promise;
}

/* Unit test Set up */
function setUp(){

	var deferred = q.defer();
	/* Create socket and http functions*/
	var narf = require('../lib/narf');

	var HTTPFunctions = {

		GET : {
			loopBack : function( headers, url, ret ){

				var obj = {};
				obj.headers = headers;
				obj.url = url;

				ret( obj );
			}
		},

		POST : {
			loopBack : function( body, url, ret ){

				console.log('server received object');
				//console.log( body );
				
				ret( body );
			}
		}
	};

	var SocketFunctions = {

		loopBack : function( messageData, conn ){

			if( messageData.message ){

				narf.getConnectedClients().forEach( function( connection ){

					connection.send( JSON.stringify( { message : messageData.message } ) );
				});

			}else{
				connection.send( JSON.stringify( { message : '' } ) );
			}
		}
	};

	function socketConnectionHandler ( req ){

		return true;
	}

	/* Start a server to test http and sockets with*/
	narf.configure( {

		port : 8080,
		debug : true,
		asc : true,
		socket_protocol : 'echo-protocol',
		auth_function : authentication_function

	} ).then( narf.startHTTPServer( HTTPFunctions, function( hs ){

		narf.narfSocketServer( SocketFunctions, socketConnectionHandler );
		deferred.resolve( 'Set up complete' );

	} ) );

	narf.pageServer( {
//
		port : 8079,
		path : __dirname + '/www_root'
		
	} );

	// var narfHttp = new narf.httpServer({ port : 8080 });
	// narfHttp.addAPI( HTTPFunctions );
	// narfHttp.start();

	// narfHttp.on( 'port', function( data ){
	// 	console.log( 'started server on port',data );
	// } );


	return deferred.promise;
}

console.time('done');

setUp().then( startTest().on('complete', function ( passed ){

	console.log( 'Unit test completion status:');
	console.log( passed ? 'passed'.cyan : 'failed'.red );

	console.timeEnd('done');
	tearDown();

} ) );



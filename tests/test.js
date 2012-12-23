
var hostname = 'localhost';

var http = require( 'http' ),
	colors = require( 'colors' ),
	EventEmmiter = require( 'events' ).EventEmmiter,
	sys = require( 'sys' ),
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
		'serverfunction' : 'loopBack'
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

			console.log( '\n' + method + ' object returned :' );
			console.log(responseString);

			if ( method === 'POST' ){
				if ( responseString === '{"testText":"here is some text","testNumber":1001001}' )
					toReturn = true;
				else
					toReturn = false;
			}
			else{
				if ( responseString === '{"headers":{"content-type":"text/json","content-length":"53","serverfunction":"loopBack","host":"localhost:8080","connection":"keep-alive"},"url":{}}' )
					toReturn = true;
				else
					toReturn = false;
			}

			deferred.resolve( toReturn );
		} );
	});

	req.write(userString);
	req.end();

	return deferred.promise;
}

function nukeTest(){

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
		'serverfunction' : 'loopBack'
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

			console.log( '\n' + 'Nuke test' + ' object returned :' );
			console.log( responseString );

		});

	});

	req.write( userString );
	req.end();
}


// nukeTest();


/* Start unit Tests*/

console.log( EventEmmiter );
function startTest(){

	events.EventEmmiter.call(this);
	console.log( 'Testing GET' );
	performRequest( 'GET' ).then( function( passed ){

		console.log('GET test:');
		console.log(passed ? 'passed'.cyan : 'failed'.red);
	} );
	console.log( 'Testing POST' );
	performRequest( 'GET' ).then( function( passed ){

		console.log('POST test:');
		console.log(passed ? 'passed'.cyan : 'failed'.red);
		
	} );

	this.emit( 'complete' );
	
}
sys.inherits( startTest ,new EventEmmiter() );



var httpServer;

function tearDown(){

	console.log( 'Tear down was called' );
	//httpServer.destroy();
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
				console.log( body );
				
				ret( body );
			}
		}
	};

	var SocketFunctions = {

		loopBack : function( messageData, conn ){

			if( messageData.message ){

				narf.getConnectedClients().forEach( function( connection ){

					if(conn !== connection)
						connection.send( JSON.stringify( { message : messageData.message } ) );
				});
			}else{
				connection.send( JSON.stringify( { message : '' } ) );
			}
		}
	};

	function socketConnectionHandler ( request ){

		return true;
	}

	/* Start a server to test http and sockets with*/
	narf.configure( {

		port : 8080,
		debug : true,
		asc : true

	} ).then( narf.startHTTPServer( HTTPFunctions, function( hs ){

		httpServer = hs;

		narf.narfSocketServer( SocketFunctions, socketConnectionHandler );
		deferred.resolve( 'Set up complete' );

	} ) );

	return deferred.promise;
}

console.time('done');

setUp().then( startTest().on('complete', function ( arg ) {
	tearDown();
}  ) );

console.timeEnd('done');

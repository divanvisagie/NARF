exports.performTest = function(){

	var hostname = 'localhost';

	console.time('done');

	var http = require( 'http' );

	function performRequest( method ){

		var testObject = {

			'testText' : 'here is some text',
			'testNumber' : 1001001
		};

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

			} );
		});

		req.write(userString);
		req.end();
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

	performRequest( 'POST' );
	performRequest( 'GET' );
	nukeTest();

	console.timeEnd('done');
};


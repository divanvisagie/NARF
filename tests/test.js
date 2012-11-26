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
  host: 'localhost',
  port: 8080,
  method: 'POST',
  headers: headers
};


var http = require( 'http' );

function performRequest( method ){

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

		});

	});

	req.write(userString);
	req.end();
}

performRequest( 'POST' );
performRequest( 'GET' );


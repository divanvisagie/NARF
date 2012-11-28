NARF 
====

Narf is a basic framework for creating an API with node , it currently supports both GET and POST


The idea with NARF is that all you have to do for GET and POST is put the functions you want exposed in a particular object and everything else will be handled for you.

Narf runs on the default port 8080, this can be changed in config.json

## Usage

Both GET and POST functions are declared in api_functions and functions added to these 
objects will automatically be available externally. The function is selected from the value of the 
header serverfunction (can be passed via url for GET), each function must have a return statement and 
return a valid object to the client.

Each GET function is passed a 'headers' and 'url' object.

Each POST function is passed a 'body' object which contains the post body.

	exports.GET = {  //headers object and parsed url are passed as a parameter for get functions
	
		loopBack : function( headers, url ){
				
			return { 'headers' : headers, 'parsedURL' : url };
		}
	};

	exports.POST = {  //post body is passed as a parameter for POST functions
	
		loopBack : function( body ){
	
			return body;
		}
	};

Both GET and POST contain the default function loopBack for testing purposes which returns the data 
that was passed to it.

### POST Body Limit

By default POST will only accept data shorter than 1e6 in length for security purposes , this
constraint may be modified or disabled in config.json

## Private functions

It is not required , but it is recommended that private functions be placed in the Private object;


## Configuration

Configuration for the server is located in config.json, by defualt it covers the server port , a post 
body size limit and an option to remove the limit as well as a bool value to determine if the client should
be able to select serverfunction via the url.

	{
	  "port" : 8080,
	  "limit_post_size" : true,
	  "post_size_limit" : 1e6,
	  "url_selection" : true
	}

## Testing

There is a simple test located in the tests directory , to run:

	node ./tests/test.js 

This is a simple client to check if the server is working properly.

## Dependancies

### Portastic

Portastic allows automatic port assignment for NARF

	npm install portastic

## License 

### MIT License

Copyright (C) 2012 Divan Visagie

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

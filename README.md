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

## Functions

	pageServer()

	startHTTPServer()

	configure()				-	depricated

	narfSocketServer()		-	depricated

	getConnectedClients()	- 	depricated

	setDebug()
	
## Classes

	### HttpServer

		#### Functions:

		start()

		#### Events:

		port 

		error


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
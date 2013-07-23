NARF 
====

[![Travis](https://travis-ci.org/divanvisagie/NARF.png)](https://travis-ci.org/divanvisagie/NARF)
[![NPM version](https://badge.fury.io/js/narf.png)](http://badge.fury.io/js/narf)
[![NGN Dependencies](https://david-dm.org/divanvisagie/narf.png)](https://david-dm.org/divanvisagie/narf)


Narf is a basic framework for creating a JSON API with node , it supports both HTTP ( With a selection of verbs ) as well as web sockets.

The idea with NARF is that all you have to do for HTTP and Socket is put the functions you want exposed in a particular object and everything else will be handled for you. For HTTP, data is returned to the client either by use of a callback function , which will automatically convert the data to a JSON format ,ie: 'callback( [object data] )` or by piping data directly back into the response object.

Supported HTTP verbs ( as of 0.2.1 ):

* GET

* HEAD

* PUT

* POST

* DELETE

## Usage

### Installation 

    npm install narf

If you want command line functionality then the following is suggested:

	sudo npm install -g narf
	
#### Versoning

If you are looking for an earlier version of narf for any reason ,simply specify the version in npm: 

	npm install narf@x.x.x

### Functions

* pageServer()

* configure()				-	depricated

* narfSocketServer()		-	depricated

* getConnectedClients()		- 	depricated

* setDebug()
	
### Classes

#### HttpServer

* ##### Functions:  

    * start()

    * addAPI()

    * addWebSocket( )

* ##### Events:

    * port 

    * error

## Documentation

Documentation can be found in Docs.md or [here](http://divanvisagie.github.com/NARF/)
## Examples

Examples of narf implementation can be found in examples/ or on the narf [wiki](https://github.com/divanvisagie/NARF/wiki/Usage-Examples)

## Compatibility

NARF is  tested under OSX and can run on Windows as well but should run smoothly on other platforms

## Configurable Functionality

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

Legacy
======

Narf has some legacy functions , they work perfectly but are depricated because their designs were not futureproof. These depricated functions are still functional and their docuentation can be found [here](https://github.com/divanvisagie/NARF/wiki/Legacy)

## License 

### MIT License

Copyright (C) 2012 Divan Visagie

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

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

Documentation
=============

## HttpServer

HttpServer is the main object in creating narf web services, all methods for creating narf style services are performed on this object.

Setup of this object is as follows:

    var narf = require( 'narf' );

    var narfHttp = new narf.HttpServer();


HttpServer takes one constructor parameter of type object with the following properties:

| Property      | Description                                                               |
|---------------|---------------------------------------------------------------------------|
| auto_port_min | Set the minimum port number for auto ports                                |
| auto_port_max | Set the maximum port number for auto ports                                |
| port          | Set the port number (this is optional as it can be set in `start()` )     |

## Functions

The following functions belong to the HttpServer object.

### start( port )

Start does what it says, it starts up the http server on a particular port by specifying it in the parameter, the port can be a port number of the string 'auto' which will automatically find the most suitable port

eg:


    narfHttp.start( 8080 )


### addAPI( config )

This function adds an object with HTTP verb functions as an API at the set URL , this function can be used multiple times to add web APIs to different urls, but will cause an error if the urls conflict.

eg:


    var HTTPFunctions = {

        GET : {
            loopBack : function( data, callback ){

                var obj = {};
                obj.headers = data.headers;
                obj.url = data.url;

                callback( obj );
            },
            override : function( data, ret ){

                /* This function overrides the narf callback structure and 
                pipes data directly into the response object */

                data.response.writeHead( 404, { 'Content-Type' : 'text/html' } );

                var fileStream = fs.createReadStream( __dirname + '/index.html' );
                fileStream.pipe( data.response );
            }
        },

        POST : {
            loopBack : function( data, callback ){

                console.log('server received object');
                console.log( data.url );
                
                callback( data.body );
            }
        }
    };

    narfHttp.addAPI( {
        functions : HTTPFunctions,
        datalimit : 1e6
    } );

addAPI() takes a single object as a parameter with the following properties:

| Property      | Description                                      |
|---------------|--------------------------------------------------|
| functions     | This is the object containing your api functions |
| datalimit     | This sets a limit on the size of a POST body     |
| url           | the url at which the api will sit                |
| body_wait     | If this is set to true then for POST functions, NARF will wait for the body data to be fully transmitted first and will pass the data as 'body' in the data parameter, if it is set to false , the 'body' attribute will be null and body data must be handled manually |


HTTP functions recieve a data and a callback parameter. The data parameter is an object with the following properties:


| Property  | Description                                                                                                  |
|-----------|--------------------------------------------------------------------------------------------------------------|
| body      | This is the body of the request ( This property is only available if there was data written to the request ) |
| url       | This is a parsed object of the request URL                                                                   |
| headers   | Object containing the request headers                                                                        |
| request   | The original request object as recieved by the http server                                                   |
| response  | This is the response object handed to the function by the http server , you can use this instead of the callback to write data back to the client if you want to override narf's typical json callback |


### addWebSocket( config )

addWebocket() adds websocket functions to the httpserver in a similar way to how HTTP APIs are handled but only one socket server can be added to an http server.

eg:

    var SocketFunctions = {

        loopBack : function( data ){

            if( data.messageData.message ){

                narfHttp.connected_clients.forEach( function( connection ){

                    connection.send( JSON.stringify( { message : data.messageData.message } ) );
                });

            }else{
                connection.send( JSON.stringify( { message : '' } ) );
            }
        }
    };
    function socketConnectionHandler ( req ){

        return true;
    }

    /* here addWebSocket is wrapped in the port event as web sockets require the http
    server to be up when being initialized */

    narfHttp.on( 'port', function( data ){
        console.log( 'started server on port',data );

        narfHttp.addWebSocket( {
            functions : SocketFunctions,
            request : socketConnectionHandler,
            asc : false,
            protocol : 'echo-protocol'
        } );
    } );


addWebSocket() takes a single config object as an argument with the following properties:

| Property      | Description                                                                    |
|---------------|--------------------------------------------------------------------------------|
| functions     | This is the object containing your socket functions                            |
| request       | This sets a limit on the size of a POST body                                   |
| asc           | Boolean value that determines if socket connections are automatically accepted |
| protocol      | Sets the websocket protocol           

## Events

An instance of a narf HttpServer will fire the following events.

#### port

The port event is fired when the HttpServer starts up and returns the port number on which the server is running

    narfHttp.on( 'port', function( port ){

        console.log( data );

    } );

#### error

    narfHttp.on( 'error', function( err ){

        console.log( err );
    } );


# pageServer

### narf.pageServer()

With narf.pageServer() you can serve static pages on a specified port. To start a page server simply call the narf.pageServer function and pass in a configuration object containting the port and path properties, port sets the port number for the web server and path sets the path to the directory from which you wish to serve static pages.

eg:

    narf.pageServer( {

        port : 8080,
        path :  __dirname + '/www_root',
        error_page : 'err.html'
    } );

pageServer() takes a single object as a parameter with the following properties:

| Property      | Description                                      |
|---------------|--------------------------------------------------|
| port          | Sets the port number for the page server         |
| paths         | The path to the website root                     |
| error_page    | name / path of custom error page                 |

The error_page parameter is optional, the server will route the user to this page in the event of a 404, it this property is left out, the default narf error page will appear.

## setDebug

This function simply takes one boolean argument, when set to true things internal code will print debug info to the console.

## Accessing the Web API's

All API functions are accessed in one of two ways, either by URL or by header by setting the value serverfunction to the name of the api function you wish to call. For example to call the function loopBack in the addAPI() example by url:

    http://localhost:8080?serverfunction=loopBack

Of corse we could have also created a request in javascript to the url http://localhost:8080 
and set the value of serverfunction in the header to 'loopBack'.

More examples of narf client implementation can be found in tests/ or on the narf [wiki](https://github.com/divanvisagie/NARF/wiki/Usage-Examples)

## Legacy

Narf has some legacy functions , they work perfectly but are depricated because their designs were not futureproof. These depricated functions are still functional and their docuentation can be found [here](https://github.com/divanvisagie/NARF/wiki/Legacy)


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

License
======= 

### MIT License

Copyright (C) 2012 Divan Visagie

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
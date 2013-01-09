var http = require( 'http' ),
	url = require( 'url' ),
	fs = require( 'fs' ),
	events = require( 'events' ),
	mime = require( 'mime' );

/*
	pageServer takes a configuration object as a parameter and creates a
	server for static web pages by searching in the specified directory for
	requested files.
*/
exports.narfPageServer = function( config ){

	var ev = new events.EventEmitter();

	/* Diplays the cannot be found message if 404 occurs */
	function pageError( response, pagePath ){

		var fileStream = fs.createReadStream( pagePath || __dirname +  '/page_error.html' );
		fileStream.on('data', function ( data ) {
			response.write( data );
		});
		fileStream.on('end', function() {
			response.end();
		});

		response.writeHead( 404, { 'Content-Type' : 'text/html' } );
	}

	/* Evaluate the config to make sure everything is ok */

	if ( !config.port )
		ev.emit( 'error', 'PageServer requires a port' );
	else if ( !config.path )
		ev.emit( 'error', 'PageServer requires a path' );

	if( config.port && config.path ){
		http.createServer( function( request, response ){

			var uri = url.parse(request.url).pathname;
				
			if( uri === '/' ) uri += 'index.html';

			var filepath = config.path + uri;

			/* Check if the requested file exists */
			fs.exists( filepath, function( exists ) {

				if( !exists ){
					console.log( filepath + ' does not exist' );

					/* Hanlde 404 if requested page does not exist */
					response.writeHead(404, {'Content-Type': 'text/plain'});

					if(!config.error_page){
						pageError( response );
					}
					else{
						var err_page_path = config.path + config.error_page;
						console.log( 'error page path'.cyan + err_page_path );
						fs.exists( err_page_path, function( exists ){

							if( exists ){
								console.log( 'found error page' );

								var fileStream = fs.createReadStream( err_page_path );
								fileStream.on('data', function ( data ) {
									response.write( data );
								});
								fileStream.on('end', function() {
									response.end();
								});

							}
							else{
								/* 404 inception occurs when the custom 404 page cannot be found */
								pageError( response );
							}
						} );
					}
				}else{

					/* Get the mime type */
					var type = mime.lookup( filepath );
					
					var fileStream = fs.createReadStream( filepath );
					fileStream.on('data', function ( data ) {
						response.write( data );
					});
					fileStream.on('end', function() {
						response.end();
					});

					response.writeHead( 200, { 'Content-Type' : type } );
				}
			} );

		} ).listen( config.port );

		return ev;
	}
};
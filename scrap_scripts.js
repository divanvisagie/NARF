var fs = require( 'fs' ),
	crypto = require( 'crypto' );

var Private = {

	writeLog : function( string ){

		file_data = '';
		fs.readFile( 'log.txt','utf-8', function( error, data ){
			file_data += data;
		} );
		fs.writeFile( 'log.txt', file_data + string );
	},

	MD5 : function( string ){

		try{
			return crypto.createHash( 'md5' ).update( string ).digest( 'hex' );
		}
		catch ( ex ){
			return 'Error: ' + ex;
		}
	},

	generateToken : function(){

		if(arguments.length <= 1) //must have at least two arguments
			return 0;

		var string = '';
		for (var i=0; i<arguments.length; i++){

			string += arguments[i];

		}

		return this.MD5( string );
	}
};
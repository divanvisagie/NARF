var jsonxml = require('jsontoxml');

var supportedTypes = [
  'text/json',
  'application/json',
  'text/xml'
];

var processType = function( data, type ){

  /*TODO: this should move to where it can be used by everything*/
  switch( type ){ 

    case( 'text/json' ):
      this.end(JSON.stringify( data ));
      break;

    case( 'application/json' ):
      this.end(JSON.stringify( data ));
      break;

    case( 'text/xml' ):
      this.end(jsonxml( data ));
      break;

    default:
      this.end(JSON.stringify( data ));
      // console.log( 'type is ----' , type );
      break;
  }
};

module.exports.extend = function( res ){

  if ( res.hasOwnProperty( 'endWithType' ) ){

    return;
  }

  res.endWithType = processType;
};

module.exports.supportedTypes = supportedTypes;
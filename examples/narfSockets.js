var narf = require( '../lib/narf' );

var APIFunctions = {

  GET : {

    loopBack : function ( headers, url ){

      return { 'headers' : headers, 'url' : url };
    }
  }
};


var SocketFunctions = {

  updateAll : function( messageData, conn ){

    if( messageData.message ){

      narf.getConnectedClients().forEach( function( connection ){

        if (conn != connection)
          connection.send( JSON.stringify({ message : messageData.message }) );
      });

    }else{

      connection.send( JSON.stringify( { message : '' } ) );
    }
  }
};

function connectionHandler( request ){

  console.log( 'connections open: ' +  narf.getConnectedClients().length );
  return true;
}

narf.configure( {

  port : 8080

} ).then( narf.startHTTPServer( APIFunctions , function(){

  narf.narfSocketServer( SocketFunctions, connectionHandler );

} ) );


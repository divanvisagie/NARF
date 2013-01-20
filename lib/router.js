var httpProxy = require( 'http-proxy' );
var events = require( 'events' );

/* Balancer creates a proxy utilising a list , based on this simple round robin balancer
https://github.com/nodejitsu/node-http-proxy/blob/master/examples/balancer/simple-balancer.js

var addresses = [
  {
    host: 'ws1.0.0.0',
    port: 80
  },
  {
    host: 'ws2.0.0.0',
    port: 80
  }
];

TODO: find better solution than round robin routing

 */
exports.balancer = function( nodes, port ){

	console.log( typeof nodes );

	var ev = new events.EventEmitter();
	if( !nodes || typeof nodes !== 'object' ){
		ev.emit( 'error', 'balancer() requires an address list' );
		return;
	}

	console.log( 'creating balancer on port ', port );

	httpProxy.createServer( function (req,res,proxy){


		/* on each request get a target server from the list */
		var targetServer = nodes[0];

		/* then proxy to which ever  */
		console.log( 'balancing request to:', targetServer );
		proxy.proxyRequest( req, res, targetServer );

		
		/* TODO: improve logig */
		var tmp  = nodes[0];
		var tmp2 = nodes[nodes.length-1];
		nodes[nodes.length] = tmp;
		nodes[0] = tmp2;


	} ).listen(port);

};
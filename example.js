var nnf = require('./lib/nnf');

var server = new nnf.Server({
  type: 'text/json'
}).on('port', function( port ){

  console.log('listening on port:', port);

  var router = new nnf.Router({
    type: 'text/json'
  }).setHandler({

    GET: {
      test: function(data, cb){

        cb({ 'test':'value' });
      }
    }
  }).setAuth(function(data, cb){

    cb(false);
  });
  server.addRouter(router);

  var r = new nnf.Router({
    path: '/simple',
    type: 'text/json'
  }).setHandler(function(data, cb){

    cb({ 'simple':'value' });
  });
  server.addRouter(r);

});
server.listen(8080);



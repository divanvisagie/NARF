var nnf = require('./lib/nnf');

var server = nnf.createServer({
  type: 'text/json'
});
server.listen(8080);

var router = new nnf.Router({
  path: '/test',
  type: 'text/json'
}).setHandler({

  GET: {
    test: function(data, cb){

      cb({ 'test':'value' });
    }
  }
});
server.addRouter(router);

var r = new nnf.Router({
  path: '/simple',
  type: 'text/json'
}).setHandler(function(data, cb){

  cb({ 'simple':'value' });
});
server.addRouter(r);

var nnf = require('./lib/nnf');

this.nnfServer = nnf.createServer({
  type: 'text/json'
});
this.nnfServer.listen(8080);

var router = new nnf.Router({
  path: '/test',
  type: 'text/json'
});

this.nnfServer.addRouter(router);

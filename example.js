var nnf = require('./lib/nnf');

this.nnfServer = nnf.createServer();
this.nnfServer.listen(8080);

var router = new nnf.Router({
  path: '/test',
  type: 'text/xml'
});

this.nnfServer.addRouter(router);
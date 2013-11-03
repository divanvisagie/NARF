var core = require('../lib/core.js');

exports['core'] = {

  setUp: function( done ) {
    done();
  },
  tearDown: function( done ) {
    done();
  },
  mock: function( test ) {
    test.expect(1);
    
    var options = {
      min: 8000,
      max: 8080
    };

    core.findPort( options, function( port ){
      test.equal( port, 8000 );
      test.done();
    });
  }

};
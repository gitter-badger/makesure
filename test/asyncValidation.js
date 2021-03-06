var makesure = require('..');
var should = require('should');

makesure.register('uniq_user_email', function(email, callback){
  callback(null, false);
});

describe("async validation", function(){
  var validate = makesure(function(){
    this.attr('email').is('uniq_user_email').orSay('this e-mail is already in use');
  });

  it("returns the error message", function(done){
    validate({ email: 'foo' }, function(err, obj) {
      err.error.attrs.email.messages.should.eql({ 'uniq_user_email': 'this e-mail is already in use' });
      done();
    });
  });
});

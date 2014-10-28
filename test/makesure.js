var makesure = require('..')
var makesureNode = require('../lib/makesure-node');
var validator = require('validator');
var merge = require('merge');
var chai = require('chai');
var expect = chai.expect;
var length = validator.isLength;
var empty = function(value){
  return value.length == 0;
};

describe('makesure general api usage', function(){
  describe('makesure()', function(){
    it("returns a makesure validation node", function(){
      var node = merge({}, makesureNode);
      node.init();
      expect(makesure()).to.eql(node);
    })
  });

  describe('simple validation', function() {

    var validUser = makesure()
      .that('name').is(length, 3, 200).orSay('Minimum length is 3 and max is 200')

    describe('when invalid', function(){
      var result;
      var user = {
        name: ''
      }

      before(function(done){
        validUser.validate(user)
        .then(function(err){
          result = JSON.stringify(err);
          done()
        });
      })

      it('returns the errors on attrs', function() {

        var expectedError = {
          attrs: {
            name: ['Minimum length is 3 and max is 200']
          }
        }
        expectedError = JSON.stringify(expectedError);
        expect(result).to.equal(expectedError);
      })
    })

    describe('when valid', function(){
      var result;
      var user = {
        name: 'Wolverine'
      }

      before(function(done){
        validUser.validate(user).then(function(err){
          result = err;
          done();
        });
      });

      it('doesnt catch the error when valid', function () {
        expect(result).to.equal(null);
      })
    })
  })

  describe('nested validation', function() {
    var validAddress = makesure().that('street').isNot(empty)
                          .orSay("Can't be empty");
    var validUser = makesure()
      .that('name').is(length, 3, 200).orSay('Minimum length is 3 and max is 200')
      .and().that('address').is(validAddress);

    describe('when invalid', function() {
      var result;
      var user = {
        name: 'Spider Man',
        address: {
          street: ''
        }
      }


      before(function(done) {
        validUser.validate(user).then(function(r){
          result = JSON.stringify(r);
          done();
        });
      })

      it('returns nested errors', function() {
        var expectedError = {
          attrs: {
            address: {
              attrs: {
                street: ["Can't be empty"]
              }
            }
          }
        }
        expectedError = JSON.stringify(expectedError);
        expect(result).to.equal(expectedError);
      });
    })

    describe('when valid', function(){
      var result;
      var user = {
        name: 'Spider Man',
        address: {
          street: 'sadsad'
        }
      }

      before(function(done){
        validUser.validate(user).then(function(r){
          result = r;
          done();
        });
      })

      it('doesnt catch the error when valid', function() {
        expect(result).to.equal(null);
      })
    })

    describe('general validation', function() {

      var valid = makesure().that(function() {
          return 7 == 3; // TODO mock that new Date().getDay() ;
      }).orSay("The operation can't be performed on Sunday.")

      describe('when invalid', function() {
        var result;

        before(function(done) {
          valid.validate().then(function(r){
            result = JSON.stringify(r);
            done();
          })
        })

        it('returns a general error message when a general validation', function() {
          var expectedError = {
            messages: ["The operation can't be performed on Sunday."]
          }
          expectedError = JSON.stringify(expectedError);
          expect(result).to.equal(expectedError);
        })
      })
    })
  })
})
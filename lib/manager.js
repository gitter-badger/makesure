var merge = require('merge');
var vproto = require('./validation');
var async = require('async');

var manager = module.exports = {};

function newValidation(){
  return merge(true, vproto).init();
}

/* Initialize the entire object */
manager.init = function() {
  this._validations = [];
  this._permitted = [];
  this._alert = null;
}

/* Run the validations */
manager.execute = function(obj, callback) {
  var self = this;
  obj = merge(true, obj);

  process.nextTick(function(){
    obj = self.executeSanitize(obj);
    self.executeValidations(obj, function(err, result){
      callback(result, obj);
    });
  });
  return callback;
}

/* Permit the attributes */
manager.permit = function(arg) {
  if (typeof arg == 'string') {
    this._permitted = this._permitted.concat(arg.split(' '));
  } else if (arg instanceof Array) {
    this._permitted = this._permitted.concat(arg);
  } else {
    throw('You need to pass a string or array to permit()');
  }
  return this;
}

/* create a new validation */
manager.attrs = function() {
  var validation = newValidation();
  validation.attrs.apply(validation, arguments);
  this._validations.push(validation);
  return validation;
}
manager.attr = manager.attrs;

manager.validate = function(arg){
  var validation = newValidation();
  validation.with(arg);
  this._validations.push(validation);
  return validation;
}
manager.is = manager.validate;
manager.isNot = function(){
  return manager.is.apply(this, arguments).negative();
}

manager.alert = function(arg) {
  this._alert = arg;
  return this;
}

manager.executeSanitize = function(obj) {
  var _permitted = this._permitted;
  if(_permitted.length > 0) {
    Object.keys(obj).forEach(function(key){
      if(_permitted.indexOf(key) == -1) {
        delete obj[key]
      }
    });
  }

  return obj;
}

manager.executeValidations = function(obj, callback) {
  var error, _validations = this._validations, fns = [];
  for(var i = 0; i < _validations.length; i++) {
    var v = _validations[i];
    fns.push(function(cb) {
      v.execute(obj, cb);
    });
  }
  async.parallel(fns, function(err, results){
    var result = null;
    console.log('resultados sem meclar',JSON.stringify(results));
    for(var i = 0; i < results.length; i++) {
      result = merge.recursive(result, results[i]);
    }
    console.log('mesclado', JSON.stringify(result));
    callback(err, result);
  });

  return obj;
}
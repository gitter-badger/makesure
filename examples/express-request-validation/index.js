var makesure = require('../..');

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

var empty = function(value){
  return String(value).length == 0;
};
var length = require('validator').isLength;

makesure.register('empty', empty);
makesure.register('length', length);

var validateProduct = makesure(function(){
  this.permit('name description value')
  this.attrs('name value').isNot(empty)
  this.attr('description').is(length, 10, 200)
})

var validateCreate = makesure(function(){
  this.attr('product').with(validateProduct);
});

var router = express.Router();

router.post('/', function(req, res){
  validateCreate(req.body, function(err, newBody){
    if(err) {
      res.status(422);
      res.send(err);
    } else {
      res.status(201);
      res.send(newBody);
    }
  });
})

app.use('/products', router);

module.exports = app;

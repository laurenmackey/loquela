module.exports = function(){
  var express = require('express');
  var router = express.Router();

  router.get('/', function(req, res){
    var context = {};
    res.render('login', context);
  });

  router.post('/', function(req, res) {
    res.redirect('/');
  });

  return router;
}();

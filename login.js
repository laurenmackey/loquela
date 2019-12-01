module.exports = function(){
  var express = require('express');
  var router = express.Router();
  var db = require(__dirname + '/db/queries');
  var helpers = require('./helpers');
  const crypto = require('crypto');
  const session = require('express-session');

  router.get('/', function(req, res){
    if(helpers.notLoggedIn(req)) {
      res.render('login');
    } else {
      var context = {};
      db.getUserProfileByUserId(req.session.user.id).then(function(userProfileInfo) {
        context.topic = userProfileInfo[0].topic;
        context.username = req.session.user.username;
        res.render('logout', context);
      });
    }
  });

  router.post('/', function(req, res) {
    var context = {};
    const hash = crypto.createHash('sha256');
    hash.update(req.body.password);
    req.body.password = hash.digest('hex');
    db.getUsers().then(function(content) {
      req.session.user = helpers.loginCheck(content, req.body.username, req.body.password);
      if(req.session.user) {
        res.redirect('../');
      } else {
        context.invalidLogin = "Username or Password is Invalid...";
        res.render('login', context);
      }
    });
  });

  return router;
}();

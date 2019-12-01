module.exports = function() {
  var express = require('express');
  var router = express.Router();
  var db = require(__dirname + '/db/queries');
  var helpers = require('./helpers');
  const session = require('express-session');


  router.get('/', function(req, res) {
    if(helpers.notLoggedIn(req)) {
      res.render('login');
    }
    else {
      var context = {};
      db.getUsers().then(function(users) {
        context.allUsers =  users;
        context.username = req.session.user.username;
        db.getUserProfileByUserId(userId).then(function(userProfileInfo) {
          context.topic = userProfileInfo[0].topic;
          res.render('users', context);
        });
      });
    }
  });

  return router;
}();

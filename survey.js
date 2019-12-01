module.exports = function(){
  var express = require('express');
  var router = express.Router();
  var helpers = require('./helpers');
  var db = require(__dirname + '/db/queries');
  const session = require('express-session');

  router.get('/', function(req, res){
    //Redirect to login if user session not active
    if(helpers.notLoggedIn(req)) {
      res.redirect('../login');
    }
    else {
      //Gather username and display survey page
      var context = {};
      context.username = req.session.user.username;
      res.render("survey", context);
    }
  });

  router.post('/', function(req, res) {
    req.body.userId = req.session.user.id;
    //Checks if surveyForm has been previously created
    db.getUserProfileByUserId(req.session.user.id).then(function(content) {
      if(content.length != 0) {
        //Updates new info to user_profiles table
        db.updateUserProfile(req.body).then(function() {
          res.redirect('/');
        });
      }
      else {
        var context = {};
        //Adds new user_profile to table
        db.addUserProfile(req.body).then(function(){
          db.getUserProfileByUserId(req.session.user.id).then(function(userProfileInfo) {
            context.topic = userProfileInfo[0].topic;
            res.redirect('/');
          });
        });
      }
    });
  });

  return router;
}();

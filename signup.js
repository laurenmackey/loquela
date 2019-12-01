module.exports = function(){
  var express = require('express');
  var router = express.Router();
  var db = require(__dirname + '/db/queries');
  var helpers = require('./helpers');
  var crypto = require('crypto');
  const session = require('express-session');


  router.get('/', function(req, res){
    var context = {};
    if(helpers.notLoggedIn(req)) {
      res.render('signup', context);
    } else {
      db.getUserProfileByUserId(req.session.user.id).then(function(userProfileInfo) {
        context.topic = userProfileInfo[0].topic;
        context.username = req.session.user.username;
        res.render('logout', context);
      });
    }
  });

  router.post('/', function(req, res) {
    //Gets all users from DB
    db.getUsers().then(function(content) {
      if(!helpers.usernameCheck(content, req.body.username)) {
        //If username already exsists, return back to signup and display error
        var context = {};
        context.usernameError = "That Username Already Exists...";
        res.render("signup", context);
      }
      //If email already exsists, return back to signup and display error
      else if(!helpers.emailCheck(content, req.body.email)) {
        var context = {};
        context.emailError = "That Email Is Already In Use...";
        res.render("signup", context);
      }
      //If username does not exsist, add user info to database
      else {
        //Hash user password, set as new password
        const hash = crypto.createHash('sha256');
        hash.update(req.body.passone);
        req.body.passone = (hash.digest('hex'));
        //Add user info to to database and redirect to survey page
        db.addUser(req.body).then(
          function(content2) {
            db.getUsers().then(function(content3) {
              req.session.user = helpers.loginCheck(content3, req.body.username, req.body.passone);
              res.redirect('/survey');
            });
          },
          function(err) {
            console.log(err);
            reject(err);
          }
        );
      }
    });
  });

  return router;
}();

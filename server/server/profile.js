module.exports = function() {
    var express = require('express');
    var router = express.Router();
    var db = require('../db/queries');
    var helpers = require('./helpers');
    var session = require('express-session');

    function getProfileData(userId) {
        return new Promise(function(resolve, reject) {
            var context = {};

            db.getUserById(userId).then(function(userInfo) {
                context.username = userInfo[0].username;
                context.email = userInfo[0].email;
                signupDate = new Date(userInfo[0].created_at);
                formattedDate = (signupDate.getMonth() + 1) + '-' + signupDate.getDate() + '-' + signupDate.getFullYear();
                context.signup = formattedDate;

                db.getUserProfileByUserId(userId).then(function(userProfileInfo) {
                    if (userProfileInfo[0]) {
                        context.language = helpers.capitalizeFirstLetter(userProfileInfo[0].language);
                        context.difficulty = helpers.capitalizeFirstLetter(userProfileInfo[0].difficulty);
                        context.topic = helpers.capitalizeFirstLetter(userProfileInfo[0].topic);
                    }
                    context.imageUrl = helpers.getAvatarUrl(userId);

                    resolve(context);
                });
            });
        });
    }

    router.get('/', function(req, res) {
        if(helpers.notLoggedIn(req)) {
          res.render('login');
        } else {
          getProfileData(req.session.user.id).then(function(context) {
              res.render('profile', context);
          });
      }
    });

    router.get('/edit', function(req, res) {
        getProfileData(req.session.user.id).then(function(context) {
            res.render('edit-profile', context);
        });
    });

    // Note: This route assumes you will always have a user profile entry (via /survey)
    // before being able to update your profile
    router.post('/edit', function(req, res) {
        data = req.body;
        data.userId = req.session.user.id;

        db.updateUserProfile(data).then(function() {
            db.updateUser(data).then(function() {
                res.redirect('../profile');
            });
        });
    });

    return router;
}();

module.exports = function() {
  var express = require('express');
  var router = express.Router();
  var db = require(__dirname + '/db/queries');
  var helpers = require('./helpers');
  const session = require('express-session');

  function getProfileData(userId) {
    return new Promise(function(resolve, reject) {
      var context = {};
  
      db.getUserById(userId).then(function(userInfo) {
        db.getUserProfileByUserId(userId).then(function(userProfileInfo) {
          context.language = helpers.capitalizeFirstLetter(userProfileInfo[0].language);
          context.difficulty = helpers.capitalizeFirstLetter(userProfileInfo[0].difficulty);
          context.topic = helpers.capitalizeFirstLetter(userProfileInfo[0].topic);
          context.continue = userProfileInfo[0].topic;
          context.imageUrl = helpers.getAvatarUrl(userId);
          context.topic = userProfileInfo[0].topic;
  
          db.getPromptsByLanguage(userProfileInfo[0].language).then(function(userPrompts) {
            context.username = userInfo[0].username;
            context.prompts = userPrompts;
            resolve(context);
          });
        });
      });
    });
  }

  //Function to check how many prompts the user has completed in their selected topic
  function checkTopicProgress(language, topic, userId) {
    return new Promise(function(resolve, reject) {
      //Query DB for total number of prompts for the given user topic
      db.getResultsByTopic(language, topic, userId).then(function(userResults) {
        var context = {};
        context.topicCount = 0;
        context.topicTotal = userResults.length;

        for(var i=0; i < userResults.length; i++) {
          //If user has recieved a grade for a given prompt (that corresponds to a given topic)
          //add to counter
          if(userResults[i]["grade"] != null) {
            context.topicCount += 1;
          }
        }
        resolve(context);
      });
    });
  }

  router.get('/', function(req, res) {
    if(helpers.notLoggedIn(req)) {
      res.render('login');
    } else {
      getProfileData(req.session.user.id).then(function(context) {
        checkTopicProgress(context.language.toLowerCase(), context.topic.toLowerCase(), req.session.user.id).then(function(topicCheck) {
          //If user has not completed all topics, allow them to continue with current topic Prompts
          //If user has completed all prompts, urge user to change topics
          if(topicCheck.topicCount != topicCheck.topicTotal) {
            context.topicCount = topicCheck.topicCount;
            context.topicTotal = topicCheck.topicTotal;
          }
          //Replace underscores with spaces for context.topic to make it look nicer for homepage
          context.topic = context.topic.replace(/_/g, ' ');
          res.render('home', context);
        });
      });
    }
  });

  return router;
}();

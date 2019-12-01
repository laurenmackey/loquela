module.exports = function() {
  var express = require('express');
  var router = express.Router();
  var db = require(__dirname + '/db/queries');
  var helpers = require('./helpers');
  const session = require('express-session');

  //Function gets data Results main page that only displays prompts/feedback that
  //the user has recieved feedback/grade for
  function getPromptData(userId, req) {
    return new Promise(function(resolve, reject) {
      var context = {};
      //Get users language from profile
      helpers.getUserLanguage(userId).then(function(language) {
        context.language = helpers.capitalizeFirstLetter(language);
        //Call to get prompts that the user has completed and recievced feedback/grade for
        db.getUserCompletedResults(language, userId).then(function(userResults){
          context.prompts = userResults
          resolve(context)
        });
      });
    });
  }

  function getIndividualPrompt(promptId) {
    return new Promise(function(resolve, reject) {
      var context = {};

      db.getPromptById(promptId).then(function(promptInfo) {
        context.name = promptInfo.name;
        context.text = promptInfo.text;
        context.language = promptInfo.language;
        context.id = promptId;

        resolve(context);
      });
    });
  }

  function getResults(language, topic, userId) {
    return new Promise(function(resolve, reject) {
      var context = {};

      context.language = helpers.capitalizeFirstLetter(language);

      db.getResultsByTopic(language, topic, userId).then(function(userResults) {
        context.prompts = userResults;
        resolve(context);
      });
    });
  }

  router.get('/', function(req, res) {
    if(helpers.notLoggedIn(req)) {
      res.render('login');
    } else {
      getPromptData(req.session.user.id).then(function(context) {
        context.username = req.session.user.username;
        db.getUserProfileByUserId(req.session.user.id).then(function(userProfileInfo) {
          context.topic = userProfileInfo[0].topic;
          res.render('results-all', context);
        });
      });
    }
  });

  router.get('/:topic', function(req, res) {
    if(helpers.notLoggedIn(req)) {
      res.render('login');
    } else {
      helpers.getUserLanguage(req.session.user.id).then(function(language) {

        getResults(language, req.params.topic, req.session.user.id).then(function(context){
          context.username = req.session.user.username;
          context.topic = helpers.capitalizeFirstLetter(req.params.topic);
          res.render('results-topic', context);
        });
      });
    }
  });

  return router;
}();

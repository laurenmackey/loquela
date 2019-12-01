module.exports = function() {
  var express = require('express');
  var router = express.Router();
  var db = require(__dirname + '/db/queries');
  var helpers = require('./helpers');
  const session = require('express-session');
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

  // Sources: https://cloud.google.com/natural-language/docs/analyzing-syntax,
  // https://cloud.google.com/natural-language/docs/reference/rest/v1/Entity#EntityMention,
  // https://cloud.google.com/natural-language/docs/categories
  async function analyzeSpeech(speechSubmissionText) {
    return new Promise(async function(resolve, reject) {
      // Creates a client
      const client = new language.LanguageServiceClient();
  
      const text = speechSubmissionText;
  
      // Prepares a document, representing the provided text
      const document = {
        content: text,
        type: 'PLAIN_TEXT'
      };
  
      // Make API calls to detect syntax, classify text, and detect entities
      const [syntax] = await client.analyzeSyntax({document});
      const [result] = await client.analyzeEntities({document});
      const entities = result.entities;
  
      let syntaxAnalysis = [];    
      syntax.tokens.forEach(part => {
        // Log the part of speech from analysis
        // console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
        // console.log(`Morphology:`, part.partOfSpeech); //Additional information on part of speech
        syntaxAnalysis.push(part.partOfSpeech.tag);
      });

      let entityAnalysis = [];
      entities.forEach(entity => {
        // console.log(` - Name: ${entity.name}`);
        // console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
        entityAnalysis.push(entity.name.toLowerCase());
        entityAnalysis.push(entity.type.toLowerCase());
      });

      const speechAnalysis = {syntax: syntaxAnalysis, entities: entityAnalysis};
      resolve(speechAnalysis);
    });
  }

  function getPromptData(userId) {
    return new Promise(function(resolve, reject) {
      var context = {};

      helpers.getUserLanguage(userId).then(function(language) {
        context.language = helpers.capitalizeFirstLetter(language);

        db.getPromptsByLanguage(language).then(function(userPrompts) {
          context.prompts = userPrompts;
          resolve(context);
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

  function getPromptsRemaining(language, topic, userId) {
    return new Promise(function(resolve, reject) {
      var context = {};

      context.language = helpers.capitalizeFirstLetter(language);
      db.getRemainingPromptsByLanguageAndTopic(language, topic, userId).then(function(userPrompts) {
        context.prompts = userPrompts;
          
        db.getNumOtherPrompts(language, topic, userId).then(function(otherPrompts){
          context.other = otherPrompts; //return array of integer values for each topic num remaining prompts
          resolve(context);
        });
      });
    });
  }
  
//********************* ROUTER FUNCTIONS ***********************************/

  //Load the page to begin the prompts based on which topic the user clicks
  router.get('/:topic', function(req, res) {
    if(helpers.notLoggedIn(req)) {
      res.render('login');
    } else {
      var context = {};
      helpers.getUserLanguage(req.session.user.id).then(function(language) {
        context.language = helpers.capitalizeFirstLetter(language);
        context.username = req.session.user.username;
        context.userId = req.session.user.id;
        context.languageCode = helpers.languageToCode(context.language.toLowerCase());
        context.speechAsTextClass = 'hidden';
        
        db.updateCurrentTopic(req.session.user.id, req.params.topic).then(function(){
          res.render('lessons', context);
        });
      });     
    }
  });

  //Send data for the lessons page to parse on the fly
  //not meant to render any page
  router.get('/:topic/lesson', function(req, res) {
    if(helpers.notLoggedIn(req)) {
      res.render('login');
    } else {
      helpers.getUserLanguage(req.session.user.id).then(function(language) {    
        getPromptsRemaining(language, req.params.topic, req.session.user.id).then(function(context){
          res.send(context);
        });
      });
    }
  });


  router.post('/:topic/:id', function(req, res) {
    db.getPromptById(req.params.id).then(function(promptInfo) {
      // Analyze user submission
      analyzeSpeech(req.body.speechSubmission).then(function(speechAnalysis) {
        // Grade the analyzed speech
        let grades = {syntaxPoints: 0, entityPoints: 0, totalPoints: 0};
        let feedback = {syntax: '', entities: '', letterGrade: '', avgGrade: null};

        helpers.gradeSyntax(speechAnalysis.syntax, grades, feedback);
        helpers.gradeEntities(speechAnalysis.entities, promptInfo.entities, grades, feedback);

        // Calculate average grade
        helpers.averageGrade(grades, feedback);
        const feedbackString = `${feedback.syntax} ${feedback.entities}`;

        // Add the user's response to the database before redirecting
        dbData = {
          userId: req.session.user.id,
          promptId: req.params.id,
          text: req.body.speechSubmission,
          feedbackText: feedbackString,
          grade: Math.round(feedback.avgGrade),
          letterGrade: feedback.letterGrade
        };

        db.updatePromptActivities(dbData);
        res.redirect(`../${req.params.topic}`);
      });
    });
  });

  return router;
}();

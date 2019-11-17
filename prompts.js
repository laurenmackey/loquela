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
        const [classification] = await client.classifyText({document});
        const [result] = await client.analyzeEntities({document});
        const entities = result.entities;
    
        let syntaxAnalysis = [];    
        syntax.tokens.forEach(part => {
          // Log the part of speech from analysis
          // console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
          // console.log(`Morphology:`, part.partOfSpeech); //Additional information on part of speech
          syntaxAnalysis.push(part.partOfSpeech.tag);
        });

        let categoryAnalysis = [];
        classification.categories.forEach(category => {
          // console.log(`Name: ${category.name}, Confidence: ${category.confidence}`);
          categoryAnalysis.push(category.name.toLowerCase());
        });

        let entityAnalysis = [];
        entities.forEach(entity => {
          // console.log(` - Name: ${entity.name}`);
          // console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
          entityAnalysis.push(entity.name.toLowerCase());
          entityAnalysis.push(entity.type.toLowerCase());
        });

        const speechAnalysis = {syntax: syntaxAnalysis, categories: categoryAnalysis, entities: entityAnalysis};
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

    router.get('/', function(req, res) {
        if(helpers.notLoggedIn(req)) {
          res.render('login');
        } else {
          getPromptData(req.session.user.id).then(function(context) {
            res.render('prompts', context);
          });
        }
    });

    router.get('/:id', function(req, res) {
        if(helpers.notLoggedIn(req)) {
            res.render('login');
        } else {
            helpers.getUserLanguage(req.session.user.id).then(function(language) {
                getIndividualPrompt(req.params.id).then(function(context) {
                    context.promptId = req.params.id;
                    context.nextPromptId = +req.params.id+3;
                    console.log(context.nextPromptId);
                    context.userId = req.session.user.id;
                    context.languageCode = helpers.languageToCode(context.language.toLowerCase());

                    // Re-route to /prompts page if this specific prompt is not for the user's language
                    if (context.language != language) {
                        res.redirect('../prompts');
                    } else {
                        context.speechAsTextClass = 'hidden';
                        res.render('individual-prompt', context);
                    }
                });
            });
        }
    });

    router.post('/:id', function(req, res) {
      // TODO: add error handling for if submission is less than 20(?) words
      // TODO: check if this works for other languages
      db.getUserProfileByUserId(req.session.user.id).then(function(userProfileInfo) {
        db.getPromptById(req.params.id).then(function(promptInfo) {
          // Analyze user submission
          analyzeSpeech(req.body.speechSubmission).then(function(speechAnalysis) {
            // Grade the analyzed speech
            let grades = {syntaxPoints: 0, categoryPoints: 0, entityPoints: 0, totalPoints: 0};
            let feedback = {syntax: '', categories: '', entities: '', letterGrade: '', avgGrade: null};

            helpers.gradeSyntax(speechAnalysis.syntax, grades, feedback);
            helpers.gradeCategories(speechAnalysis.categories, userProfileInfo[0].topic, grades, feedback);
            helpers.gradeEntities(speechAnalysis.entities, promptInfo.entities, grades, feedback);

            // Calculate average grade
            helpers.averageGrade(grades, feedback);
            const feedbackString = `You got ${Math.round(feedback.avgGrade)}%, or letter grade ${feedback.letterGrade}. ${feedback.syntax} ${feedback.categories} ${feedback.entities}`;

            // Add the user's response to the database before redirecting
            dbData = {
                userId: req.session.user.id,
                promptId: req.params.id,
                text: req.body.speechSubmission,
                feedbackText: feedbackString,
                grade: feedback.avgGrade
            };

            db.updatePromptActivities(dbData);
            res.redirect('../prompts');
          });
        });
      });
    });

    return router;
}();

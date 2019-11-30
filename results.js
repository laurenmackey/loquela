module.exports = function() {
    var express = require('express');
    var router = express.Router();
    var db = require(__dirname + '/db/queries');
    var helpers = require('./helpers');
    const session = require('express-session');
    // let {PythonShell} = require('python-shell');
    // var multer = require('multer');
    // var upload = multer();
    // var fs = require('fs');
    // var tmp = require('tmp');

    //Function gets data Results main page that only displays prompts/feedback that
    //the user has recieved feedback/grade for
    function getPromptData(userId) {
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

    // function connectToSpeechRecognition(context, promptId, speechFile) {
    //     return new Promise(function(resolve, reject) {
    //         // Source: https://medium.com/@HolmesLaurence/integrating-node-and-python-6b8454bfc272
    //         var options = {args: [helpers.languageToCode(context.language.toLowerCase()), speechFile]};
    //         PythonShell.run('../python/speech_input.py', options, function(err, data) {
    //             if (err) {
    //                 console.log('Error:', err);
    //             } else {
    //                 if (data) {
    //                     console.log('data from python file is', data);
    //                     context.speechAsTextClass = 'visible';
    //                     context.speechAsText = data[0];

    //                     // Add the user's response to the database before re-rendering
    //                     dbData = {
    //                         userId: context.userId,
    //                         promptId: promptId,
    //                         text: data[0]
    //                     };

    //                     db.updatePromptActivities(dbData);
    //                 }
    //             }

    //             resolve(context);
    //         });
    //     });
    // }

    router.get('/', function(req, res) {
        if(helpers.notLoggedIn(req)) {
          res.render('login');
        } else {
          getPromptData(req.session.user.id).then(function(context) {
            res.render('results-all', context);
          });
        }
    });

    router.get('/:topic', function(req, res) {
        if(helpers.notLoggedIn(req)) {
            res.render('login');
        } else {
            helpers.getUserLanguage(req.session.user.id).then(function(language) {

              getResults(language, req.params.topic, req.session.user.id).then(function(context){

                    context.topic = helpers.capitalizeFirstLetter(req.params.topic);
                    res.render('results-topic', context);

                });
            });
        }
    });

    // router.get('/:id', function(req, res) {
    //     if(helpers.notLoggedIn(req)) {
    //         res.render('login');
    //     } else {
    //         helpers.getUserLanguage(req.session.user.id).then(function(language) {
    //             getIndividualPrompt(req.params.id).then(function(context) {
    //                 context.promptId = req.params.id;
    //                 context.nextPromptId = +req.params.id+3;
    //                 console.log(context.nextPromptId);
    //                 context.userId = req.session.user.id;
    //                 context.languageCode = helpers.languageToCode(context.language.toLowerCase());

    //                 // Re-route to /prompts page if this specific prompt is not for the user's language
    //                 if (context.language != language) {
    //                     res.redirect('../prompts');
    //                 } else {
    //                     context.speechAsTextClass = 'hidden';
    //                     res.render('individual-prompt', context);
    //                 }
    //             });
    //         });
    //     }
    // });

    // Sources: https://discourse.processing.org/t/uploading-recorded-audio-to-web-server-node-js-express/4569/4,
    // https://www.npmjs.com/package/tmp
    // Note: Leaving the file saving and python connection pieces in here as comments
    // in case we want to go this route later
    // router.post('/:id', upload.single('blob'), function(req, res) {
    router.post('/:id', function(req, res) {
        // var tmpObj = tmp.fileSync({ postfix: '.wav' });

        // fs.writeFileSync(tmpObj.name, Buffer.from(new Uint8Array(req.file.buffer)));

        var context = {};
        helpers.getUserLanguage(req.session.user.id).then(function(language) {
            // connectToSpeechRecognition(context, req.params.id, tmpObj.name).then(function(context) {
            //     res.render('individual-prompt', context);
            // });

            // Add the user's response to the database before redirecting
            dbData = {
                userId: req.session.user.id,
                promptId: req.params.id,
                text: req.body.speechSubmission
            };

            db.updatePromptActivities(dbData);
            res.redirect('../prompts');
        });
    });

    return router;
}();

module.exports = function() {
    var express = require('express');
    var router = express.Router();
    var db = require(__dirname + '/db/queries');
    var helpers = require('./helpers');
    const session = require('express-session');
    let {PythonShell} = require('python-shell');
    var multer = require('multer');
    var upload = multer();
    var fs = require('fs');
    var tmp = require('tmp');

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

    function connectToSpeechRecognition(context, promptId, speechFile) {
        return new Promise(function(resolve, reject) {
            // Source: https://medium.com/@HolmesLaurence/integrating-node-and-python-6b8454bfc272
            var options = {args: [helpers.languageToCode(context.language.toLowerCase())]};
            PythonShell.run(__dirname + '/python/speech_input.py', options, function(err, data) {
                if (err) {
                    console.log('Error:', err);
                } else {
                    if (data) {
                        console.log('data from python file is', data);
                        context.speechAsTextClass = 'visible';
                        context.speechAsText = data[0];

                        // Add the user's response to the database before re-rendering
                        dbData = {
                            userId: context.userId,
                            promptId: promptId,
                            text: data[0]
                        };

                        db.updatePromptActivities(dbData);
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
                    context.userId = req.session.user.id;

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

    // Sources: https://discourse.processing.org/t/uploading-recorded-audio-to-web-server-node-js-express/4569/4,
    // https://www.npmjs.com/package/tmp
    router.post('/:id', upload.single('blob'), function(req, res) {
        var tmpObj = tmp.fileSync({ postfix: '.wav' });

        fs.writeFileSync(tmpObj.name, Buffer.from(new Uint8Array(req.file.buffer)));

        var context = {};
        helpers.getUserLanguage(req.session.user.id).then(function(language) {
            context.language = language;
            context.userId = req.session.user.id;

            // connectToSpeechRecognition(context, req.params.id, tmpObj.name).then(function(context) {
            //     res.render('individual-prompt', context);
            // });
            res.render('individual-prompt', context);
        });
    });

    return router;
}();

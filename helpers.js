var db = require(__dirname + '/db/queries');

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getAvatarUrl(userId) {
  var imageId = (userId % 5) + 1;
  return '/images/' + imageId + '.png';
}

//Helper function to check if username already exists in database
//Returns user information (as object) if login success
//Returns false if login credentials are invalid
function loginCheck(content, username, password) {
  var i;
  for(i=0; i < content.length; i++) {
    if(content[i].username === username && content[i].password_hash === password) {
      return content[i];
    }
  }
  return false;
}

//Helper function to check if username already exists in database
function usernameCheck(content, username) {
  var i;
  for(i=0; i < content.length; i++) {
    if(content[i].username === username) {
      return false;
    }
  }
  return true;
}

//Helper function to check if email already exists in database
function emailCheck(content, email) {
  var i;
  for(i=0; i < content.length; i++) {
    if(content[i].email === email) {
      return false;
    }
  }
  return true;
}

//Checks if request does not have an associated user
function notLoggedIn(req) {
  return (!req.session.user);
}

// Because this helper is querying the database and returning a promise, it needs to be called like:
// `helpers.getUserLanguage(userId).then(function(language) { // do stuff with language }`
function getUserLanguage(userId) {
  return new Promise(function(resolve, reject) {
    db.getUserProfileByUserId(userId).then(function(userProfileInfo) {
      if (userProfileInfo) {
        resolve(userProfileInfo[0].language);
      } else {
        resolve('Unknown');
      }
    });
  });
}

function languageToCode(language) {
  languageDict = {
    'afrikaans': 'af-ZA',
    'amharic': 'am-ET',
    'armenian': 'hy-AM',
    'azerbaijani': 'az-AZ',
    'indonesian': 'id-ID',
    'malay': 'ms-MY',
    'bengali': 'bn-IN',
    'catalan': 'ca-ES',
    'czech': 'cs-CZ',
    'danish': 'da-DK',
    'german': 'de-DE',
    'english': 'en-US',
    'spanish': 'es-MX',
    'basque': 'eu-ES',
    'filipino': 'fil-PH',
    'french': 'fr-FR',
    'galician': 'gl-ES',
    'georgian': 'ka-GE',
    'gujarati': 'gu-IN',
    'croatian': 'hr-HR',
    'zulu': 'zu-ZA',
    'icelandic': 'is-IS',
    'italian': 'it-IT',
    'javanese': 'jv-ID',
    'kannada': 'kn-IN',
    'khmer': 'km-KH',
    'lao': 'lo-LA',
    'latvian': 'lv-LV',
    'lithuanian': 'lt-LT',
    'hungarian': 'hu-HU',
    'malayalam': 'ml-IN',
    'marathi': 'mr-IN',
    'dutch': 'nl-NL',
    'nepali': 'ne-NP',
    'norwegian': 'nb-NO',
    'polish': 'pl-PL',
    'portuguese': 'pt-PT',
    'romanian': 'ro-RO',
    'sinhala': 'si-LK',
    'slovak': 'sk-SK',
    'slovenian': 'sl-SI',
    'sundanese': 'su-ID',
    'swahili': 'sw-TZ',
    'finnish': 'fi-FI',
    'swedish': 'sv-SE',
    'tamil': 'ta-IN',
    'telugu': 'te-IN',
    'vietnamese': 'vi-VN',
    'turkish': 'tr-TR',
    'urdu': 'ur-PK',
    'greek': 'el-GR',
    'bulgarian': 'bg-BG',
    'russian': 'ru-RU',
    'serbian': 'sr-RS',
    'ukrainian': 'uk-UA',
    'hebrew': 'he-IL',
    'arabic': 'ar-IQ',
    'persian': 'fa-IR',
    'hindi': 'hi-IN',
    'thai': 'th-TH',
    'korean': 'ko-KR',
    'cantonese': 'yue-Hant-HK',
    'japanese': 'ja-JP',
    'chinese,': 'zh'
  };
  
  return languageDict[language];
}

// To get full points, the submission must contain:
// 2 nouns, 2 verbs, 1 of either adjective or adverb
// Max points: 5
// Min points: 0
function gradeSyntax(submission, grades, feedback) {
  let points = 0;
  const maxPoints = 5;

  const nounCount = submission.filter((syntax) => { return syntax == 'NOUN'; }).length;
  const verbCount = submission.filter((syntax) => { return syntax == 'VERB'; }).length;
  const adjCount = submission.filter((syntax) => { return syntax == 'ADJ'; }).length;
  const advCount = submission.filter((syntax) => { return syntax == 'ADV'; }).length;
  
  if (nounCount >= 2) {
    points += 2;
  } else if (nounCount == 1) {
    points += 1;
  }

  if (verbCount >= 2) {
    points += 2;
  } else if (verbCount == 1) {
    points += 1;
  }

  if (adjCount >= 1 || advCount >= 1) {
    points += 1;
  }

  grades.syntaxPoints = points;
  grades.totalPoints += maxPoints;

  if (points < maxPoints) {
    feedback.syntax = `You missed points on syntax. Next time, make sure to use 2 verbs, 2 nouns, and either an adjective or adverb.`;
  } else {
    feedback.syntax = 'You got full points on syntax. Great work!';
  }
}

// To get full points, the submission must contain:
// The prompt-specific entity word or words, defined in the `prompts` table
// Max points: Variable, depending on the number of expected entity words for this prompt
// Min points: 0
function gradeEntities(submission, expectedEntities, grades, feedback) {
  let points = 0;
  const maxPoints = expectedEntities.split(' ').length;

  submission.forEach(entity => {
    if (expectedEntities.includes(entity)) {
      points += 1;
    }
  });

  grades.entityPoints = points;
  grades.totalPoints += maxPoints;

  if (points < maxPoints) {
    feedback.entities = `You missed points because you didn't hit all the necessary concepts for your topic. Next time, try to give a more detailed answer and include these word or words: ${expectedEntities}.`;
  } else {
    feedback.entities = 'You got full points by hitting all the key points for your topic. Great work!';
  }
}

function averageGrade(grades, feedback) {
  avg = ((grades.syntaxPoints + grades.entityPoints) / grades.totalPoints) * 100;

  let letterGrade = '';
  if(avg > 89) {
    letterGrade = 'A';
  } else if (avg > 79) {
    letterGrade = 'B';
  } else if (avg > 69) {
    letterGrade = 'C';
  } else if (avg >59) {
    letterGrade = 'D';
  } else {
    letterGrade = 'F';
  }
  
  feedback.letterGrade = letterGrade;
  feedback.avgGrade = avg;
}

module.exports = {
  capitalizeFirstLetter: capitalizeFirstLetter,
  getAvatarUrl: getAvatarUrl,
  loginCheck: loginCheck,
  usernameCheck: usernameCheck,
  emailCheck: emailCheck,
  notLoggedIn: notLoggedIn,
  languageToCode: languageToCode,
  getUserLanguage: getUserLanguage,
  gradeSyntax: gradeSyntax,
  gradeEntities: gradeEntities,
  averageGrade: averageGrade
};

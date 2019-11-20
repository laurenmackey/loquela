// Source: https://blog.logrocket.com/setting-up-a-restful-api-with-node-js-and-postgresql-d96d6fc892d8/

require('dotenv').config();
console.log('Your environment variable DATABASE_URL has the value: ', process.env.DATABASE_URL);


const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl:false, //when locally developing!
  //ssl: true, //when push to remote must be true!
});

client.connect();


function getUsers() {
    return new Promise(function(resolve, reject) {
        client.query('SELECT * FROM users', function(err, results) {
            if (err) {
                console.log('Error:', err);
            }
            resolve(results.rows);
        });
    });
}

function getUserById(id) {
    return new Promise(function(resolve, reject) {
        client.query('SELECT * FROM users WHERE id = $1', [id], function(err, results) {
            if (err) {
                console.log('Error:', err);
            }
            resolve(results.rows);
        });
    });
}

function getUserProfileByUserId(userId) {
    return new Promise(function(resolve, reject) {
        client.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId], function(err, results) {
            if (err) {
                console.log('Error:', err);
            }
            resolve(results.rows);
        });
    });
}

function updateUserProfile(data) {
    return new Promise(function(resolve, reject) {
        client.query('UPDATE user_profiles SET language = $1, difficulty = $2, topic = $3 WHERE user_id = $4',
          [data.language.toLowerCase(), data.difficulty.toLowerCase(), data.topic.toLowerCase(), data.userId], function(err, results) {
            if (err) {
                console.log('Error:', err);
            }
            resolve(results.rows);
        });
    });
}

function updateUser(data) {
    return new Promise(function(resolve, reject) {
        client.query('UPDATE users SET username = $1 WHERE id = $2', [data.username, data.userId], function(err, results) {
            if (err) {
                console.log('Error:', err);
            }
            resolve(results.rows);
        });
    });
}

function addUser(data) {
  return new Promise(function(resolve, reject) {
    client.query('INSERT INTO users(email, username, password_hash) VALUES ($1, $2, $3)', [data.email, data.username, data.passone], function(err, results) {
      if (err) {
        console.log('Error:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function addUserProfile(data) {
    return new Promise(function(resolve, reject) {
        client.query('INSERT INTO user_profiles(user_id, language, difficulty, topic) VALUES ($1, $2, $3, $4)',
          [data.userId, data.language.toLowerCase(), data.difficulty.toLowerCase(), data.topic.toLowerCase()], function(err, results) {
            if (err) {
                console.log('Error:', err);
            }
            resolve(results.rows);
        });
    });
}

function getPromptsByLanguage(data) {
    return new Promise(function(resolve, reject) {
        client.query('SELECT * FROM prompts WHERE language = $1', [data], function(err, results) {
            if (err) {
                console.log('Error:', err);
            }
            resolve(results.rows);
        });
    });
}

function getPromptById(promptId) {
    return new Promise(function(resolve, reject) {
        client.query('SELECT * FROM prompts WHERE id = $1', [parseInt(promptId)], function(err, results) {
            if (err) {
                console.log('Error:', err);
            }
            resolve(results.rows[0]);
        });
    });
}

function updatePromptActivities(data) {
    return new Promise(function(resolve, reject) {
        client.query('INSERT INTO prompt_activities(user_id, prompt_id, text, feedback_text, grade) VALUES ($1, $2, $3, $4, $5)',
          [data.userId, data.promptId, data.text, data.feedback_text, data.grade], function(err, results) {
            if (err) {
                console.log('Error:', err);
            }
            resolve(results.rows);
        });
    });
}



function getRemainingPromptsByLanguageAndTopic(language, topic, userId) {
    return new Promise(function(resolve, reject) {
        client.query('SELECT prompts.name, prompts.text, prompts.id FROM prompts LEFT OUTER JOIN prompt_activities ON prompt_activities.prompt_id = prompts.id WHERE language = $1 AND topic = $2 AND user_id is null OR language = $1 AND topic = $2 AND user_id != $3 ORDER BY prompts.id ASC', [language, topic, userId], function(err, results) {
            if (err) {
                console.log('Error:', err);
            }
           
            
            resolve(results.rows);
        });
    });
}

function getResultsByTopic(language, topic, userId) {
    return new Promise(function(resolve, reject) {
        client.query('SELECT prompts.name, prompts.text, prompts.id, prompt_activities.grade, prompt_activities.feedback_text FROM prompts LEFT OUTER JOIN prompt_activities ON prompt_activities.prompt_id = prompts.id WHERE language = $1 AND topic = $2 AND user_id is null OR language = $1 AND topic = $2 AND user_id = $3 ORDER BY prompts.id ASC', [language, topic, userId], function(err, results) {
            if (err) {
                console.log('Error:', err);
            }
           
            
            resolve(results.rows);
        });
    });
}

// Export all query functions for user here
module.exports = {
    getUsers: getUsers,
    getUserById: getUserById,
    getUserProfileByUserId: getUserProfileByUserId,
    updateUserProfile: updateUserProfile,
    updateUser: updateUser,
    addUser: addUser,
    addUserProfile: addUserProfile,
    getPromptsByLanguage: getPromptsByLanguage,
    updatePromptActivities: updatePromptActivities,
    getPromptById: getPromptById,
    getResultsByTopic: getResultsByTopic,
    getRemainingPromptsByLanguageAndTopic: getRemainingPromptsByLanguageAndTopic

};

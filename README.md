# Loquela Language Learning

## Setup
- Clone the repo onto your machine:
    ```
    git clone https://github.com/laurenmackey/loquela.git
    ```
- [Install node](https://nodejs.org/en/) if needed
- Install dependencies:
    ```
    npm install
    ```
- Set up your local database:
    - Install and start up postgres. This will vary by operating system. I followed the instructions under "Installation" [here](https://blog.logrocket.com/setting-up-a-restful-api-with-node-js-and-postgresql-d96d6fc892d8/)
    - Create a default user:
    ```
    psql postgres
    CREATE ROLE me WITH LOGIN PASSWORD 'password';
    ALTER ROLE me CREATEDB;
    \q
    ```
    - Login as default user and create loquela db:
    ```
    psql -d postgres -U me
    CREATE DATABASE loquela;
    \q
    ```
    - Create and populate tables from migration files:
    ```
    db-migrate up
    ```
    - If you need to modify the tables, either change the migration file or create a new one (`db-migrate create my-migration-title`).
    Then drop and re-create the tables:
    ```
    db-migrate reset
    db-migrate up
    ```
    - You can also use `db-migrate down` instead of `db-migrate reset` if you just want to undo the most recent migration.
    - It will probably help to download a database GUI of some sort. I downloaded Postico and set it up with the following credentials:
    ```
    Nickname: localhost
    Host: localhost
    Port: 5432
    User: me
    Database: postgres
    ```
- Set up python dependencies:
    - These instructions assume you're using python 3.3+ so you may need to install that.
    - Install SpeechRecognition and check that it worked by printing it's version number:
        ```
        pip install SpeechRecognition
        python
        import speech_recognition as sr
        sr.__version__
        exit()
        ```
    - Install and test out PyAudio:
        ```
        pip install pyaudio
        python -m speech_recognition
        ```


## Local Development
- Pull in changes from master:
    ```
    git checkout master
    git pull origin master
    ```
- Create a new branch:
    ```
    git checkout -b your-name/your-feature
    ```
- Start up the server:
    ```
    nodemon app.js
    ```
- If you get some errors related to nodemon, just run the command below and try starting up the server again:
    ```
    npm install -g nodemon
    ```
- Visit http://localhost:8080/ to see the site
- Make changes as needed
- Add, commit, push your changes
    ```
    git add .
    git status
    git commit -m "Your commit message"
    git push origin your-name/your-feature
    ```
- Submit a pull request:
    - Go to your branch on github and click "Compare and pull request"
    - Look over the files changed and add any necessary comments
    - Submit the request
- Either ask someone to review it or just approve the pull request from the master branch

## Heroku & New Way to Locally Develop
- Download Heroku CLI :
    - Go to https://devcenter.heroku.com/articles/heroku-cli
    - Create a Heroku account, I will add you as a collaborator and you'll be able to access my heroku repo
- Follow instructions for local Dev:
    - https://devcenter.heroku.com/articles/heroku-local
    - Once you're connected to https://git.heroku.com/loquela-learning.git
    - You will need to change `ssl: true` on line #12 in queries.js to `ssl: false` so that the app will use your local postgres db
    - You will also need to create a `.env` file in the root directory in order to change the environment variable which is the name of your database on your local machine. Example:   `DATABASE_URL='postgres://me:password@localhost:5432/loquela'`
    - That is it! The app will run on Port 5000, I believe since the environment var is 5000 by default. You could in theory change this in .env, though, or make it 8080 on line #3 of app.js
    ```
    heroku local
    ```
## Google Natural Language (NL) API set-up with Heroku Local Development
- Install NL API client library for Node.js :
  - if the "@google-cloud/language": "^3.6.0" dependency is located in package.json, Run `npm install`
  - Otherwise, Run `npm install --save @google-cloud/language`
- Add config file :
  - In the root directory, add a directory named: 'config'
  - In this directory, insert the Google API Service Account Key (keyFile.json file I will send to your email)
    - This key will grant any access to the NL API (from the account that was set-up) to those who hold it, Monthly FREE Quota = 5K units where 1 unit = API analysis call of < 1,000 unicode characters. https://cloud.google.com/natural-language/pricing
- Set Heroku .env PATH:
  - In .env file, set a new variable GOOGLE_APPLICATION_CREDENTIALS to the keyFile in the newly created config file. Example: `GOOGLE_APPLICATION_CREDENTIALS='./config/keyFile.json'`
    - This will give you access to the Natural Language API calls
    - That should be all to set-up! Run locally with the command `heroku local`
- Documentation of NL API
  - https://cloud.google.com/natural-language/docs/reference/libraries

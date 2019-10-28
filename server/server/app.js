// Source: CS290 coursework
var express = require('express');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout: 'main'});
var body = require('body-parser');
const session = require('express-session');

app.use(session({secret:'SuperSecretRandomPassword', resave: true, saveUninitialized: true}));
app.use(body.urlencoded({extended: false}));
app.use(body.json());
app.use(express.static('../../client/public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', '../../client/views');
app.set('port', 8080);

// Use homepage.js to route as home page
app.use('/', require('./homepage.js'));
// Use login.js to route as login page
app.use('/login', require('./login.js'));
// Use signup.js to route as signup page
app.use('/signup', require('./signup.js'));
// Use survey.js to route as survey page
app.use('/survey', require('./survey.js'));
// Use profile.js to route as profile page
app.use('/profile', require('./profile.js'));
// Use users.js to route as users page
app.use('/users', require('./users.js'));


//Logout Route
app.get('/logout',function(req,res,next){
  req.session.user = false;
  req.session.destroy();
  res.redirect('/');
});

// Handle errors
app.use(function(req, res) {
    res.status(404);
    res.render('404');
})

app.listen(app.get('port'), function() {
    console.log('Express started on http://localhost:' + app.get('port') + '/; press Ctrl-C to terminate.');
})

const path = require('path');
const mysql = require('mysql');
const express = require('express');
// require body-parser to parse json responses autmatically.
const bodyParser = require('body-parser');
const passport = require('passport');
// passport uses what they call strategies to check the credentials that are handed between the client and the db.
const LocalStrategy = require('passport-local').Strategy;
const clientPath = path.join(__dirname, '../../public/src');
const port = 3000;
const app = express();

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'SpecTer32594',
    database: 'passportauthtest'
});

connection.connect();

app.use(bodyParser.urlencoded({ extended: true }));
// passport.initalize needs to be there to start the process that passport provides... apparently.
app.use(passport.initialize());
// this stores the successcul login as a cookie in the request headers. This allows for you to 
app.use(passport.session());

app.use(express.static(clientPath));
app.get('/success', (req, res) => res.send('login successful.'));
app.get('/incorrect-credentials', (req, res) => res.send('incorrect credentials'));
app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/success',
        failureRedirect: '/incorrect-credentials'
    })
);

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
    function (email, password, done) {
        connection.query("SELECT * FROM `users` WHERE `email` = '" + email + "'", function (err, rows) {
            if (err)
                return done(err);
            if (!rows.length) {
                return done(null, false);
            }

            // if the user is found but the password is wrong
            if (!(rows[0].password == password))
                return done(null, false);

            // all is well, return successful user
            return done(null, rows[0]);
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.listen(port, () => console.log(`server working on port ${port}`));
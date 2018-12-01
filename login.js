'use strict';

const express = require('express'),
	app = express(),
	// request = require('request'),
	// auth = require('./config/auth.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	cookieParser = require('cookie-parser'),
	session = require('express-session');

//Database config and connection
const configDB = require('./config/database.js');
//NOTE: After brew install mongodb, couldn't run mongod b/c of permissions error
//So, local MongoDB directory in /data/db has permission set by sudo chown -R $USER /data/db
//This is apparently a security risk that we'll need to deal with before we move into production
//References: https://stackoverflow.com/questions/7948789/mongod-complains-that-there-is-no-data-db-folder
// https://stackoverflow.com/questions/42446931/mongodb-exception-in-initandlisten-20-attempted-to-create-a-lock-file-on-a-rea
mongoose.connect(
	configDB.url,
	{ useNewUrlParser: true }
);

//we've configured our local strategy in config/passport.js
require('./config/passport.js')(passport); //pass passport for configuration

app.set('view engine', 'pug');
app.set('views', 'views');

//middleware configuration
app.use(express.static('resources'));
app.use(cookieParser()); //read cookies
app.use(express.json()); // for parsing application/json
app.use(
	express.urlencoded({
		extended: true
	})
);
app.use(
	session({
		secret: 'dope!Productions',
		saveUninitialized: false,
		resave: false
	})
);
app.use(passport.initialize());
app.use(passport.session());

////
////ROUTING////
////

app.get('/', function(req, res) {
	res.render('homepage');
});

app.get('/services', function(req, res) {
	if (req.isAuthenticated()) {
		res.render('services', { user: req.user });
	} else {
		res.render('login');
	}
});
app.get('/login', function(req, res) {
	res.render('login');
});

app.post(
	'/login',
	passport.authenticate('local-login', {
		successRedirect: '/services',
		failureRedirect: '/login'
	})
);

app.get('/signup', function(req, res) {
	res.render('signup');
});

app.post(
	'/signup',
	passport.authenticate('local-signup', {
		successRedirect: '/services',
		failureRedirect: '/signup'
	})
);

//Need to figure out where the user_likes and other data are kept, since passport standardizes the data
// http://www.passportjs.org/docs/profile/
app.get(
	'/login/facebook',
	passport.authenticate('facebook', {
		scope: [
			'email',
			'user_friends',
			'user_location',
			'user_likes',
			'user_tagged_places',
			'user_birthday'
		]
	})
);

app.get(
	'/login/facebook/return',
	passport.authenticate('facebook', { failureRedirect: '/login' }),
	function(req, res) {
		res.redirect('/services');
	}
);

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

const server = app.listen(3000, function() {
	console.log(`Server started on port ${server.address().port}`);
});

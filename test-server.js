'use strict';
const passport = require('passport');
const express = require('express');
const auth = require('./config/auth.js');
const FBStrategy = require('passport-facebook').Strategy;

// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(
	new FBStrategy(
		{
			clientID: auth.facebook.id,
			clientSecret: auth.facebook.secret,
			callbackURL: 'http://localhost:3001/login/facebook/return'
		},
		function(accessToken, refreshToken, profile, cb) {
			// In this example, the user's Facebook profile is supplied as the user
			// record.  In a production-quality application, the Facebook profile should
			// be associated with a user record in the application's database, which
			// allows for account linking and authentication with other identity
			// providers.
			console.log(profile);
			return cb(null, profile);
		}
	)
);

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
	cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
	cb(null, obj);
});

// Create a new Express application.
const app = express();

// Configure view engine to render EJS templates.
app.set('views', 'views');
app.set('view engine', 'pug');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(
	require('express-session')({
		secret: 'keyboard cat',
		resave: true,
		saveUninitialized: true
	})
);

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get('/', function(req, res) {
	res.render('homepage', { user: req.user });
});

app.get('/login', function(req, res) {
	res.render('login');
});

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
		res.redirect('/');
	}
);

app.get('/profile', require('connect-ensure-login').ensureLoggedIn(), function(
	req,
	res
) {
	res.render('profile', { user: req.user });
});

app.listen(3001);

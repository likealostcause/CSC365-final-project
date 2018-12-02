'use strict';

const express = require('express'),
	app = express(),
	request = require('request'),
	auth = require('./config/auth.js'),
	passport = require('passport'),
	FBStrategy = require('passport-facebook'),
	cookieParser = require('cookie-parser'),
	session = require('express-session');

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
passport.use(
	new FBStrategy(
		{
			clientID: auth.facebook.id,
			clientSecret: auth.facebook.secret,
			callbackURL: 'http://localhost:3000/login/facebook/return'
		},
		function(accessToken, refreshToken, profile, done) {
			console.log(profile);
			return done(null, profile);
		}
	)
);

passport.serializeUser(function(user, cb) {
	cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
	cb(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res) {
	res.render('homepage');
});

app.get('/services', function(req, res) {
	//If logged in, proceed to services
	if (req.isAuthenticated()) {
		res.render('services');
	}
	//If not logged in, send to login page, which redirects to services when login complete
	else {
		res.redirect('/login');
	}
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
		res.redirect('/services');
	}
);
// app.post('/login'), function

app.get('/music', function(req, res) {
	//following code taken from Spotify's Git repo: https://github.com/spotify/web-api-auth-examples/blob/master/client_credentials/app.js
	console.log('Get request for /music received.');
	let authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		headers: {
			Authorization:
				'Basic ' +
				Buffer.from(auth.spotify.id + ':' + auth.spotify.secret).toString(
					'base64'
				)
		},
		form: {
			grant_type: 'client_credentials'
		},
		json: true
	};
	//Make the authentication request, and then make GET request for the track
	//Currently living in callback hell bc I don't know how promises work...
	//need to fix this with promises so that we only have to make token request once at server launch
	request.post(authOptions, function(posterror, postres, postbody) {
		let myToken = postbody.access_token;
		//Temporarily hard-coded for Household's "It's Easy to Feel Rotten"
		let trackID = '0z7xfWfdU1gvpY8yDiWHdt';
		let options = {
			url: 'https://api.spotify.com/v1/tracks/' + trackID,
			headers: {
				Authorization: 'Bearer ' + myToken
			},
			json: true
		};
		request.get(options, function(geterror, getres, getbody) {
			res.send(getbody);
			console.log(`sending response for ${getbody.external_urls.spotify}`);
		});
	});
});

const server = app.listen(3000, function() {
	console.log(`Server started on port ${server.address().port}`);
});

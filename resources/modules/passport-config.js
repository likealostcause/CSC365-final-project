'use strict';
const FBStrategy = require('passport-facebook'),
	auth = require('./auth.js'),
	TwitterStrategy = require('passport-twitter');
//middleware configuration
let passportSettings = function(passport) {
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

	passport.use(
		new TwitterStrategy(
			{
				consumerKey: auth.twitter.id,
				consumerSecret: auth.twitter.secret,
				callbackURL: 'http://localhost:3000/login/twitter/return'
			},
			function(token, tokenSecret, profile, done) {
				console.log('Twitter:', profile);
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
};

module.exports = passportSettings;

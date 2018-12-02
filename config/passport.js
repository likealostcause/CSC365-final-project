'use strict';

const LocalStrategy = require('passport-local').Strategy,
	FBStrategy = require('passport-facebook').Strategy,
	auth = require('./auth.js'),
	User = require('../resources/modules/mongoDB_userModel.js');

let localStrategies = function(passport) {
	passport.serializeUser(function(user, done) {
		done(null, user.id); // save to userID to session as req.session.passport.user = {id: '..'}
	});
	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user); //user object attaches to the request as req.user
		});
	});
	//we'll use a custom name (ie 'local-signup) since we're also gonna need a strategy for 'local-login'
	passport.use(
		'local-signup',
		new LocalStrategy(
			{
				usernameField: 'email',
				passwordField: 'password',
				passReqToCallback: true
			},
			//callback func for LocalStrategy
			function(req, email, password, done) {
				process.nextTick(function() {
					// I have no idea what nextTick does tbh but it's something re: asynchronosity
					User.findOne({ 'local.email': email }, function(err, user) {
						if (err) {
							return done(err);
						}
						//If user already in DB, return false
						else if (user) {
							return done(null, false);
						} else {
							let newUser = new User();
							newUser.local.email = email;
							//encrypt password before storing in DB
							newUser.local.password = newUser.generateHash(password);
							newUser.save(function(mongoErr) {
								if (mongoErr) {
									throw mongoErr;
								} else {
									return done(null, newUser);
								}
							});
						}
					});
				});
			}
		)
	);
	passport.use(
		'local-login',
		new LocalStrategy(
			{
				usernameField: 'email',
				passwordField: 'password',
				passReqToCallback: true
			},
			function(req, email, password, done) {
				User.findOne({ 'local.email': email }, function(err, user) {
					if (err) {
						return done(err);
					}
					//if the user is NOT found...
					else if (!user) {
						return done(null, false);
					}
					//if the user is found
					else if (!user.validatePassword(password)) {
						//need to add code to differentiate login failure btwn user and password
						return done(null, false);
					} else {
						return done(null, user);
					}
				});
			}
		)
	);
	passport.use(
		new FBStrategy(
			{
				clientID: auth.facebook.id,
				clientSecret: auth.facebook.secret,
				callbackURL: 'http://localhost:3000/login/facebook/return'
			},
			function(accessToken, refreshToken, profile, done) {
				process.nextTick(function() {
					User.findOne({ 'facebook.id': profile.id }, function(err, user) {
						if (err) {
							return done(err);
						} else if (user) {
							return done(null, user);
						}
						//Create a new user if none found
						else {
							let newUser = new User();
							newUser.facebook.id = profile.id;
							newUser.facebook.token = profile.token;
							newUser.facebook.name = profile.displayName;
							//newUser.facebook.email = profile.emails[0].value || null;
							//save the new user to the DB
							newUser.save(function(mongoErr) {
								if (mongoErr) {
									throw mongoErr;
								} else {
									return done(null, newUser);
								}
							});
						}
					});
				});
			}
		)
	);
};

module.exports = localStrategies;

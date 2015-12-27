'use strict';

var util = require('util')
var GitHubStrategy = require('passport-github').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/users');
var configAuth = require('./auth');

module.exports = function (passport) {
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});
	
	passport.use(new GoogleStrategy({
	    clientID: configAuth.googleAuth.clientID,
	    clientSecret: configAuth.googleAuth.clientSecret,
	    callbackURL: configAuth.googleAuth.callbackURL
	  },
	  /*function(accessToken, refreshToken, profile, done) {
	    User.findOrCreate({ googleId: profile.id }, function (err, user) {
	      return done(err, user);
	    });
	  }*/
	  function (token, refreshToken, profile, done) {
		process.nextTick(function () {
			User.findOne({ 'google.id': profile.id }, function (err, user) {
				if (err) {
					return done(err);
				}

				if (user) {
					user.google.displayName = profile.displayName;
					user.google.avatar = profile.photos[0].value;
					user.save(function (err) {
						if (err) {
							throw err;
						}
					return done(null, user);
					});
				} else {
					var newUser = new User();

					newUser.google.id = profile.id;
					newUser.google.username = profile.username;
					newUser.google.displayName = profile.displayName;
					newUser.google.avatar = profile.photos[0].value;
					newUser.nbrClicks.clicks = 0;

					newUser.save(function (err) {
						if (err) {
							throw err;
						}

						return done(null, newUser);
					});
				}
			});
		});
	}
	));

	passport.use(new GitHubStrategy({
		clientID: configAuth.githubAuth.clientID,
		clientSecret: configAuth.githubAuth.clientSecret,
		callbackURL: configAuth.githubAuth.callbackURL
	},
	function (token, refreshToken, profile, done) {
		process.nextTick(function () {
			User.findOne({ 'github.id': profile.id }, function (err, user) {
				if (err) {
					return done(err);
				}

				if (user) {
					return done(null, user);
				} else {
					var newUser = new User();

					newUser.github.id = profile.id;
					newUser.github.username = profile.username;
					newUser.github.displayName = profile.displayName;
					newUser.github.publicRepos = profile._json.public_repos;
					newUser.nbrClicks.clicks = 0;

					newUser.save(function (err) {
						if (err) {
							throw err;
						}

						return done(null, newUser);
					});
				}
			});
		});
	}
	));
	
	passport.use(new FacebookStrategy({
	    clientID: configAuth.facebookAuth.clientID,
	    clientSecret: configAuth.facebookAuth.clientSecret,
	    callbackURL: configAuth.facebookAuth.callbackURL,
	    enableProof: false
	  },
	  function (token, refreshToken, profile, done) {
		process.nextTick(function () {
			User.findOne({ 'facebook.id': profile.id }, function (err, user) {
				if (err) {
					return done(err);
				}

				if (user) {
					return done(null, user);
				} else {
					var newUser = new User();
					newUser.facebook.id = profile.id;
					newUser.facebook.username = profile.username;
					newUser.facebook.displayName = profile.displayName;
					newUser.facebook.email = profile.email;
					newUser.nbrClicks.clicks = 0;

					newUser.save(function (err) {
						if (err) {
							throw err;
						}

						return done(null, newUser);
					});
				}
			});
		});
	}
	));
	
	
};

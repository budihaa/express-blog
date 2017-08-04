const express = require('express');
const router  = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Import User model
const User 		= require('../models/user');

// Register route
router.get('/register', (req, res) => {
	res.render('register', {
		title: "Register New Account"
	});
});

router.post('/register', (req, res) => {
	const name = req.body.name;
	const username = req.body.username;
	const email = req.body.email;
	const password = req.body.password;
	const password2 = req.body.password2;

	req.checkBody('name', 'Your name is required').notEmpty();
	req.checkBody('username', 'Your username is required').notEmpty();
	req.checkBody('email', 'Your email is required').isEmail();
	req.checkBody('password', 'Your password is required').notEmpty();
	req.checkBody('password2', 'Password do not match').equals(password);

	// check error
	const errors = req.validationErrors();
	if(errors){
		res.render('register', {
			title : "Register New Account",
			errors: errors
		});
	}else{
		const newUser = new User({
			name : name,
			username: username,
			email : email,
			password : password
		});

		// hash password with bcryptjs
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(newUser.password, salt, (err, hash) => {
				if(err){
					console.log(err);
					return;
				}
				newUser.password = hash;
				// save to db
				newUser.save((err) => {
					if(err){
						console.log(err);
					}else{
						req.flash('success', 'Registration Success! Please login');
						res.redirect('/user/login');
					}
				})
			});
		})
	}
});

// Login
router.get('/login', (req, res) => {
	res.render('login', {
		title: "Login to X-Medium"
	});
});
router.post('/login', (req, res, next) => {
	username = req.body.username,
	passport.authenticate('local', {
		successRedirect: '/',
		successFlash: `Welcome back, ${username}!`,
		failureRedirect: '/user/login',
		failureFlash: true
	})(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success', "Goodbye! You are successfully logged out.");
	res.redirect('/user/login');
});

module.exports = router;

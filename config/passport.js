const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('../config/database');
const bcrypt = require('bcryptjs');

module.exports = (passport) => {
	// LocalStrategy
	passport.use(new LocalStrategy( (username, password, done) => {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }
			// Matching password
      bcrypt.compare(password, user.password, (err, isMatch) => {
				if (err) { return done(err); }
				if(isMatch){
					return done(null, user);
				}else{
					return done(null, false, { message: 'Incorrect username or password.' });
				}
			});
		});
  }));

	// passport config
	passport.serializeUser(function(user, done) {
	  done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
	  User.findById(id, function(err, user) {
	    done(err, user);
	  });
	});

}//end module.exports

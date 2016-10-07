'use strict';
var LocalStrategy = require('passport-local').Strategy;
const USER = {
	username : 'user',
	password : 'user',
	role: 'user',
	id : 1
};
const USER_A = {
	username : 'usera',
	password : 'usera',
	role : 'workera',
	id : 2
};
const USER_B = {
	username : 'userb',
	password : 'userb',
	role : 'workerb',
	id : 3
};
const ADMIN = {
	username : 'admin',
	password : 'admin',
	role : 'admin',
	id : 4
};

var users = [USER, USER_A, USER_B, ADMIN];

function findUser(username, role, callback) {
//	console.log('findUser', username, role);
	var user = null;
	users.some(function(cUser) {
		if (username === cUser.username && role === cUser.role) {
			user = cUser;
			return true;
		}
	});
	
	if (user) {
		return callback(null, user);
	}
	
	return callback(null);
}

module.exports = function AuthenStrategy(role) {
	return new LocalStrategy({
			usernameField : 'username',
			passwordField : 'password'
		}, 
		function(username, password, done) {
//			console.log('before authen', username, password);
			username = (username||'').toLowerCase();
			findUser(username, role, function (err, user) {
				if (err) {
					return done(err);
		        }
		        if (!user) {
		        	return done(null, false);
		        }
		        if (password !== user.password ) {
		        	return done(null, false);
		        }
		        return done(null, user, { message: 'Welcome' });
			});
		}
	);
};

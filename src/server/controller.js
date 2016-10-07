'use strict';
var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
//var logger = require('morgan');
var expHbs = require('express-handlebars');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
// Using passport to authenticate
var passport = require('passport');

var sipRoutes = require('./routes');
var AuthenStrategy = require('./common/authen_strategy');
var SecureChecker = require('./common/secure_checker');
var hbsHelpers = require('./common/hbs_helpers');

module.exports = function(app) {
    // catching for any unknown error
    process.on('uncaughtException', function(err) {
        console.error((new Date).toUTCString() + ' uncaughtException:', err.message);
        console.error(err.stack);
        process.exit(1);
    });
    
    var sessionOptions = {
		name : 'sip.sid',
		secret : 'TmdoaWVtIFZhbiBWaWV0IC0gMjAxNiBNYXkgMTA=',
		resave : false,
		saveUninitialized : false,
		cookie : {
			httpOnly : true,
			secure : false,
			maxAge : null, // milliseconds
			expires : false
		}
	};
    
    var isProd = app.isProd = (process.env.NODE_ENV == 'production');
    // view engine setup
    // Create `ExpressHandlebars` instance with a default layout.
    var hbs = expHbs.create({
    	extname: '.hbs',
    	layoutsDir: path.join(__dirname, 'views/layouts/'),
    	defaultLayout: 'layout_main',
        helpers      : hbsHelpers,
        // Uses multiple partials dirs, templates in "shared/templates/" are shared
        // with the client-side of the app.
        partialsDir: [
//            'shared/templates/',
            path.join(__dirname, 'views/partials/')
        ]
    });
    // Register `hbs` as our view engine using its bound `engine()` function.
    app.engine('hbs', hbs.engine);
    app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, 'views'));

    app.use(cookieParser());
    //authorization setup
//    passport.use(new AuthenStrategy());
    app.use(session(sessionOptions));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done) {
    	done(null, user);
    });

    passport.deserializeUser(function(user, done) {
    	done(null, user);
    });

    var enableRoleChecking = process.env.ENABLE_ROLE_CHECK || true;
    var SChecker = new SecureChecker(app);
   
    app.use(sipRoutes.routes.PUBLIC, express.static(path.join(__dirname, 'www')));
    // uncomment after placing your favicon in /public
    //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    //app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    
    app.sipRoutes = sipRoutes;
    // Authencation section
    app.use(sipRoutes.routes.AUTHENTICATION, require('./routes/authen')(app, passport, AuthenStrategy));

    // Check for every request whether it has authorization or not
    app.use(SChecker.checkRoles);
    // Authorized resources
    app.use(sipRoutes.routes.HOME, require('./routes/home')(app, SecureChecker));
    app.use(sipRoutes.routes.NEW_BOUSAI_SERVICES, require('./routes/newbousai')(app, SecureChecker));
    app.use(sipRoutes.routes.PATTERN_SERVICES, require('./routes/pattern')(app, SecureChecker));
    app.use(sipRoutes.routes.DISASTER_INFO_SERVICES, require('./routes/disaster_info')(app, SecureChecker));
    
    if (isProd) {
    	app.use(function (err, req, res) {
    		res.render('error', { error: err, code: res.statusCode });
    	});
    }
};

'use strict';
var MobileDetect = require('mobile-detect');
function Authen(app, passport, AuthenStrategy) {
    var router = app.loopback.Router();

  var failInvalidCredential = function(res) {
      res.send({ isSuccessful: false, error: 'Your User ID or Password was entered incorrectly'});
    };
    var failPermissionDeny = function(res) {
        res.statusCode = 403;
        res.send({ isSuccessful: false, error: 'Permition denied: You have no authorization to access this, please contact administrator of this site'});
    };
    var failServerIssue = function(res) {
        res.send({isSuccessful: false, error: 'Can not reach authentication server, please try again later'});
    };

    var performRequestAuthen = function(user, req, res) {
        // perform authen request
        req.logIn(user, function(err) {
//        	console.log('performRequestAuthen', user, err);
            if (err) {
                failInvalidCredential(res);
                return;
            }

            // Login SUCCESSFULLY, go to HOME page
            switch (user.role) {
			case 'user':
				res.send({isSuccessful: true, url:app.sipRoutes.routes.HOME});
				break;
			case 'workera':
				res.send({isSuccessful: true,url:app.sipRoutes.routes.WORKER_A_HOME});
				break;
			case 'workerb':
				res.send({isSuccessful: true,url:app.sipRoutes.routes.WORKER_B_HOME});
				break;
			case 'admin':
				res.send({isSuccessful: true,url:app.sipRoutes.routes.ADMIN_HOME});
				break;
			default:
				res.send({isSuccessful: true,url:app.sipRoutes.routes.HOME});
				break;
			}
        });
    };

    /**
     * Authentication service.
     */
    router.post('/service', function(req, res, next) {
//    	console.log('call authen service', req.session.loginUrl, req.body, req.query);
//    	user.loginUrl = req.session.loginUrl;
    	if (req.session.loginUrl.indexOf(app.sipRoutes.routes.ADMIN_HOME) >= 0)
    		passport.use(new AuthenStrategy('admin'));
    	else if (req.session.loginUrl.indexOf(app.sipRoutes.routes.WORKER_A_HOME) >= 0)
    		passport.use(new AuthenStrategy('workera'));
    	else if (req.session.loginUrl.indexOf(app.sipRoutes.routes.WORKER_B_HOME) >= 0)
    		passport.use(new AuthenStrategy('workerb'));
    	else {
    		// For Guest login
        	if ((req.body.username === undefined && req.body.password === undefined) 
        			|| (req.body.username === '' && req.body.password === '')) {
        		var user = {username : '', password : '', role: 'user', id : 0};
        		performRequestAuthen(user, req, res);
        		return;
        	}
    		passport.use(new AuthenStrategy('user'));
    	}
    	// perform authenticate
        passport.authenticate('local', function(err, user, info) {
//        	console.log('pp authen', err, user, info);
        	if (err) {
                failInvalidCredential(res);
                return;
            }

            if (user) {
                performRequestAuthen(user, req, res);
            } else {
                failInvalidCredential(res);
            }
        })(req, res, next);
    });

    router.get('/logout', function(req, res) {
    	// deep copy
    	var curUser = Object.assign({}, req.user);
//    	console.log('logout', req.user, req.session.loginUrl, curUser);
        req.logout();
        req.session.destroy(function() {
//            console.log('Session deleted');
        });

        switch (curUser.role) {
		case 'user':
			res.redirect(app.sipRoutes.routes.HOME);
			break;
		case 'workera':
			res.redirect(app.sipRoutes.routes.WORKER_A_HOME);
			break;
		case 'workerb':
			res.redirect(app.sipRoutes.routes.WORKER_B_HOME);
			break;
		case 'admin':
			res.redirect(app.sipRoutes.routes.ADMIN_HOME);
			break;

		default:
			res.redirect(app.sipRoutes.routes.HOME);
			break;
		}
    });

    return router;
}

module.exports = Authen;

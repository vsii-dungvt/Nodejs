'use strict';

var utils = require('./utilities');
module.exports = function SecureCheker(app, roles, notAuthenticatedCb, notAuthorizedCb) {
	var sipDb = require('./sip_db')(app);

	var _notAuthenticated = function (req, res) {
    var isPhone = utils.checkMobile(req);
		var reqPath = req.url;
		req.session.loginUrl = req.url;

		var reWorkerA = new RegExp(app.sipRoutes.routes.WORKER_A_HOME);
		var reWorkerB = new RegExp(app.sipRoutes.routes.WORKER_B_HOME);
		var reAdmin = new RegExp(app.sipRoutes.routes.ADMIN_HOME);

		if (reAdmin.test(reqPath)) { // redirect to Admin login page
			if (isPhone) {
				res.render('login_mobile', {
					isPhone : true,
					isAdmin : true,
					loginUser : 'システム管理者',
					error : '',
					layout : 'layout_login',
					titleButtonLogin : 'login'
				});
			} else {
				res.render('login_pc', {
					isPhone : false,
					isAdmin : true,
					loginUser : 'システム管理者',
					error : '',
					layout : 'layout_login',
					titleButtonLogin : 'login'
				});
			}
			return;
		}

		sipDb.getMainStatus(req, res, function(status, maxSindo, shinjuku) {
			if (maxSindo.noData) {
				var mainStatus = utils.getMainStatus(status);
				mainStatus.noData = true;
				if (reWorkerA.test(reqPath)) {
					if (isPhone == true) {
						res.render('login_mobile', {
							isPhone : true,
							loginUser : '防災従事者A',
							mainStatus : mainStatus,
							error : '',
							layout : 'layout_login',
							titleButtonLogin : 'login'
						});
					} else {
						res.render('login_pc', {
							isPhone : false,
							loginUser : '防災従事者A',
							mainStatus : mainStatus,
							error : '',
							layout : 'layout_login',
							titleButtonLogin : 'login'
						});
					}
					return;
				}
				if (reWorkerB.test(reqPath)) { // redirect to Worker B login page
					if (isPhone) {
						res.render('login_mobile', {
							isPhone : true,
							isWorkerB : true,
							loginUser : '災害従事者B',
							mainStatus : mainStatus,
							error : '',
							layout : 'layout_login',
							titleButtonLogin : 'login'
						});
					} else {
						res.render('login_pc', {
							isPhone : false,
							isWorkerB : true,
							loginUser : '災害従事者B',
							mainStatus : mainStatus,
							error : '',
							layout : 'layout_login',
							titleButtonLogin : 'login'
						});
					}
					return;
				}
				// redirect to normal login page
				if (isPhone) {
					res.render('login_mobile', {
						isPhone : true,
						isGeneralUser : true,
						loginUser : '一般ユーザ',
						mainStatus : mainStatus,
						error : '',
						layout : 'layout_login',
						titleButtonLogin : 'login & START'
					});
				} else {
					res.render('login_pc', {
						isPhone : false,
						isGeneralUser : true,
						loginUser : '一般ユーザ',
						mainStatus : mainStatus,
						error : '',
						layout : 'layout_login',
						titleButtonLogin : 'login & START'
					});
				}
				return;
			}

			var mainStatus = utils.getMainStatus(status);
			mainStatus.maxSindo = {};
			mainStatus.maxSindo.value = maxSindo.sindo;
			mainStatus.maxSindo.hours = maxSindo.sendtime.getHours();
			mainStatus.maxSindo.minutes = maxSindo.sendtime.getMinutes();
			mainStatus.maxSindo.minutes = maxSindo.sendtime.getMinutes();
			mainStatus.maxSindo.place = maxSindo.siteName;
			mainStatus.demoColor = !maxSindo.demo ? 'purple' : 'red';

			mainStatus.shinjukuSindo = shinjuku.sindo;

			if (reWorkerA.test(reqPath)) {
				if (isPhone) {
					res.render('login_mobile', {
						isPhone : true,
						loginUser : '防災従事者A',
						mainStatus : mainStatus,
						error : '',
						layout : 'layout_login',
						titleButtonLogin : 'login'
					});
				} else {
					res.render('login_pc', {
						isPhone : false,
						loginUser : '防災従事者A',
						mainStatus : mainStatus,
						error : '',
						layout : 'layout_login',
						titleButtonLogin : 'login'
					});
				}
				return;
			}
			if (reWorkerB.test(reqPath)) { // redirect to Worker B login page
				sipDb.getMax23Sindo(req, res).then(function(max23Sindo) {
					mainStatus.max23Sindo = max23Sindo.sindo;
					if (isPhone) {
						res.render('login_mobile', {
							isPhone : true,
							isWorkerB : true,
							loginUser : '災害従事者B',
							mainStatus : mainStatus,
							error : '',
							layout : 'layout_login',
							titleButtonLogin : 'login'
						});
					} else {
						res.render('login_pc', {
							isPhone : false,
							isWorkerB : true,
							loginUser : '災害従事者B',
							mainStatus : mainStatus,
							error : '',
							layout : 'layout_login',
							titleButtonLogin : 'login'
						});
					}
				});

				return;
			}
			// redirect to normal login page
			if (isPhone) {
				res.render('login_mobile', {
					isPhone : true,
					isGeneralUser : true,
					loginUser : '一般ユーザ',
					mainStatus : mainStatus,
					error : '',
					layout : 'layout_login',
					titleButtonLogin : 'login & START'
				});
			} else {
				res.render('login_pc', {
					isPhone : false,
					isGeneralUser : true,
					loginUser : '一般ユーザ',
					mainStatus : mainStatus,
					error : '',
					layout : 'layout_login',
					titleButtonLogin : 'login & START'
				});
			}
		});
	};

	var _notAuthorized = function (req, res) {
		res.status(403).send({'error': 'Unauthorized'});
	};

	if (notAuthenticatedCb)
		_notAuthenticated = notAuthenticatedCb;
	if (notAuthorizedCb)
		_notAuthorized = notAuthorizedCb;

    return {
    	// As with any middleware it is quintessential to call next()
    	// if the user is authenticated
    	checkRoles: function (req, res, next) {
            var isAuthenticated = req.isAuthenticated();
            // console.log('isAuthenticated?', isAuthenticated, 'request', req.method, req.url);
            // console.log('req.user', req.user);
            if (isAuthenticated) {
            	if (!roles || roles.indexOf(req.user['role']) > -1){
            		return next();
            	} else {
            		_notAuthorized(req, res);
            	}
            } else {
                var reqPath = req.url;
                // whether api request
                if (/(\/api\/|\/service\/|\/service$)/.test(reqPath)) {
                   res.status(401).send({'error': 'Unauthorized'});
                } else {
                   // other cases
                	_notAuthenticated(req, res);
                }
            }
            return true;
        }
    };
};

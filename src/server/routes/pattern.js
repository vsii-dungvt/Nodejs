'use strict';

module.exports = function(app, SecureChecker) {
	var sipDb = require('../common/sip_db')(app);
	
	var router = app.loopback.Router();
	
	router.get('/', function (req, res, next) {
//		console.log('get actions', req.query);
		if (req.query.curPhase != undefined && req.query.curPhase != null && parseInt(req.query.curPhase) === 0) {
//			console.log('non DISASTER');
			res.send([{}]);
			return;
		}
		if (!req.query.curPhase || !parseInt(req.query.curPhase)) {
			res.status(406).send({isSuccessful: false});
			return;
		}
		
		var uInfo = 1;
		switch (req.user.role) {
		case 'user':
			uInfo = 1;
			break;
		case 'workera':
			uInfo = [2, 3, 4];
			break;
		case 'workerb':
			uInfo = 5;
			break;

		default:
			break;
		}
		
		sipDb.getActionsGuideByUser(uInfo, parseInt(req.query.curPhase)).then(function(actions) {
//			console.log('get actions OK', actions);
			res.send(actions);
		}).then(function(err) {
			console.log('get actions FAILED', err);
			if (err)
				res.status(500).send({isSuccessful: false});
		});
	});
	
	return router;
};

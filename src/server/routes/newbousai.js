'use strict';

const SHINJUKU_SITECODE = 'TKY007';
var utils = require('../common/utilities');
var TRAIN_PATH = '/sip/public/images/train/';
var RESOURCES_PATH = '/sip/public/images/resources/';
module.exports = function(app, SecureChecker) {
	var sipDb = require('../common/sip_db')(app);
	
	var router = app.loopback.Router();
	
	router.post('/', function (req, res, next) {
//		console.log('add demo', req.body);
		if (!req.body.phaseId || !parseInt(req.body.phaseId)
				|| !req.body.sendTime 
				|| !req.body.siteCode || !(req.body.siteCode.length > 0)
				|| !req.body.maxSindo || !parseInt(req.body.maxSindo)
				|| !req.body.shinjukuSindo || !parseInt(req.body.shinjukuSindo) 
				|| parseInt(req.body.maxSindo) < parseInt(req.body.shinjukuSindo)
				|| !req.body.lpgm || !parseInt(req.body.lpgm)) {
			
			res.status(406).send({isSuccessful: false});
			return;
		}
		
		var bousaiId = parseInt(req.body.phaseId);
		var sendTime = new Date(req.body.sendTime);
		var siteCode = req.body.siteCode;
		var maxSindo = parseInt(req.body.maxSindo);
		var shinjukuSindo = parseInt(req.body.shinjukuSindo);
		var lpgm = parseInt(req.body.lpgm);
		
		var newBousai = {sendtime: sendTime, sitecode: siteCode, sindo: maxSindo
				, lomgperiodgroundmotionintensityscale: lpgm, demo: 0};
		var newShinjuku = {sendtime: sendTime, sitecode: SHINJUKU_SITECODE, sindo: shinjukuSindo
				, demo: 0};
		var newBousais = [newBousai, newShinjuku];
		// save demo to db
		sipDb.addDemo(req, res, newBousais, bousaiId).then(function(demo) {
//			console.log('add demo OK', demo);
			res.send({isSuccessful: true});
		}).catch(function(err) {
			console.log('add demo FAILED', err);
			res.status(500).send({isSuccessful: false});
		});
//		var demoData = JSON.parse(req.body.demoData);
//		console.log('add demo', demoData);
	});
	
	router.put('/', function (req, res, next) {
//		console.log('update Phase', req.body);
		if (!req.body.id || !parseInt(req.body.id)
				|| (parseInt(req.body.value) != 0 && parseInt(req.body.value) != 1)) {
			res.status(406).send({isSuccessful: false});
			return;
		}
		
		var bousaiId = parseInt(req.body.id);
		var bousaiValue = parseInt(req.body.value);
		// save demo to db
		sipDb.updatePhase(req, res, bousaiId, bousaiValue).then(function(info) {
//			console.log('update Phase OK', info);
			res.send({isSuccessful: true});
		}).then(function(err) {
			console.log('update Phase FAILED', err);
			if (err)
				res.status(500).send({isSuccessful: false});
		});
	});
	
	return router;
};

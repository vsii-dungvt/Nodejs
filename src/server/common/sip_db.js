'use strict';

var Promise = require('bluebird');
var using = Promise.using;
var mysqlConfig = require('../datasources.json');
const SHINJUKU_SITECODE = 'TKY007';
const ACTIONS_PATH = '/sip/public/files/actions/';
var mSql = require('./mysql_promise');

module.exports = function SipDB(app) {
	return {
		getMainStatus: function (req, res, callbackFn) {
//			this.getHistory();
			// Check if no disaster -> NOT query max sindo, shinjuku, max23sindo
			Promise.join(this.getDisasterStatus(req, res), this.getMaxSindo(req, res), this.getSHINJUKU(req, res), function(status, maxSindo, shinjuku){
				callbackFn(status, maxSindo, shinjuku);
			}).catch(function(err) {
				console.log('getMainStatus err', err);
				res.render('error', { error: 'Database error'});
			});
		},
		
		getDetailStatus: function (req, callbackFn) {
			Promise.join(this.getTrainStatus(), this.getBuildingStatus(req)
					, this.getMedicalStatus(), this.getDOfficeInfo()
					, function(trains, buildings, medicals, dOfficeInfo){
				callbackFn(trains, buildings, medicals, dOfficeInfo);
			});
		},
		
		getDisasterStatus: function (req, res) {
			return new Promise(function(resolve, reject) {
				app.models.Bousai.find({}, function(err, bousais) {
					if (err || !bousais || bousais.length == 0) {
						console.log('getDisasterStatus failed', err);
//						res.render('error', { error: 'Database error'});
						reject({error: 'Database error: getDisasterStatus'});
						return;
					}
					resolve(bousais);
				});
			});
		},
		/**
		 * Get max sindo of 23 districts in Tokyo at TODAY.
		 */
		getMaxSindo: function (req, res) {
			return new Promise(function(resolve, reject) {
				var beginToday = new Date();
				beginToday.setHours(0,0,0,0);
				var endToday = new Date();
				endToday.setHours(23,59,59,999);
				
				app.models.NewBousai00.findOne({where: {sendtime: {gte: beginToday, lte: endToday}}, order: ['sindo DESC', 'sendtime DESC']}, function(err, maxNewBousai) {
					if (err) {
						console.log('getMaxSindo failed', err);
//						res.render('error', { error: 'Database error'});
						reject({error: 'Database error: getMaxSindo'});
						return;
					}
					
					if (!maxNewBousai) { // no data TODAY
//						console.log('nodata');
						resolve({noData: true});
						return;
					}

					app.models.SitecodeName.findOne({where: {sitecode: maxNewBousai.sitecode}}, function(err, sitecodeName) {
						if (err || !sitecodeName) {
//							console.log('get DB failed', err);
//							res.render('error', { error: 'Database error'});
							reject(err);
						}
						
						maxNewBousai.siteName = sitecodeName.name;
						maxNewBousai.city = sitecodeName.city;
//						console.log('maxNewBousai', maxNewBousai, maxNewBousai.siteName);
						resolve(maxNewBousai);
					});
				});
			});
		},
		/**
		 * Get max sindo of 23 districts in Tokyo at TODAY.
		 */
		getMax23Sindo: function (req, res) {
			return new Promise(function(resolve, reject) {
				var beginToday = new Date();
				beginToday.setHours(0,0,0,0);
				var endToday = new Date();
				endToday.setHours(23,59,59,999);
				
				app.models.NewBousai00.findOne({where: {sendtime: {gte: beginToday, lte: endToday}, sitecode: /^TKY/}, order: ['sindo DESC', 'sendtime DESC']}, function(err, newBousai00) {
					if (err) {
//						console.log('get newBousai failed', err);
//						res.render('error', { error: 'Database error'});
						reject({error: 'Database error'});
						return;
					}
					if (!newBousai00) { // no data TODAY
//						console.log('nodata');
						resolve({noData: true});
						return;
					}
//					console.log('get newBousai', newBousai00s);
					resolve(newBousai00);
				});
			});
		},
		/**
		 * Get Shinjuku's info at TODAY.
		 */
		getSHINJUKU: function (req, res) {
			return new Promise(function(resolve, reject) {
				var beginToday = new Date();
				beginToday.setHours(0,0,0,0);
				var endToday = new Date();
				endToday.setHours(23,59,59,999);
				
				app.models.NewBousai00.findOne({where: {sitecode: SHINJUKU_SITECODE, sendtime: {gte: beginToday, lte: endToday}}, order: 'sendtime DESC'}, function(err, shinjuku) {
//					console.log('getSHINJUKU', shinjuku);
					if (err) {
//						console.log('get DB failed', err);
//						res.render('error', { error: 'Database error'});
						reject({error: 'Database error: getSHINJUKU'});
						return;
					}
					if (!shinjuku) { // no data TODAY
//						console.log('nodata');
						resolve({noData: true});
						return;
					}
//					console.log('get newBousai', newBousai00s);
					resolve(shinjuku);
				});
			});
		},
		
		getObservationPlaceName: function (siteCode, req, res) {
			return new Promise(function(resolve, reject) {
				app.models.SitecodeName.findOne({where: {sitecode: siteCode}}, function(err, sitecodeName) {
					if (err || !sitecodeName) {
//						console.log('get DB failed', err);
//						res.render('error', { error: 'Database error'});
						reject({error: 'Database error'});
						return;
					}
					
//					console.log('get all Bousai', bousais);
					resolve(sitecodeName);
				});
			});
		},
		
		getTokyoSitecodes: function (req, res) {
			return new Promise(function(resolve, reject) {
				app.models.SitecodeName.find({where: {sitecode: /^TKY/}}, function(err, sitecodeNames) {
					if (err || !sitecodeNames || sitecodeNames.length < 1) {
//						console.log('get DB failed', err);
//						res.render('error', { error: 'Database error'});
//						reject({error: 'Database error'});
						reject({isSuccessful: false, tokyoSitecodeNames: []});
						return;
					}

//					console.log('sitecodeNames', sitecodeNames);
					resolve({isSuccessful: true, tokyoSitecodeNames: sitecodeNames});
				});
			});
		},
		
		getTrainStatus: function () {
			return new Promise(function(resolve, reject) {
				app.models.StatusTrain.find({}, function(err, trainsStatus) {
//					console.log('getTrainStatus', err, trainsStatus);
					if (err || !trainsStatus) {
//						reject(err);
						resolve({isSuccessful: false});
					}

					resolve({isSuccessful: true, trainsStatus: trainsStatus});
				});
			});
		},
		
		getBuildingStatus: function (req) {
			return new Promise(function(resolve, reject) {
				var roleFilter = {fields: {}};
				if (req && req.user.role === 'user') { // not query some fields for NORMAL user
					roleFilter.fields = {numberOfPeople: false, fire: false, townGas: false, enrollment: false};
				}
				
				app.models.StatusBuilding.find(roleFilter, function(err, buildingStatus) {
					if (err) {
//						console.log('get DB failed', err);
//						reject(err);
						resolve({isSuccessful: false});
					}
					
//					console.log('getBuildingStatus', buildingStatus);
					resolve({isSuccessful: true, buildingStatus: buildingStatus});
				});
			});
		},
		
		getMedicalStatus: function () {
			return new Promise(function(resolve, reject) {
				app.models.StatusMedical.find({fields: {medicalOpen: false}}, function(err, medicalStatus) {
					if (err || !medicalStatus) {
//						console.log('get DB failed', err);
//						reject(err);
						resolve({isSuccessful: false});
					}
					
//					console.log('getMedicalStatus', medicalStatus);
					resolve({isSuccessful: true, medicalStatus: medicalStatus});
				});
			});
		},
		
		getDOfficeInfo: function () {
			return new Promise(function(resolve, reject) {
				app.models.StatusDoffice.find({fields: {dofficeStatus: false}}, function(err, dOffices) {
					if (err || !dOffices) {
//						console.log('get DB failed', err);
//						reject(err);
						resolve({isSuccessful: false});
					}
					
//					console.log('getMedicalStatus', medicalStatus);
					resolve({isSuccessful: true, dOffices: dOffices});
				});
			});
		},
		/**
		 * Update disaster phases.
		 */
		updatePhase: function (req, res, newPhaseId, newPhaseValue) {
//			console.log('sip db updatePhase', newPhaseId, typeof newPhaseId);
			return new Promise(function(resolve, reject) {
				app.models.Bousai.find({where: {or: [{'value': 1}, {'id': newPhaseId}]}}, function(err, bousais) {
					if (err || !bousais || bousais.length == 0) {
//						console.log('get DB failed', err);
//						res.send({isSuccessful: false});
						reject(err);
					}
//					console.log('update phases', bousais);
					var count = 0;
					// Check success for all update, if has one error HAVE to rollback
					bousais.forEach(function(bousai) {
						if (bousai.value === 1) {
							bousai.updateAttributes({value: 0}, function(err, bs) {
								if (err) {
									reject(err);
								}
								count++;
//								console.log('update phase OFF', bs);
								if (count === bousais.length) {
									resolve(bousais);
								}
							});
						}
						if (bousai.id == newPhaseId) {
							bousai.updateAttributes({value: newPhaseValue}, function(err, bs) {
								if (err) {
									reject(err);
								}
								count++;
//								console.log('update phase ON', bs);
								if (count === bousais.length) {
									resolve(bousais);
								}
							});
						}
					});
				});
			});
		},
		
		/**
		 * Update Doffice info.
		 */
		updateDOffice: function (dOfficeId, openTime, phone1, phone2) {
//			console.log('sip db updateDOffice', dOfficeId);
			return new Promise(function(resolve, reject) {
				app.models.StatusDoffice.findById(dOfficeId, function(err, statusDOff) {
					if (err || !statusDOff) {
//						console.log('get DB failed', err);
//						res.send({isSuccessful: false});
						reject(err);
						return;
					}

					var newAttr = {dofficeOpentime: openTime, dofficePhone1: phone1, dofficePhone2: phone2};
					statusDOff.updateAttributes(newAttr, function(err, dOf) {
						if (err) {
							reject(err);
							return;
						}
						
						resolve(dOf);
					});
				});
			});
		},
		
		addDemo: function (req, res, newBousai00s, bousaiId) {
			return new Promise(function(resolve, reject) {
				// create max newbousai00 and shinjuku bousai
				app.models.NewBousai00.create(newBousai00s, function(err, newBousais) {
					if (err || !newBousais || newBousais.length == 0) {
//						console.log('get DB failed', err);
//						res.render('error', { error: 'Database error'});
//						res.send({isSuccessful: false});
						reject(err);
					}

					app.models.Bousai.find({where: {or: [{'value': 1}, {'id': bousaiId}]}}, function(err, bousais) {
						if (err || !bousais) {
//							console.log('get DB failed', err);
//							res.send({isSuccessful: false});
							reject(err);
						}
//						console.log('main status', bousais);
						if (bousais.length == 0) {
							resolve(newBousais);
						}
//						console.log('update phases');
						var count = 0;
						// Check success for all update, if has one error HAVE to rollback
						bousais.forEach(function(bousai) {
							if (bousai.value === 1) {
								bousai.updateAttributes({value: 0}, function(err, bs) {
									if (err) {
										reject(err);
									}
									count++;
//									console.log('update phase OFF', bs);
									if (count === bousais.length) {
										resolve(newBousais);
									}
								});
							}
							if (bousai.id == bousaiId) {
								bousai.updateAttributes({value: 1}, function(err, bs) {
									if (err) {
										reject(err);
									}
									count++;
//									console.log('update phase ON', bs);
									if (count === bousais.length) {
										resolve(newBousais);
									}
								});
							}
						});
					});
				});
			});
		},
		
		getActionsGuideByUser: function (userInfo, disasterPhase) {
			var filter = {where: {userInfo: userInfo, phase: disasterPhase}};
			if (Array.isArray(userInfo))
				filter = {where: {userInfo: {inq: userInfo}, phase: disasterPhase}};
			
			return new Promise(function(resolve, reject) {
				app.models.Pattern.find(filter, function(err, patterns) {
					if (err) {
//						console.log('get DB failed', err);
//						res.render('error', { error: 'Database error'});
						reject(err);
					}
					
//					console.log('getActionsGuideByUser', patterns);
					patterns.forEach(function(action) {
						if (action.linkUrl && !action.linkUrl.indexOf('http') == 0) {
							action.linkUrl = ACTIONS_PATH + action.linkUrl;
						}
					});
					
					resolve(patterns);
				});
			});
		},
		
		getHistoryDates: function (req, res, callbackFn) {
			var getAllHistoryTableNameSql = "SELECT table_name FROM information_schema.tables WHERE (table_schema = '" 
				+ mysqlConfig.SIP.database + "' AND  table_name like 'bousai_%') ORDER BY table_name DESC";
			mSql.singleQuery(getAllHistoryTableNameSql)
			.then(function(tableNames) {
				if (tableNames.length < 1) {
			        throw new Error('No Result');
			    }
				
				var historyTables = [];
				tableNames.forEach(function(tableNameObj) {
					historyTables.push(tableNameObj['table_name']);
				});
//				console.log('get tableNames', historyTables);
				var result = [];
				historyTables.forEach(function(tblName) {
					var tblNameSplit = tblName.split('_');
					result.push({tableName: tblName, yyyy: tblNameSplit[1], mm: tblNameSplit[2]});
				});
				
				
			})
			.catch(function(err) {
				console.log('get tableNames err', err);
			})
		}
    };
};
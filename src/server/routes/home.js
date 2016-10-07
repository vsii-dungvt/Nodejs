'use strict';

var utils = require('../common/utilities');
var TRAIN_PATH = '/sip/public/images/train/';
var RESOURCES_PATH = '/sip/public/images/resources/';
module.exports = function(app, SecureChecker) {
    var router = app.loopback.Router();

    var sipDb = require('../common/sip_db')(app);
    var sChecker = new SecureChecker(app, ['user']);
    var sCheckerA = new SecureChecker(app, ['workera']);
    var sCheckerB = new SecureChecker(app, ['workerb']);
    var sCheckerAdmin = new SecureChecker(app, ['admin']);

    function _getDisasterData() {
        // TODO Get user role and data of catastrophe
        // Mockup data
        var status = 'darkred';
        var maps = [{
            map_name: 'global',
            map_link: '/sip/public/images/map/global_map.jpg',
        }, {
            map_name: 'shelter',
            map_link: '/sip/public/images/map/shelter_map.jpg',
        }, {
            map_name: 'eki',
            map_link: '/sip/public/images/map/eki_map.jpg',
        }, {
            map_name: 'facility',
            map_link: '/sip/public/images/map/facility_map.jpg',
        }];

        return {
            isAuthenticated: true,
            status: status,
            actionsGuide: { phaseColor: 'grey', actions: [{}] },
            info: { maps: maps },
            statistic: []
        };
    }

	/* GET home page. */
	router.get('/', sChecker.checkRoles, function(req, res, next) {
//		console.log('get HOME', req.user, req.params.role);
		var data = _getDisasterData();
		data.isPhone = utils.checkMobile(req);
		data.loginUser = '一般ユーザ';
		sipDb.getMainStatus(req, res, function(status, maxSindo, shinjuku) {
//			console.log('getMainStatus', status, maxSindo, shinjuku);
			var mainStatus = utils.getMainStatus(status);
			if (maxSindo.noData) {
//				console.log('home no data');
				mainStatus.noData = true;
			} else {
				mainStatus.maxSindo = {};
				mainStatus.maxSindo.value = maxSindo.sindo;
				mainStatus.maxSindo.hours = maxSindo.sendtime.getHours();
				mainStatus.maxSindo.minutes = maxSindo.sendtime.getMinutes();
				mainStatus.maxSindo.minutes = maxSindo.sendtime.getMinutes();
				mainStatus.maxSindo.place = maxSindo.siteName;
				mainStatus.shinjukuSindo = shinjuku.sindo;
				mainStatus.demoColor = !maxSindo.demo? 'purple': 'red';
			}
			data.mainStatus = mainStatus;
			sipDb.getDetailStatus(req, function(trains, buildings, medicals) {
//				console.log('getDetailStatus', trains, buildings, medicals);
				var trainStatus = trains.isSuccessful? utils.formatTrainStatus(trains.trainsStatus): {isSuccessful: false};
				var buildingStatus = utils.formatBuildingStatus(buildings.buildingStatus);
				var medicalStatus = utils.formatMedicalStatus(medicals.medicalStatus);
				data.info.railways = trainStatus;
				data.info.buildings = buildingStatus;
				data.info.medicals = medicalStatus;

                data.actionsGuide.phaseColor = mainStatus.phaseColor;
                // get Actions guide if have disaster
                if (mainStatus.curPhase) {
                    var uInfo = 1;
                    sipDb.getActionsGuideByUser(uInfo, mainStatus.curPhase).then(function(actions) {
                        //						console.log('actions', actions);
                        data.actionsGuide.actions = actions;
                        if (!data.isPhone)
                            res.render('home', data);
                        else
                            res.render('home_mobile', data);
                    });
                } else {
                    if (!data.isPhone)
                        res.render('home', data);
                    else
                        res.render('home_mobile', data);
                }
            });
        });
    });
    /* GET WORKER A home page. */
    router.get('/bousaia', sCheckerA.checkRoles, function(req, res, next) {
        var data = _getDisasterData();
        data.roleA = true;
        data.isPhone = utils.checkMobile(req);
        data.loginUser = '防災従事者A';
        sipDb.getMainStatus(req, res, function(status, maxSindo, shinjuku) {
            var mainStatus = utils.getMainStatus(status);
            if (maxSindo.noData) {
                mainStatus.noData = true;
            } else {
                mainStatus.maxSindo = {};
                mainStatus.maxSindo.value = maxSindo.sindo;
                mainStatus.maxSindo.hours = maxSindo.sendtime.getHours();
                mainStatus.maxSindo.minutes = maxSindo.sendtime.getMinutes();
                mainStatus.maxSindo.minutes = maxSindo.sendtime.getMinutes();
                mainStatus.maxSindo.place = maxSindo.siteName;
                mainStatus.shinjukuSindo = shinjuku.sindo;
                mainStatus.demoColor = !maxSindo.demo ? 'purple' : 'red';
            }
            data.mainStatus = mainStatus;

			sipDb.getDetailStatus(req, function(trains, buildings, medicals, dOfficeInfo) {
//				console.log('getDetailStatus', dOfficeInfo);
				var trainStatus = trains.isSuccessful? utils.formatTrainStatus(trains.trainsStatus): {isSuccessful: false};
				var buildingStatus = utils.formatBuildingStatus(buildings.buildingStatus);
				var medicalStatus = utils.formatMedicalStatus(medicals.medicalStatus);
				data.info.railways = trainStatus;
				data.info.buildings = buildingStatus;
				data.info.medicals = medicalStatus;
				data.info.dOfficeInfo = dOfficeInfo;
				data.statistic = utils.mergeArrayJson(trainStatus.total.summary, buildingStatus.total.summaryBuilding, medicalStatus.total);

                data.actionsGuide.phaseColor = mainStatus.phaseColor;
                // get Actions guide if have disaster
                if (mainStatus.curPhase) {
                    var uInfo = [2, 3, 4];
                    sipDb.getActionsGuideByUser(uInfo, mainStatus.curPhase).then(function(actions) {
                        //						console.log('actions A', actions);
                        data.actionsGuide.actions = actions;
                        if (!data.isPhone)
                            res.render('home', data);
                        else
                            res.render('home_mobile', data);
                    });
                } else {
                    if (!data.isPhone)
                        res.render('home', data);
                    else
                        res.render('home_mobile', data);
                }
            });

        });
    });
    /* GET WORKER B home page. */
    router.get('/bousaib', sCheckerB.checkRoles, function(req, res, next) {
        var data = _getDisasterData();
        data.roleB = true;
        data.isPhone = utils.checkMobile(req);
        data.isWorkerB = true;
        data.loginUser = '防災従事者B';
        sipDb.getMainStatus(req, res, function(status, maxSindo, shinjuku) {
            //			console.log('getMainStatus', status, maxSindo, shinjuku);
            var mainStatus = utils.getMainStatus(status);
            if (maxSindo.noData) {
                mainStatus.noData = true;
                data.mainStatus = mainStatus;

				sipDb.getDetailStatus(req, function(trains, buildings, medicals, dOfficeInfo) {
					var trainStatus = trains.isSuccessful? utils.formatTrainStatus(trains.trainsStatus): {isSuccessful: false};
					var buildingStatus = utils.formatBuildingStatus(buildings.buildingStatus);
					var medicalStatus = utils.formatMedicalStatus(medicals.medicalStatus);
					data.info.railways = trainStatus;
					data.info.buildings = buildingStatus;
					data.info.medicals = medicalStatus;
					data.info.dOfficeInfo = dOfficeInfo;
					data.statistic = utils.mergeArrayJson(trainStatus.total.summary, buildingStatus.total.summaryBuilding, medicalStatus.total);
					
					data.actionsGuide.phaseColor = mainStatus.phaseColor;
					// get Actions guide if have disaster
					if (mainStatus.curPhase) {
						var uInfo = 5;
						sipDb.getActionsGuideByUser(uInfo, mainStatus.curPhase).then(function(actions) {
//							console.log('actions B', actions);
							data.actionsGuide.actions = actions;
							if (!data.isPhone)
                                res.render('home', data);
                            else
                                res.render('home_mobile', data);
                        });
                    } else {
                        if (!data.isPhone)
                            res.render('home', data);
                        else
                            res.render('home_mobile', data);
                    }
                });
            } else {
                mainStatus.maxSindo = {};
                mainStatus.maxSindo.value = maxSindo.sindo;
                mainStatus.maxSindo.hours = maxSindo.sendtime.getHours();
                mainStatus.maxSindo.minutes = maxSindo.sendtime.getMinutes();
                mainStatus.maxSindo.minutes = maxSindo.sendtime.getMinutes();
                mainStatus.maxSindo.place = maxSindo.siteName;
                mainStatus.shinjukuSindo = shinjuku.sindo;
                mainStatus.demoColor = !maxSindo.demo ? 'purple' : 'red';

                sipDb.getMax23Sindo(req, res).then(function(max23Sindo) {
                    //					console.log('max23Sindo', max23Sindo);
                    mainStatus.max23Sindo = max23Sindo.sindo;
                    data.mainStatus = mainStatus;

					sipDb.getDetailStatus(req, function(trains, buildings, medicals, dOfficeInfo) {
						var trainStatus = trains.isSuccessful? utils.formatTrainStatus(trains.trainsStatus): {isSuccessful: false};
						var buildingStatus = utils.formatBuildingStatus(buildings.buildingStatus);
						var medicalStatus = utils.formatMedicalStatus(medicals.medicalStatus);
						data.info.railways = trainStatus;
						data.info.buildings = buildingStatus;
						data.info.medicals = medicalStatus;
						data.info.dOfficeInfo = dOfficeInfo;
						data.statistic = utils.mergeArrayJson(trainStatus.total.summary, buildingStatus.total.summaryBuilding, medicalStatus.total);

                        data.actionsGuide.phaseColor = mainStatus.phaseColor;
                        // get Actions guide if have disaster
                        // curPhase = 1/2/3/4
                        if (mainStatus.curPhase) {
                            var uInfo = 5;
                            sipDb.getActionsGuideByUser(uInfo, mainStatus.curPhase).then(function(actions) {
                                //								console.log('actions B', actions);
                                data.actionsGuide.actions = actions;
                                if (!data.isPhone)
                                    res.render('home', data);
                                else
                                    res.render('home_mobile', data);
                            });
                        } else { // NO disaster, curPhase = 0
                            if (!data.isPhone)
                                res.render('home', data);
                            else
                                res.render('home_mobile', data);
                        }
                    });
                });
            }
        });
    });
    /* GET ADMIN home page. */
    router.get('/admin', sCheckerAdmin.checkRoles, function(req, res, next) {
        // Get all siteCode of Tokyo
        sipDb.getTokyoSitecodes().then(function(tokyoSitecodes) {
            var data = _getDisasterData();
            data.roleAdmin = true;
            data.loginUser = 'システム管理者';
            data.info.TokyoSitecodes = tokyoSitecodes;
            //			console.log('render admin', data);
            res.render('admin', data);
        }).catch(function(err) {
            //			console.log('admin', err);
            res.render('admin', err);
        });

    });

    return router;
};
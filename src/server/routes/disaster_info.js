'use strict';

var mSql = require('../common/mysql_promise');
var mysqlConfig = require('../datasources.json');
var utils = require('../common/utilities');
var TRAIN_PATH = '/sip/public/images/train/';
var errMsg = require('../common/error-messages');
module.exports = function(app, SecureChecker) {
    var sipDb = require('../common/sip_db')(app);
    var sCheckerB = new SecureChecker(app, ['workerb']);

    var router = app.loopback.Router();
    router.get('/get_trains', function(req, res, next) {
        //		console.log('get_trains');
        sipDb.getTrainStatus().then(function(trains) {
            //			console.log('get actions OK', actions);
            var trainStatus = trains.isSuccessful ? utils.formatTrainStatus(trains.trainsStatus) : { isSuccessful: false };
            //			console.log('get_trains', trainStatus);
            res.send(trainStatus);
        }).then(function(err) {
            console.log('get_trains FAILED', err);
            if (err)
                res.status(500).send({ isSuccessful: false });
        });
    });

	router.get('/get_building', function (req, res, next) {
		sipDb.getBuildingStatus(req).then(function(buildings) {
			var buildingStatus = utils.formatBuildingStatus(buildings.buildingStatus);
//			console.log('get_building', buildingStatus);
			res.send(buildingStatus);
		}).then(function(err) {
			console.log('get_building FAILED', err);
			if (err)
				res.status(500).send({isSuccessful: false});
		});
	});

	router.get('/get_medical', function (req, res, next) {
		sipDb.getMedicalStatus().then(function(medicals) {
			var medicalStatus = utils.formatMedicalStatus(medicals.medicalStatus);
//			console.log('get_medical', medicalStatus);
			res.send(medicalStatus);
		}).then(function(err) {
			console.log('get_medical FAILED', err);
			if (err)
				res.status(500).send({isSuccessful: false});
		});
	});
	
	router.get('/get_doffice', function (req, res, next) {
		sipDb.getDOfficeInfo().then(function(dOfficeInfo) {
//			console.log('get_doffice', dOfficeInfo);
			res.send(dOfficeInfo);
		}).then(function(err) {
			console.log('get_doffice FAILED', err);
			if (err)
				res.status(500).send({isSuccessful: false});
		});
	});
	/**
	 * For update damage info.
	 */
	router.get('/get_statistic', function (req, res, next) {
		sipDb.getDetailStatus(req, function(trains, buildings, medicals, dOfficeInfo) {
//			console.log('get_statistic', trains, buildings, medicals);
			var data = {isSuccessful: true, info: {buildings: {}}, statistic: []};

            var trainStatus = trains.isSuccessful ? utils.formatTrainStatus(trains.trainsStatus) : { isSuccessful: false };
            var buildingStatus = buildings.isSuccessful ? utils.formatBuildingStatus(buildings.buildingStatus) : { isSuccessful: false };
            var medicalStatus = medicals.isSuccessful ? utils.formatMedicalStatus(medicals.medicalStatus) : { isSuccessful: false };

            var isSuccessful = trains.isSuccessful && buildings.isSuccessful && medicals.isSuccessful;
            if (!isSuccessful) {
                res.status(500).send({ isSuccessful: false });
                return;
            }

			data.statistic = utils.mergeArrayJson(trainStatus.total.summary, buildingStatus.total.summaryBuilding, medicalStatus.total);
			data.info.buildings = buildingStatus; // reload buildings.total.sumEnrollment & buildings.total.sumPeople
			data.info.dOfficeInfo = dOfficeInfo; // reload dOfficeInfo
			res.send(data);
		});
	});
	/**
	 * For update damage info.
	 */
	router.get('/get_update', function (req, res, next) {
		sipDb.getDetailStatus(req, function(trains, buildings, medicals, dOfficeInfo) {
//			console.log('get_statistic', trains, buildings, medicals);
			var data = {isSuccessful: true, info: {buildings: {}}, statistic: []};

			var trainStatus = trains.isSuccessful? utils.formatTrainStatus(trains.trainsStatus): {isSuccessful: false};
			var buildingStatus = buildings.isSuccessful? utils.formatBuildingStatus(buildings.buildingStatus): {isSuccessful: false};
			var medicalStatus = medicals.isSuccessful? utils.formatMedicalStatus(medicals.medicalStatus): {isSuccessful: false};

			var isSuccessful = trains.isSuccessful && buildings.isSuccessful && medicals.isSuccessful;
			if (!isSuccessful) {
				res.status(500).send({isSuccessful: false});
				return;
			}
			// update damage statistic
			data.statistic = utils.mergeArrayJson(trainStatus.total.summary, buildingStatus.total.summaryBuilding, medicalStatus.total);
			// update trains, building, medical, dOfficeInfo
			data.info.railways = trainStatus;
			data.info.buildings = buildingStatus;
			data.info.medicals = medicalStatus;
			data.info.dOfficeInfo = dOfficeInfo;
			
			res.send(data);
		});
	});

    router.get('/get_history_dates', function(req, res, next) {
        //		console.log('get_history_dates');
        var result = { isSuccessful: true, historyDates: [], stateCodes: [], tokyoSitecodes: [] };

        var getAllHistoryTableNameSql = "SELECT table_name FROM information_schema.tables WHERE (table_schema = '" +
            mysqlConfig.SIP.database + "' AND  table_name like 'bousai_%') ORDER BY table_name DESC";

        var getTokyoHistorySqls = [];
        mSql.singleQuery(getAllHistoryTableNameSql)
            .then(function(tableNames) {
                if (tableNames.length < 1) {
                    throw new Error('No History');
                }
                var historyTables = [];
                tableNames.forEach(function(tableNameObj) {
                    historyTables.push(tableNameObj['table_name']);
                });
                var getHistoryDaysSqls = [];
                var historyDates = [];
                historyTables.forEach(function(tblName) {
                    // Get history list by year, month
                    var sentimeSql = "SELECT hTable.SendTime, Sindo AS maxSindo, LongPeriodGroundMotionIntensityScale AS lpgm," +
                        " hTable.Sitecode, sitecode_name.Name, sitecode_name.State FROM " + tblName +
                        " hTable INNER JOIN (SELECT SendTime, MAX(Sindo) AS mSindo from " + tblName +
                        " WHERE Sindo>=4 GROUP BY SendTime) maxSindoTable INNER JOIN sitecode_name" +
                        " ON hTable.SendTime=maxSindoTable.SendTime AND hTable.Sindo=maxSindoTable.mSindo" +
                        " AND hTable.Sitecode=sitecode_name.Sitecode" +
                        " GROUP BY SendTime ORDER BY SendTime DESC";
                    getHistoryDaysSqls.push(sentimeSql);
                    // sql for query history in Tokyo by year, month
                    var getTokyoHistorySql = "SELECT SendTime, Sitecode, Sindo, LongPeriodGroundMotionIntensityScale AS lpgm, created FROM " +
                        tblName +
                        " WHERE Sitecode LIKE 'TKY%' AND Sindo>=4 ORDER BY Sindo DESC, created DESC";
                    getTokyoHistorySqls.push(getTokyoHistorySql);

                    var tblNameSplit = tblName.split('_');
                    historyDates.push({ tableName: tblName, yyyy: tblNameSplit[1], mm: tblNameSplit[2] });
                });
                //			console.log('get_history_dates', historyDates);
                result.historyDates = historyDates;
                return mSql.singleQuery(getHistoryDaysSqls.join(';'));
            })
            .then(function(historyDays) {
                //			console.log('getHistoryDays', historyDays);
                historyDays.forEach(function(hDay, i) {
                    //				console.log('getHistoryDays', hDay);
                    result.historyDates[i].hDays = hDay;
                });
                // Get State list from database
                var getStateCodesSql = "SELECT substring(Sitecode, 1, 3) AS shorthandSitecode, State AS state from sitecode_name GROUP BY substring(Sitecode, 1, 3)";
                return mSql.singleQuery(getStateCodesSql);
            })
            .then(function(stateCodes) { // for State filter
                //			console.log('getStateCodes', stateCodes);
                result.stateCodes = stateCodes;
                return sipDb.getTokyoSitecodes();
            })
            .then(function(tokyoSitecodeNames) {
                //			console.log('get_history_dates tokyo info', tokyoSitecodeNames);
                result.tokyoSitecodes = tokyoSitecodeNames;
                return mSql.singleQuery(getTokyoHistorySqls.join(';'));
            })
            .then(function(tokyoHistories) {
                //			console.log('tokyo history', tokyoHistories);
                tokyoHistories.forEach(function(tkyH, i) {
                    //				console.log('tokyo history', tkyH);
                    result.historyDates[i].tokyoHistory = tkyH;
                });

                res.send(result);
            })
            .catch(function(err) {
                console.log('get tableNames err', err);
                result.isSuccessful = false;
                res.status(500).send(result);
            });
    });
    /**
     * Get history detail (Sitename and its Sindo) by Sendtime.
     */
    router.get('/get_history_by_date', function(req, res, next) {
        //		SELECT Sindo, sitecode_name.Name from bousai_2011_03 inner join sitecode_name where Sindo>=4 and SendTime in (select distinct SendTime from bousai_2011_03) and bousai_2011_03.Sitecode=sitecode_name.Sitecode and date(SendTime)=date('2011-03-11T07:46:36.000Z')
        //		console.log('get_history_by_date', req.query);
        var yyyyMM = req.query.formattedSendTime.split('.');
        // validate input
        if (yyyyMM.length < 2) {
            res.send([]);
            return;
        }

        var tableName = 'bousai_' + yyyyMM[0] + '_' + yyyyMM[1];
        var stateFilter = req.query.stateFilter ? "hTable.Sitecode LIKE '" + req.query.shorthandSitecode + "%' AND" : "";
        var getSiteNameSindosSql = "SELECT Sindo, sitecode_name.Name FROM " + tableName +
            " hTable INNER JOIN sitecode_name ON hTable.Sitecode=sitecode_name.Sitecode WHERE " +
            stateFilter +
            " Sindo>=4 " +
            " AND SendTime='" + req.query.dbSendTime + "'";
        mSql.singleQuery(getSiteNameSindosSql)
            .then(function(siteNames) {
                //			console.log('siteNames', siteNames.length);
                res.send(siteNames);
            })
            .catch(function(err) {
                console.log('get_history_by_date err', err);
                res.status(500).send({ isSuccessful: false });
            });
    });
    /**
     * 	Get history list by Sitecode.
     */
    router.get('/get_history_by_siteCode', function(req, res, next) {
        //		SELECT Sindo, sitecode_name.Name from bousai_2011_03 inner join sitecode_name where Sindo>=4 and SendTime in (select distinct SendTime from bousai_2011_03) and bousai_2011_03.Sitecode=sitecode_name.Sitecode and date(SendTime)=date('2011-03-11T07:46:36.000Z')
        //		console.log('get_history_by_siteCode', req.query);
        var result = { isSuccessful: true, historyDates: [] };
        var getHistoryDaysSqls = [];
        req.query.historyTables.forEach(function(tblName) {
            /*var sendTimeSql = "SELECT SendTime, substring(Sitecode, 1, 3) AS shorthandSitecode, MAX(Sindo) AS maxSindo FROM " + tblName
            	+ " WHERE Sitecode LIKE '" + req.query.shorthandSitecode + "%' AND Sindo>=4 GROUP BY SUBSTRING(Sitecode, 1, 3), SendTime ORDER BY SendTime DESC";*/
            var sendTimeSql = "SELECT a.SendTime, substring(a.Sitecode, 1, 3) AS shorthandSitecode, a.Sindo AS maxSindo, a.LongPeriodGroundMotionIntensityScale AS lpgm," +
                " sitecode_name.Name, sitecode_name.State, a.created FROM " + tblName +
                " a INNER JOIN (SELECT Sitecode, max(Sindo) AS mSindo, MAX(created) AS maxtime FROM " + tblName +
                " WHERE Sitecode LIKE '" + req.query.shorthandSitecode + "%' AND Sindo>=4" +
                " GROUP BY SUBSTRING(Sitecode, 1, 3), SendTime) b" +
                " INNER JOIN sitecode_name" +
                " ON a.Sindo=b.mSindo AND SUBSTRING(a.Sitecode, 1, 3)=SUBSTRING(b.Sitecode, 1, 3) AND a.created=b.maxtime" +
                " AND a.Sitecode=sitecode_name.Sitecode" +
                " GROUP BY SUBSTRING(a.Sitecode, 1, 3), SendTime";
            getHistoryDaysSqls.push(sendTimeSql);
        });

        mSql.singleQuery(getHistoryDaysSqls.join(';'))
            .then(function(historyDays) {
                //			console.log('historyDays', historyDays);
                historyDays.forEach(function(hDay) {
                    if (hDay.length > 0)
                        result.historyDates.push(hDay);
                });
                res.send(result);
            })
            .catch(function(err) {
                console.log('get_history_by_siteCode err', err);
                res.status(500).send({ isSuccessful: false });
            });
    });
    /**
     * 	Get history list by Sindo.
     */
    router.get('/get_history_by_sindo', function(req, res, next) {
        //		console.log('get_history_by_sindo', req.query);
        if (!req.query.sindoLevel || !req.query.historyTables || !Array.isArray(req.query.historyTables)) {
            res.status(406).send({ isSuccessful: false });
            return;
        }

        var result = { isSuccessful: true, historyDates: [] };
        var getHistoryDaysSqls = [];
        var historyDates = [];
        var sindoCond = utils.getSindoWhere(req.query.sindoLevel);
        //		console.log('sindoCond', req.query.sindoLevel, sindoCond);
        req.query.historyTables.forEach(function(tblName) {
            /*var sendTimeSql = "SELECT a.SendTime, a.Sitecode, sitecode_name.Name, a.Sindo as maxSindo, a.LongPeriodGroundMotionIntensityScale AS lpgm, a.created FROM " + tblName
            	+ " a INNER JOIN (SELECT Sitecode, Sindo, MAX(created) AS maxtime, MAX(LongPeriodGroundMotionIntensityScale) AS maxLpgm FROM " + tblName
            	+ " WHERE " + sindoCond
            	+ " GROUP BY Sitecode, SendTime) b"
            	+ " INNER JOIN sitecode_name"
            	+ " ON a.Sindo=b.Sindo AND a.Sitecode=b.Sitecode"
            	+ " AND a.created=b.maxtime AND a.LongPeriodGroundMotionIntensityScale=b.maxLpgm"
            	+ " AND a.Sitecode=sitecode_name.Sitecode"
            	+ " GROUP BY a.Sitecode, SendTime ORDER BY SendTime DESC, lpgm DESC, created DESC";*/
            var sendTimeSql = "SELECT a.SendTime, a.Sitecode, a.Sindo AS maxSindo, a.LongPeriodGroundMotionIntensityScale AS lpgm," +
                " sitecode_name.Name, sitecode_name.State, a.created FROM " + tblName +
                " a INNER JOIN (SELECT Sitecode, max(Sindo) AS mSindo FROM " + tblName +
                " WHERE " + sindoCond +
                " GROUP BY Sitecode, SendTime) b" +
                " INNER JOIN sitecode_name" +
                " ON a.Sindo=b.mSindo AND a.Sitecode=b.Sitecode" +
                " AND a.Sitecode=sitecode_name.Sitecode" +
                " GROUP BY a.Sitecode, SendTime ORDER BY Sindo DESC";
            getHistoryDaysSqls.push(sendTimeSql);
            // build result
            var tblNameSplit = tblName.split('_'); 
            historyDates.push({ tableName: tblName, yyyy: tblNameSplit[1], mm: tblNameSplit[2] });
        });

        result.historyDates = historyDates;
        mSql.singleQuery(getHistoryDaysSqls.join(';'))
            .then(function(historyDays) {
                //			console.log('historyDays', historyDays);
                historyDays.forEach(function(hDay, i) {
                    result.historyDates[i].hDays = hDay;
                });
                res.send(result);
            })
            .catch(function(err) {
                console.log('get_history_by_sindo err', err);
                res.status(500).send({ isSuccessful: false });
            });
    });

    router.put('/save_building', function(req, res) {
        var data = JSON.stringify(req.body);
        var dataJson = JSON.parse(data);
        var where = {
            where: { sBuildingId: dataJson.id }
        };
        var value = {
            acceptance: dataJson.acceptance,
            electricity: dataJson.electricity,
            waterSupply: dataJson.waterSupply,
            communication: dataJson.communication,
            toilet: dataJson.toilet,
            townGas: dataJson.townGas,
            fire: dataJson.fire,
            numberOfPeople: dataJson.numberOfPeople,
            enrollment: dataJson.enrollment,
            updated: new Date()
        };
        var validateBuildingData = function() {
            return new Promise(function(resolve, reject) {
                app.models.StatusBuilding.find(where, function(err, buildings) {
                    if (err) reject({ err: errMsg.ERR_SERVER_GET_PROBLEM });
                    else if (buildings.length <= 0) reject({ err: errMsg.ERR_INVALID_BUILDING_ID });
                    else resolve({ isValidated: true });
                });
            })
        }

        var saveBuildingInfo = function() {
            return new Promise(function(resolve, reject) {
                app.models.StatusBuilding.updateAll({ sBuildingId: dataJson.id }, value, function(err, info) {
                    if (err)
                        reject({ err: errMsg.ERR_SERVER_GET_PROBLEM });
                    else resolve({ err: null });
                });
            });
        }
        validateBuildingData().then(function(result) {
            saveBuildingInfo().then(function(result) {
                res.send(result);
            }).catch(function(err) {
                res.send(err);
            })
        }).catch(function(err) {
            res.send(err);
        });

    });

    router.put('/save_medical', function(req, res) {
        var data = req.body;
        var where = {
            where: { sMedicalId: data.id }
        };
        var value = {
            medicalAcceptance: data.acceptance,
            updated: new Date()
        };
        var validateMedicalInfo = function() {
            return new Promise(function(resolve, reject) {
                app.models.StatusMedical.find(where, function(err, medicals) {
                    if (err) reject({ err: errMsg.ERR_SERVER_GET_PROBLEM });
                    else if (medicals.length <= 0) reject({ err: errMsg.ERR_INVALID_MEDICAL_ID });
                    else resolve({ isValidated: true });
                })
            })
        };
        var saveMedicalInfo = function() {
            return new Promise(function(resolve, reject) {
                app.models.StatusMedical.updateAll({ sMedicalId: data.id }, value, function(err, info) {
                    if (err)
                        reject({ err: errMsg.ERR_SERVER_GET_PROBLEM });
                    else resolve({ err: null });
                });
            })
        };

        validateMedicalInfo().then(function(result) {
            saveMedicalInfo().then(function(result) {
                res.send(result);
            }).catch(function(err) {
                res.send(err);
            })
        }).catch(function(err) {
            res.send(err);
        });


    });

    router.put('/save_doffice', function(req, res) {
        //		console.log('save_doffice', req.body);
        if (!req.body.dofficeId || !parseInt(req.body.dofficeId) ||
            !req.body.dofficeOpentime || !req.body.dofficePhone1 || !req.body.dofficePhone2) {
            res.send({ isSuccessful: false });
            return;
        }

        sipDb.updateDOffice(req.body.dofficeId, req.body.dofficeOpentime, req.body.dofficePhone1, req.body.dofficePhone2).then(function(dOf) {
            //			console.log('updateDOffice OK', dOf);
            res.send({ isSuccessful: true });
        }).catch(function(err) {
            console.log('save_doffice FAILED', err);
            res.send({ isSuccessful: false });
        });
    });

    return router;
};
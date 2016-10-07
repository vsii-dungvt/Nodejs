'use strict';
var TRAIN_PATH = '/sip/train/service';
var NEW_BOUSAI_SERVICES_PATH = '/sip/newbousai/service';
var PATTERN_SERVICES_PATH = '/sip/pattern/service';
var DISASTER_INFO_SERVICES_PATH = '/sip/disaster-info/service';
var getTrainsContext = '/get_trains';
var getBuildingContext = '/get_building';
var getMedicalContext = '/get_medical';
var getDOfficeContext = '/get_doffice';
var getStatisticContext = '/get_statistic';
var getUpdateContext = '/get_update';

var saveBuildingContext = '/save_building';
var saveMedicalContext = '/save_medical';
var saveDofficeContext = '/save_doffice';
var getHistoryDatesContext = '/get_history_dates';
var getHistoryByDateContext = '/get_history_by_date';
var getHistoryListBySitecodeContext = '/get_history_by_siteCode';
var getHistoryListBySindoContext = '/get_history_by_sindo';

angular.module('sip.home').factory('HomeService', function(){
	return {
		getTrainStatus: function(winCb, failCb) {
			return $.ajax({
				url: DISASTER_INFO_SERVICES_PATH + getTrainsContext,
				method: 'GET',
				success: function(data, textStatus, jqXHR) {
					if (winCb)
						winCb(data);
				},
				error: function(jqXHR, textStatus, e) {
					if (failCb)
						failCb(e);
				}
			});
		},
		
		getBuildingStatus: function(winCb, failCb) {
			return $.ajax({
				url: DISASTER_INFO_SERVICES_PATH + getBuildingContext,
				method: 'GET',
				success: function(data, textStatus, jqXHR) {
					if (winCb)
						winCb(data);
				},
				error: function(jqXHR, textStatus, e) {
					if (failCb)
						failCb(e);
				}
			});
		},
		
		getMedicalStatus: function(winCb, failCb) {
			return $.ajax({
				url: DISASTER_INFO_SERVICES_PATH + getMedicalContext,
				method: 'GET',
				success: function(data, textStatus, jqXHR) {
					if (winCb)
						winCb(data);
				},
				error: function(jqXHR, textStatus, e) {
					if (failCb)
						failCb(e);
				}
			});
		},
		
		getDOfficeInfo: function(winCb, failCb) {
			return $.ajax({
				url: DISASTER_INFO_SERVICES_PATH + getDOfficeContext,
				method: 'GET',
				success: function(data, textStatus, jqXHR) {
					if (winCb)
						winCb(data);
				},
				error: function(jqXHR, textStatus, e) {
					if (failCb)
						failCb(e);
				}
			});
		},
		
		getActionsGuide: function(curPhase, winCb, failCb) {
			return $.ajax({
				url: PATTERN_SERVICES_PATH,
				data: {curPhase: curPhase},
				success: function(data, textStatus, jqXHR) {
					console.log('ok', data, textStatus);
					if (winCb)
						winCb(data);
				},
				error: function(jqXHR, textStatus, e) {
					if (failCb)
						failCb(e);
				},
				method: 'GET'
			});
		},
		
		getStatistic: function(winCb, failCb) {
			return $.ajax({
				url: DISASTER_INFO_SERVICES_PATH + getStatisticContext,
				method: 'GET',
				success: function(data, textStatus, jqXHR) {
					if (winCb)
						winCb(data);
				},
				error: function(jqXHR, textStatus, e) {
					if (failCb)
						failCb(e);
				}
			});
		},
		
		getUpdate: function(winCb, failCb) {
			return $.ajax({
				url: DISASTER_INFO_SERVICES_PATH + getUpdateContext,
				method: 'GET',
				success: function(data, textStatus, jqXHR) {
					if (winCb)
						winCb(data);
				},
				error: function(jqXHR, textStatus, e) {
					if (failCb)
						failCb(e);
				}
			});
		},
		
		getHistoryDates: function(winCb, failCb) {
			return $.ajax({
				url: DISASTER_INFO_SERVICES_PATH + getHistoryDatesContext,
				method: 'GET',
				success: function(data, textStatus, jqXHR) {
					if (winCb)
						winCb(data);
				},
				error: function(jqXHR, textStatus, e) {
					if (failCb)
						failCb(e);
				}
			});
		},
		
		getHistoryByDay: function(hDay, winCb, failCb) {
			return $.ajax({
				url: DISASTER_INFO_SERVICES_PATH + getHistoryByDateContext,
				method: 'GET',
				data: hDay,
				success: function(data, textStatus, jqXHR) {
					if (winCb)
						winCb(data);
				},
				error: function(jqXHR, textStatus, e) {
					if (failCb)
						failCb(e);
				}
			});
		},
		
		getHistoryListBySitecode: function(siteCode, winCb, failCb) {
			return $.ajax({
				url: DISASTER_INFO_SERVICES_PATH + getHistoryListBySitecodeContext,
				method: 'GET',
				data: siteCode,
				success: function(data, textStatus, jqXHR) {
					if (winCb)
						winCb(data);
				},
				error: function(jqXHR, textStatus, e) {
					if (failCb)
						failCb(e);
				}
			});
		},
		
		getHistoryListBySindo: function(sindo, winCb, failCb) {
			return $.ajax({
				url: DISASTER_INFO_SERVICES_PATH + getHistoryListBySindoContext,
				method: 'GET',
				data: sindo,
				success: function(data, textStatus, jqXHR) {
					if (winCb)
						winCb(data);
				},
				error: function(jqXHR, textStatus, e) {
					if (failCb)
						failCb(e);
				}
			});
		},
		
		changePhase: function(newPhase, winCb, failCb) {
			return $.ajax({
				url: NEW_BOUSAI_SERVICES_PATH,
				method: 'PUT',
				data: newPhase,
				success: function(data, textStatus, jqXHR) {
					if (winCb)
						winCb();
				},
				error: function(jqXHR, textStatus, e) {
					if (failCb)
						failCb();
				}
			});
		},
		
		saveBuildingRow: function (data) {
			return $.ajax({
				url: DISASTER_INFO_SERVICES_PATH + saveBuildingContext,
				method: 'PUT',
				data: data
			});
		},
		
		saveMedicalRow: function (data) {
			return $.ajax({
				url: DISASTER_INFO_SERVICES_PATH + saveMedicalContext,
		        method: 'PUT',
		        data: data
			});
		},
		
		saveDofficeRow: function (data) {
			return $.ajax({
				url: DISASTER_INFO_SERVICES_PATH + saveDofficeContext,
				method: 'PUT',
				data: data
			});
		}
	};
});

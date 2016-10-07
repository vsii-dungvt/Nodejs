'use strict';

angular.module('sip.home').constant('Sindos', ['震度4', '震度5弱', '震度5強', '震度6弱', '震度6強', '震度7']);
angular.module('sip.home').controller('HomeCtrl', function($scope, $filter, $interval, HomeService, CurData
		, Statistic, MainStatus, ActionsGuide, LoginUser, Sindos, notifications) {
//    console.log('[HomeCtrl]', CurData);
    var vm = this;
    $scope.acceptanceOptions = [{value: 0, desc: '確認中', status: 'red'}, 
                                {value: 1, desc: '危険', status: 'red'}, {value: 2, desc: '安全', status: ''}];
    
    $scope.fireOptions = [{value: 0, desc: '確認中', status: 'red'}, 
                                {value: 1, desc: 'なし', status: ''}, {value: 2, desc: 'あり', status: 'red'}];
    $scope.electricOptions = [{value: 0, desc: '確認中', status: ''}
    	, {value: 1, desc: '危険', status: '/sip/public/images/resources/ng-denki.png'}
    	, {value: 2, desc: '安全', status: '/sip/public/images/resources/denki.png'}];
    $scope.gasOptions = [{value: 0, desc: '確認中', status: ''}
		, {value: 1, desc: '危険', status: '/sip/public/images/resources/ng-gas.png'}
		, {value: 2, desc: '安全', status: '/sip/public/images/resources/gas.png'}];
    $scope.waterOptions = [{value: 0, desc: '確認中', status: ''}
		, {value: 1, desc: '危険', status: '/sip/public/images/resources/ng-suidou.png'}
		, {value: 2, desc: '安全', status: '/sip/public/images/resources/suidou.png'}];
    $scope.wifiOptions = [{value: 0, desc: '確認中', status: ''}
		, {value: 1, desc: '危険', status: '/sip/public/images/resources/ng-wifi.png'}
		, {value: 2, desc: '安全', status: '/sip/public/images/resources/wifi.png'}];
    $scope.toiletOptions = [{value: 0, desc: '確認中', status: ''}
		, {value: 1, desc: '危険', status: '/sip/public/images/resources/ng-toire.png'}
		, {value: 2, desc: '安全', status: '/sip/public/images/resources/toire.png'}];

    var mCurPhase = MainStatus.curPhase;
    var mNewPhase = 0;
    $scope.loginUser = LoginUser;
    $scope.isUserA = false;
    $scope.isUserB = false;
    $scope.loginUser = LoginUser;
    if ($scope.loginUser.localeCompare("防災従事者A") == 0) $scope.isUserA = true;
    if ($scope.loginUser.localeCompare("防災従事者B") == 0) $scope.isUserB = true;
    $scope.curTab = '鉄道運行'; // tab 1
    $scope.curLocation = Messages.topLocation + ' > ' + Messages.homeLocation + ' (鉄道運行)';
    $scope.railways = CurData.railways;
    $scope.buildings = CurData.buildings;
    $scope.medicals = CurData.medicals;
    $scope.maps = CurData.maps;
    $scope.dOfficeInfo = CurData.dOfficeInfo;
    // For check update each 1 hours
    var originTrainStr = JSON.stringify($scope.railways.detail);
    var originWestBuildingStr = '';
    var originEastBuildingStr = '';
    var originSouthBuildingStr = '';
    
    var originWestMedicalStr = '';
    var originEastMedicalStr = '';
    var originSouthMedicalStr = '';
    var originDOfficeStr = '';
    // Save origin Building for later checking update each 1 hours
    var _setupOriginBuilding = function(buildingArr) {
    	var westBuildings = $filter('filter')(buildingArr, {building_area: '新宿西口'});
    	originWestBuildingStr = JSON.stringify(westBuildings);
    	
    	var eastBuildings = $filter('filter')(buildingArr, {building_area: '新宿東口'});
    	originEastBuildingStr = JSON.stringify(eastBuildings);
    	
    	var southBuildings = $filter('filter')(buildingArr, {building_area: '新宿南口'});
    	originSouthBuildingStr = JSON.stringify(southBuildings);
    };
    // Save origin building
    _setupOriginBuilding($scope.buildings.detail);
    
    // Save origin Medical for later checking update each 1 hours
    var _setupOriginMedical = function(medicalArr) {
    	var westMedicals = $filter('filter')(medicalArr, {Medical_area_desc: '新宿西口'});
    	originWestMedicalStr = JSON.stringify(westMedicals);
    	
    	var eastMedicals = $filter('filter')(medicalArr, {Medical_area_desc: '新宿東口'});
    	originEastMedicalStr = JSON.stringify(eastMedicals);
    	
    	var southMedicals = $filter('filter')(medicalArr, {Medical_area_desc: '新宿南口'});
    	originSouthMedicalStr = JSON.stringify(southMedicals);
    };
    // Save origin medical
    _setupOriginMedical($scope.medicals.detail);
    
    var _setupDofficeInfo = function() {
        if ($scope.dOfficeInfo && $scope.dOfficeInfo.dOffices) {
        	originDOfficeStr = JSON.stringify($scope.dOfficeInfo.dOffices);
        	$scope.dOfficeInfo.dOffices.forEach(function(dOf) {
        		// For display
    	    	dOf.formattedDofficeOpentime = $filter('date')(dOf.dofficeOpentime, 'yyyy.MM.dd HH.mm');
    	    	var dtStr = dOf.formattedDofficeOpentime.split(' ');
    	    	var dates = dtStr[0].split('.');
    	    	var times = dtStr[1].split('.');
    	    	dOf.isoOpenTime = new Date(dates[0], parseInt(dates[1]) - 1, dates[2], times[0], times[1]);
    	    	dOf.originData = JSON.parse(JSON.stringify(dOf));
    	    });
        }
    };
    // Format dofficeOpentime for display
    _setupDofficeInfo();

    $scope.Statistic = Statistic;
    var originStatisticStr = JSON.stringify($scope.Statistic);
//    console.log('statistic', $scope.Statistic);
    // For history filter by Sindo
    $scope.Sindos = Sindos;
    var historyTables = [];
    var sitesBySindo = {};
    $scope.historyDetail = { sendTime: '', MAX: { formattedSindo: '', siteName: '', lpgm: '' }, SITES: [] };
    // For hightlight selected row is history tables
    $scope.selectedDateRow = null;
    $scope.selectedStateRow = null;
    $scope.selectedSindoRow = null;
    $scope.selectedTokyoRow = null;

    $scope.areaFilters = {};
    $scope.areaMedicalFilters = {};
    $scope.areaMapFilters = { map_name: 'global' };
    $scope.phases = MainStatus.disasterStatus;

    $scope.selectOptionsMedical = ["確認中", "受入可", "受入不可"];
    $scope.selectOptionsFire = ["確認中", "なし", "あり"];
    $scope.selectOptionPeople = [
        { value: 0, desc: "49人以下" },
        { value: 1, desc: "50–99人" },
        { value: 2, desc: "100–149人" },
        { value: 3, desc: "150–199人" },
        { value: 4, desc: "200–249人" },
        { value: 5, desc: "250–299人" },
        { value: 6, desc: "300人以上" },
        { value: 7, desc: "確認中" },
        { value: 8, desc: "受入不可" }
    ];
    $scope.selectOptionEnroll = [
        { value: 0, desc: "999人以下" },
        { value: 1, desc: "1000-1499人" },
        { value: 2, desc: "1500-1999人" },
        { value: 3, desc: "2000-2499人" },
        { value: 4, desc: "2500-2999人" },
        { value: 5, desc: "3000-3499人" },
        { value: 6, desc: "3500-3999人" },
        { value: 7, desc: "4000-4499人" },
        { value: 8, desc: "4500人以上" }
    ];

    $scope.actionsGuide = ActionsGuide.actions;
    $scope.phaseColor = ActionsGuide.phaseColor;
    $scope.mes = "";

    var _setupBuildingPeopleEnrollment = function() {
    	$scope.buildings.detail.forEach(function(building) {
    		if (building.numberOfPeople)
    			building.peoples = $scope.selectOptionPeople[parseInt(building.numberOfPeople)].desc;
    		if (building.enrollment)
    			building.enrollmentNumber = $scope.selectOptionEnroll[parseInt(building.enrollment)].desc;
    	});
    };
    // Get value for Number_of_people and Enrollment columns
    _setupBuildingPeopleEnrollment();

    // css train table of has scrollbar
    window.cssFilters('#train .table-responsive', '#train .table_header_train');
    // Check update 1 hours interval for cancel if need
    var checkUpdate;
    var _getUpdate = function() {
		var winCb = function(data) {
	    	// Check Train update
			if (originTrainStr !== JSON.stringify(data.info.railways.detail)) {
				$scope.hasTrainUpdate = true;
			}
	    	// Check Building update
			var newWestBlds = $filter('filter')(data.info.buildings.detail, {building_area: '新宿西口'});
	    	var newEastBlds = $filter('filter')(data.info.buildings.detail, {building_area: '新宿東口'});
	    	var newSouthBlds = $filter('filter')(data.info.buildings.detail, {building_area: '新宿南口'});
	    	
	    	if (originWestBuildingStr !== JSON.stringify(newWestBlds)) {
	    		$scope.hasWestBuildingUpdate = true;
	    		$scope.hasBuildingUpdate = true;
	    	}
	    	if (originEastBuildingStr !== JSON.stringify(newEastBlds)) {
	    		$scope.hasEastBuildingUpdate = true;
	    		$scope.hasBuildingUpdate = true;
	    	}
	    	if (originSouthBuildingStr !== JSON.stringify(newSouthBlds)) {
	    		$scope.hasSouthBuildingUpdate = true;
	    		$scope.hasBuildingUpdate = true;
	    	}
	    	// Check Medical update
	    	var newWestMeds = $filter('filter')(data.info.medicals.detail, {Medical_area_desc: '新宿西口'});
	    	var newEastMeds = $filter('filter')(data.info.medicals.detail, {Medical_area_desc: '新宿東口'});
	    	var newSouthMeds = $filter('filter')(data.info.medicals.detail, {Medical_area_desc: '新宿南口'});
	    	
	    	if (originWestMedicalStr !== JSON.stringify(newWestMeds)) {
	    		$scope.hasWestMedicalUpdate = true;
	    		$scope.hasMedicalUpdate = true;
	    	}
	    	if (originEastMedicalStr !== JSON.stringify(newEastMeds)) {
	    		$scope.hasEastMedicalUpdate = true;
	    		$scope.hasMedicalUpdate = true;
	    	}
	    	if (originSouthMedicalStr !== JSON.stringify(newSouthMeds)) {
	    		$scope.hasSouthMedicalUpdate = true;
	    		$scope.hasMedicalUpdate = true;
	    	}
			
	    	// Check Damage update
			if (data.info.dOfficeInfo.dOffices && originDOfficeStr !== JSON.stringify(data.info.dOfficeInfo.dOffices)) {
				$scope.hasPreventionUpdate = true;
			}
			if (originStatisticStr !== JSON.stringify(data.statistic)) {
				$scope.hasTrainStatisticUpdate = true;
				$scope.hasMedicalStatisticUpdate = true;
			}
//			console.log('get Update OK originMedicalStr', originMedicalStr === JSON.stringify(data.info.medicals.detail));
//			console.log('get Update OK originDOfficeStr', originDOfficeStr === JSON.stringify(data.info.dOfficeInfo.dOffices));
			
			$scope.$apply();
		};
		var failCb = function() {
			console.log('Can not get update');
		};

		HomeService.getUpdate(winCb, failCb);
    };
    
    checkUpdate = $interval(_getUpdate, 60*60*1000);
    
    $scope.reloadTrainsStatus = function() {
    	var winCb = function(trainsInfo) {
//    		console.log('reloadTrainsStatus OK', trainsInfo.detail);
    		$scope.railways = trainsInfo;
    		// reset originTrainStr
    		originTrainStr = JSON.stringify($scope.railways.detail);
    		$scope.hasTrainUpdate = false;
    		$scope.$apply();
    		window.cssFilters('#train .table-responsive', '#train .table_header_train');
    	};
    	var failCb = function() {
			$scope.mes = 'Can not update. Please try again!';
    		$scope.showError();
		};
    	HomeService.getTrainStatus(winCb, failCb);
    };
    
    $scope.showRailway = function(railwaysName) {
        if (railwaysName == 'JapanR') {
            $('.dataRailwayJR').show();
            $('.dataRailwayPrivateR').hide();
            $('.dataRailwayMetro').hide();
        }
        if (railwaysName == 'PrivateR') {
            $('.dataRailwayJR').hide();
            $('.dataRailwayPrivateR').show();
            $('.dataRailwayMetro').hide();
        }
        if (railwaysName == 'METRO') {
            $('.dataRailwayJR').hide();
            $('.dataRailwayPrivateR').hide();
            $('.dataRailwayMetro').show();
        }
    };

    $scope.changePhase = function(bousaiId) {
        //            	console.log('changePhase', mCurPhase);
        if (!mCurPhase && bousaiId + 1 > 1) {
            $scope.mes = 'Must set Phase 1 firstly.';
            $scope.showError();
            return;
        }
        if (mCurPhase && bousaiId + 1 < mCurPhase) {
            $scope.mes = 'Must set this disaster OFF before set new disaster ON.';
            $scope.showError();
            return;
        }

        var valueSelectedPhase = $scope.phases[bousaiId].value;
        $scope.phases.forEach(function(phase, i) {
            phase.value = 0;
            phase.imageSrc = '/sip/public/images/phase' + (i + 1) + '_off.png';
        });

        if (!valueSelectedPhase) {
            mCurPhase = bousaiId + 1;
            $scope.phases[bousaiId].value = 1;
            $scope.phases[bousaiId].imageSrc = '/sip/public/images/phase' + (bousaiId + 1) + '.png';
        } else {
            mCurPhase = 0;
        }
        var winCb = function() {
            console.log('Update phase successfully.');
            mNewPhase = $scope.phases[bousaiId].value ? bousaiId + 1 : 0; // selected phase
            $scope.phaseColor = 'grey';

            // TODO: reload screen
            var winAG = function(newActions) {
                $scope.actionsGuide = newActions;
                switch (bousaiId + 1) {
                    case 1:
                        $scope.phaseColor = 'darkred';
                        break;
                    case 2:
                        $scope.phaseColor = 'orange';
                        break;
                    case 3:
                        $scope.phaseColor = 'green';
                        break;
                    case 4:
                        $scope.phaseColor = 'blue';
                        break;

                    default:
                        break;
                }
                //				console.log('winAG', $scope.actionsGuide);
                if (!$scope.phases[bousaiId].value)
                    $scope.phaseColor = 'grey';
                $scope.$apply();
            };
            var failAG = function(err) {
                console.log('failAG', err);
            };
            //			console.log('mNewPhase', mNewPhase);
            HomeService.getActionsGuide(mNewPhase, winAG, failAG);
        };
        var failCb = function() {
            $scope.mes = 'Can not update. Please try again!';
            $scope.showError();
        };
        // Call service to update
        HomeService.changePhase($scope.phases[bousaiId], winCb, failCb);
    };

    $scope.selectMenu = function(menuText, tableId) {
        $('#recentInfo').show();
        $('#history').hide();
        $('#mapBtn').removeClass('active');
        $scope.curTab = menuText;
        $scope.curLocation = Messages.topLocation + ' > ' + Messages.homeLocation + ' (' + menuText + ')';
        // css filters tabbar
        if (tableId) {
            tableId !== 'train' ? window.cssFilters('#' + tableId + ' .table-responsive', '#' + tableId + ' .nav-pills') :
                window.cssFilters('#' + tableId + ' .table-responsive', '#' + tableId + ' .table_header_train');
        }
    };

    $scope.filterArea = function(area, tableId) {
        tableId === 'building' ? $scope.areaFilters.building_area = area :
            $scope.areaMedicalFilters.Medical_area_desc = area;
        window.cssFilters('#' + tableId + ' .table-responsive', '#' + tableId + ' .nav-pills');
    };

    $scope.filterMap = function(map) {
        $scope.areaMapFilters.map_name = map;
    };

    $scope.selectMap = function() {
        $('#home .tab-pane:not(#homeMap):not(#preventionInfo):not(#damageInfo)').removeClass('active');
        $('#home .wrapper-panel-left .nav-pills li').removeClass('active');
        $('#mapBtn').addClass('active');
        $('#homeMap').addClass('in active');
        $('#recentInfo').show();
        $('#history').hide();
        //        $('#fist_tab_mapscreen').click();
        // Update current location text
        $scope.curTab = 'MAP';
        $scope.curLocation = Messages.topLocation + ' > ' + Messages.homeLocation + ' (' + 'MAP' + ')';
    };

    $scope.hideHistory = function() {
        setTimeout(function() {
            $('#trainTab').click();
        }, 100);
    };

    $scope.showHistory = function() {
        // Clear old results
        $scope.historyDays = null;
        $scope.historyDaysBySiteCode = null;
        $scope.historyDaysBySindo = null;
        $scope.selectedDate = null;
        $scope.selectedState = null;
        $scope.selectedSindo = null;
        $scope.selectedTokyoSite = null;
        historyTables = [];
        // UI
        $('#home .tab-pane:not(#homeMap):not(#preventionInfo):not(#damageInfo)').removeClass('active');
        $('#home .wrapper-panel-left .nav-pills li').removeClass('active');
        $('#mapBtn').removeClass('active');
        $('#homeMap').removeClass('active');
        $('#homeMap').removeClass('active');
        $('#recentInfo').hide();
        $('#history').show();
        $('#history').addClass('in active');
        // Update current location text
        $scope.curTab = '過去地震情報';
        $scope.curLocation = Messages.topLocation + ' > ' + Messages.homeLocation + ' (' + '過去地震情報' + ')';
        var winCb = function(historyFilter) {
            //    		console.log('get historyDates OK', historyFilter);
            $scope.historyFilter = historyFilter;
            // Setup Tokyo history for Tokyo Sitename filter
            var tokyoH = {}; // {tokyoSitecode1: {sendTime1: detailObj}}
            $scope.historyFilter.historyDates.forEach(function(hDate) {
                hDate.tokyoHistory.forEach(function(tkyH) {
                    if (!tokyoH[tkyH.Sitecode])
                        tokyoH[tkyH.Sitecode] = {};
                    if (!tokyoH[tkyH.Sitecode][tkyH.SendTime]) {
                        // For display
                        tkyH.formattedSendTime = $filter('date')(tkyH.SendTime, 'yyyy.MM.dd');
                        tkyH.formattedMaxSindo = _formatSindo(tkyH.Sindo);
                        tokyoH[tkyH.Sitecode][tkyH.SendTime] = tkyH;
                    }
                });

                // save history tables for later query
                historyTables.push(hDate.tableName);
            });

            historyFilter.tokyoSitecodes.tokyoSitecodeNames.forEach(function(sc) {
                if (!sc.hDays)
                    sc.hDays = []; // history day list of this Sitecode
                if (tokyoH[sc.sitecode]) {
                    for (var sendtime in tokyoH[sc.sitecode]) {
                        // For display Sitename, Statename in history day list on Mobile when filter by Tokyo Sitename
                        tokyoH[sc.sitecode][sendtime].Name = sc.name;
                        tokyoH[sc.sitecode][sendtime].State = sc.state;
                        sc.hDays.push(tokyoH[sc.sitecode][sendtime]);
                    }
                }
            });
            //    		console.log('tokyo history', historyFilter.tokyoSitecodes.tokyoSitecodeNames);
            // Setup Statenames for Filter by State, we have 47 Statenames now
            $scope.historyFilter.stateCodes.some(function(sc) {
                if (sc.state.indexOf('北海道') >= 0) {
                    sc.state = '北海道';
                    return true;
                }
            });

            $scope.$apply();
        };
        var failCb = function() {
            $scope.mes = 'Can not get history. Please try again!';
            $scope.showError();
        };

        HomeService.getHistoryDates(winCb, failCb);
    };

    function _formatSindo(sindo) {
        var formattedSindo = '';
        if (sindo == 4)
            formattedSindo = '震度4';
        else if (sindo > 4 && sindo < 5)
            formattedSindo = '震度5弱';
        else if (sindo >= 5 && sindo < 5.5)
            formattedSindo = '震度5強';
        else if (sindo >= 5.5 && sindo < 6)
            formattedSindo = '震度6弱';
        else if (sindo >= 6 && sindo < 7)
            formattedSindo = '震度6強';
        else
            formattedSindo = '震度7';

        return formattedSindo;
    }
    /**
     * Get history detail (Sitename and its Sindo) by Sendtime.
     */
    $scope.getHistoryByDay = function(index, hDay, extraCode) {
        //    	console.log('getHistoryByDay', hDay, $scope.selectedDate);
        var winCb = function(histories) {
            $scope.historyDetail.sendTime = hDay.SendTime;
            var filteredSites = {};
            histories.forEach(function(history) {
                // format sindo for showing
                history.formattedSindo = _formatSindo(history.Sindo);
                if (history.Sindo == hDay.maxSindo) {
                    $scope.historyDetail.MAX.formattedSindo = hDay.formattedMaxSindo;
                    $scope.historyDetail.MAX.siteName = history.Name;
                    $scope.historyDetail.MAX.lpgm = hDay.lpgm;
                }

                if (!filteredSites[history.Name] ||
                    (filteredSites[history.Name].Name == history.Name && filteredSites[history.Name].Sindo < history.Sindo)) {
                    filteredSites[history.Name] = history;
                }
            });
            var sites = [];
            for (var key in filteredSites) {
                sites.push(filteredSites[key]);
            }
            //    		console.log('getHistoryByDay OK', sites.length, histories.length);
            $scope.historyDetail.SITES = sites;
            $scope.$apply();
        };
        var failCb = function() {
            $scope.mes = 'Can not get history. Please try again!';
            $scope.showError();
        };

        if (extraCode && extraCode === 1) {
            hDay.stateFilter = true;
            $scope.selectedStateRow = index;
        } else {
            $scope.selectedDateRow = index;
        }

        HomeService.getHistoryByDay(hDay, winCb, failCb);
    };

    $scope.searchHistoryListByDate = function() {
        //console.log('searchHistoryByDate', $scope.selectedDate);
        $scope.selectedDateRow = null;
        // Reset history detail
        $scope.historyDetail = { sendTime: '', MAX: { formattedSindo: '', siteName: '', lpgm: '' }, SITES: [] };

        $scope.historyFilter.historyDates.some(function(hDates) {
            if (hDates.yyyy === $scope.selectedDate.yyyy && hDates.mm === $scope.selectedDate.mm) {
                hDates.hDays.forEach(function(day) {
                    day.formattedSendTime = $filter('date')(day.SendTime, 'yyyy.MM.dd');
                    // For quering in database
                    day.dbSendTime = $filter('date')(day.SendTime, 'yyyy-MM-dd HH:mm:ss');
                    day.formattedMaxSindo = _formatSindo(day.maxSindo);
                });

                $scope.historyDays = hDates.hDays;

                return true;
            }
        });
        $scope.historyCheckDate = true;
        $scope.historyCheckState = false;
        $scope.historyCheckSindo = false;
        $scope.historyCheckSite = false;
    };
    /**
     * Get history list by Statename.
     */
    $scope.searchHistoryByState = function() {
        //    	console.log('searchHistoryByState', $scope.selectedState);
        // Reset hightlight selected row
        $scope.selectedStateRow = null;
        // Reset history detail
        $scope.historyDetail = { sendTime: '', MAX: { formattedSindo: '', siteName: '', lpgm: '' }, SITES: [] };
        var winCb = function(hDates) {
            //    		console.log('searchHistoryByState OK', hDates);
            var arrHDate = [].concat.apply([], hDates.historyDates);
            arrHDate.forEach(function(day) {
                day.formattedSendTime = $filter('date')(day.SendTime, 'yyyy.MM.dd');
                day.formattedMaxSindo = _formatSindo(day.maxSindo);
                // For quering in database
                day.dbSendTime = $filter('date')(day.SendTime, 'yyyy-MM-dd HH:mm:ss');
            });
            $scope.historyDaysBySiteCode = arrHDate;
            $scope.$apply();
        };
        var failCb = function() {
            $scope.mes = 'Can not get history. Please try again!';
            $scope.showError();
        };
        $scope.selectedState.historyTables = historyTables;
        HomeService.getHistoryListBySitecode($scope.selectedState, winCb, failCb);
        $scope.historyCheckDate = false;
        $scope.historyCheckState = true;
        $scope.historyCheckSindo = false;
        $scope.historyCheckSite = false;

    };
    /**
     * Get history list by Sindo.
     */
    $scope.searchHistoryBySindo = function() {
        //console.log('searchHistoryBySindo', $scope.selectedSindo);
        // Reset hightlight selected row
        $scope.selectedSindoRow = null;
        // Reset history detail
        $scope.historyDetail = { sendTime: '', MAX: { formattedSindo: '', siteName: '', lpgm: '' }, SITES: [] };
        $scope.historiesBySindo = [];
        sitesBySindo = {};
        var sendTimeList = {};
        var winCb = function(hDates) {
            //console.log('searchHistoryBySindo OK', hDates);
            $scope.historyDaysBySindo = [];
            hDates.historyDates.forEach(function(hDate) {
                hDate.hDays.forEach(function(hD) {
                    if (!sendTimeList[hD.SendTime] ||
                        sendTimeList[hD.SendTime].created < hD.created) { // show latest sitename, lpgm
                        sendTimeList[hD.SendTime] = hD;
                    }
                    if (!sitesBySindo[hD.SendTime]) {
                        sitesBySindo[hD.SendTime] = {};
                    }
                    if (!sitesBySindo[hD.SendTime].SITES)
                        sitesBySindo[hD.SendTime].SITES = [];

                    hD.formattedSindo = $scope.selectedSindo;
                    sitesBySindo[hD.SendTime].SITES.push(hD);
                });
            });
            for (var key in sendTimeList) {
                sendTimeList[key].formattedSendTime = $filter('date')(sendTimeList[key].SendTime, 'yyyy.MM.dd');
                $scope.historyDaysBySindo.push(sendTimeList[key]);
            }
            //    		console.log('searchHistoryBySindo formatted', $scope.historyDaysBySindo);
            $scope.$apply();
        };
        var failCb = function() {
            $scope.mes = 'Can not get history. Please try again!';
            $scope.showError();
        };

        HomeService.getHistoryListBySindo({ sindoLevel: $scope.selectedSindo, historyTables: historyTables }, winCb, failCb);
        $scope.historyCheckDate = false;
        $scope.historyCheckState = false;
        $scope.historyCheckSindo = true;
        $scope.historyCheckSite = false;
    };

    $scope.getHistoryBySindoDay = function(index, hDay) {
        $scope.selectedSindoRow = index;
        //    	console.log('getHistoryBySindoDay', hDay, sitesBySindo[hDay.SendTime].SITES.length);
        $scope.historyDetail = { sendTime: '', MAX: { formattedSindo: '', siteName: '', lpgm: '' }, SITES: [] };
        $scope.historyDetail.sendTime = hDay.SendTime;
        $scope.historyDetail.MAX.formattedSindo = $scope.selectedSindo;
        $scope.historyDetail.MAX.siteName = hDay.Name;
        $scope.historyDetail.MAX.lpgm = hDay.lpgm;
        $scope.historyDetail.SITES = sitesBySindo[hDay.SendTime].SITES;
    };

    $scope.searchHistoryByTokyoSitename = function() {
        //    	console.log('searchHistoryByTokyoSitename', $scope.selectedTokyoSite);
        // Reset hightlight selected row
        $scope.selectedTokyoRow = null;
        // Reset history detail
        $scope.historyDetail = { sendTime: '', MAX: { formattedSindo: '', siteName: '', lpgm: '' }, SITES: [] };
    };

    $scope.getHistoryByTokyoSitecode = function(index, hDay) {
        $scope.selectedTokyoRow = index;
        //    	console.log('getHistoryByTokyoSitecode', hDay, $scope.selectedTokyoSite);
        $scope.historyDetail = { sendTime: '', MAX: { formattedSindo: '', siteName: '', lpgm: '' }, SITES: [] };
        $scope.historyDetail.sendTime = hDay.SendTime;
        $scope.historyDetail.MAX.formattedSindo = hDay.formattedMaxSindo;
        $scope.historyDetail.MAX.siteName = $scope.selectedTokyoSite.name;
        $scope.historyDetail.MAX.lpgm = hDay.lpgm;
        $scope.historyDetail.SITES = [{ Name: $scope.selectedTokyoSite.name, formattedSindo: hDay.formattedMaxSindo }];
        $scope.historyCheckDate = false;
        $scope.historyCheckState = false;
        $scope.historyCheckSindo = false;
        $scope.historyCheckSite = true;
    };

    $scope.selectDamageInfo = function() {
        $('#damage li').addClass('damage_tab');
        var tableId = 'damage';
        window.cssFilters('#' + tableId + ' .table-responsive', '#' + tableId + ' .nav-pills');
    };

    $scope.selectPreventionInfo = function() {
    	$('#damage li').removeClass('damage_tab');
    	var tableId = 'damage';
    	window.cssFilters('#' + tableId + ' .table-responsive', '#' + tableId + ' .nav-pills');
    };

    $scope.onBuildingPeopleInfoChange = function (index, numberOfPeople) {
	    var selected = $.grep($scope.selectOptionPeople, function (e) {
	    	return e.desc.localeCompare(numberOfPeople) == 0;
	    });
	    var select = selected[0];
	    var buildings = $.grep($scope.buildings.detail, function (e) {
	    	return e.sBuildingId == index;
	    });
	    var building = buildings[0];
	    building.numberOfPeople = select.value;
    };

    $scope.onBuildingEnrollInfoChange = function (index, enroll) {
	    var selected = $.grep($scope.selectOptionEnroll, function (e) {
	    	return e.desc.localeCompare(enroll) == 0;
	    });
	    var select = selected[0];
	    var buildings = $.grep($scope.buildings.detail, function (e) {
	      return e.sBuildingId == index;
	    });
	    var building = buildings[0];
	    building.enrollment = select.value;
    };
    $scope.disableEdit = function (index) {
	    var disable = true;
	    if (index == 1 && $scope.isUserA) disable = false;
	    else if ($scope.isUserB) disable = false;
	    return disable;
    };
    
    $scope.saveBuildingInfo = function (index) {
	    var buildings = $.grep($scope.buildings.detail, function (e) {
	      return e.sBuildingId == index;
	    });
	    var building = buildings[0];
	    var data = {
	      id: building.sBuildingId,
	      acceptance: building.acceptanceObj.value,
	      electricity: building.electricityObj.value,
	      waterSupply: building.waterObj.value,
	      communication: building.communicationObj.value,
	      toilet: building.toiletObj.value,
	      townGas: building.gasObj.value,
	      fire: building.fireObj.value,
	      numberOfPeople: "" + building.numberOfPeople,
	      enrollment: "" + building.enrollment
	    };
	    
	    HomeService.saveBuildingRow(data).done(function (data) {
	    	if (data.err != null) {
	    		$scope.mes = data.err;
	    		$scope.showError();
	    	} else {
	    		$scope.mes = "Save successful";
	    		$scope.showSuccess();
	    		// TODO: reload data to update originBuildingStr???
	    		var wCb = function(buildingInfo) {
//	    			console.log('update building OK', buildingInfo);
		    		$scope.buildings = buildingInfo;
		    		// reset originBuildingStr
		    		_setupOriginBuilding($scope.buildings.detail);
		    		_setupBuildingPeopleEnrollment();
		    		$scope.$apply();
		    		var tableId = 'building';
		    		window.cssFilters('#' + tableId + ' .table-responsive', '#' + tableId + ' .nav-pills');
		    	};

		    	HomeService.getBuildingStatus(wCb);
	    	}
	    });
    };

    $scope.onMedicalInfoChange = function (index) {
	    // var medical = $scope.medicals[index];
	    var medicals = $.grep($scope.medicals.detail, function (e) {
	      return e.sMedicalId == index;
	    });
	    var medical = medicals[0];
	    //check acceptance
	    if (medical.Medical_acceptance.desc.localeCompare("受入不可") == 0) {
	      medical.Medical_acceptance.status = "red";
	      medical.Medical_acceptance.value = 2;
	    }
	    else if (medical.Medical_acceptance.desc.localeCompare("受入可") == 0) {
	      medical.Medical_acceptance.status = "";
	      medical.Medical_acceptance.value = 1;
	    }
	    else {
	      medical.Medical_acceptance.status = "red";
	      medical.Medical_acceptance.value = 0;
	    }
    };
    $scope.saveMedicalInfo = function (index) {
	    var medicals = $.grep($scope.medicals.detail, function (e) {
	    	return e.sMedicalId == index;
	    });
	    var medical = medicals[0];
	    var data = {
	    	id: medical.sMedicalId, 
	    	acceptance: medical.Medical_acceptance.value
	    };
	    
	    HomeService.saveMedicalRow(data).done(function (data) {
	    	if (data.err != null) {
	    		$scope.mes = data.err;
		    	$scope.showError();
	    	} else {
	    		$scope.mes = "Save successful";
	    		$scope.showSuccess();
	    		// Reload medical
	    		var wCb = function(medicalInfo) {
//	    			console.log('update medical OK', medicalInfo);
	    			$scope.medicals = medicalInfo;
	    			// reset originMedicalStr
	    			_setupOriginMedical($scope.medicals.detail);
		    		$scope.$apply();
		    		var tableId = 'medical';
		    		window.cssFilters('#' + tableId + ' .table-responsive', '#' + tableId + ' .nav-pills');
		    	};

		    	HomeService.getMedicalStatus(wCb);
	    	}
	    });
    };
    
    $scope.saveDofficeInfo = function (dOf) {
    	if (!dOf.isoOpenTime || !dOf.dofficePhone1 || !dOf.dofficePhone2
    			|| (dOf.isoOpenTime.getTime() == (new Date(dOf.originData.isoOpenTime)).getTime() 
    					&& dOf.dofficePhone1 == dOf.originData.dofficePhone1
    					&& dOf.dofficePhone2 == dOf.originData.dofficePhone2)) {
    		console.log('no change');
    		return;
    	}
    	
    	var newDoffice = {dofficeId: dOf.dofficeId, dofficeOpentime: dOf.isoOpenTime
    			, dofficePhone1: dOf.dofficePhone1, dofficePhone2: dOf.dofficePhone2};
	    
	    HomeService.saveDofficeRow(newDoffice).done(function (data) {
//	    	console.log('saveDofficeRow', data);
	    	if (!data.isSuccessful) {
	    		$scope.mes = 'Can NOT save. Please try again!';
		    	$scope.showError();
	    	} else {
	    		$scope.mes = "Save successful";
	    		// update originData
	    		dOf.originData.isoOpenTime = dOf.isoOpenTime;
	    		dOf.originData.dofficePhone1 = dOf.dofficePhone1;
	    		dOf.originData.dofficePhone2 = dOf.dofficePhone2;
	    		$scope.showSuccess();
	    		// Reload DOffice
	    		var wCb = function(dOfficeInfo) {
//	    			console.log('update medical OK', medicalInfo);
	    			$scope.dOfficeInfo = dOfficeInfo;
				    // Format dofficeOpentime for display
					_setupDofficeInfo();
		    		$scope.$apply();
		    		var tableId = 'medical';
		    		window.cssFilters('#' + tableId + ' .table-responsive', '#' + tableId + ' .nav-pills');
		    	};

		    	HomeService.getDOfficeInfo(wCb);
	    	}
	    });
    };
    
    $scope.showSuccess = function () {
	    notifications.showSuccess({
	    	message: $scope.mes,
	    	hideDelay: 2000, //ms
	    	hide: true //bool
	    });
    };
    
    $scope.showError = function () {
	    notifications.showError({
	    	message: $scope.mes,
	    	hideDelay: 2000, //ms
	    	hide: true //bool
	    });
    };
    
    $scope.selectDamageInfo = function() {
        $('#damage li').addClass('damage_tab');
    };

    $scope.selectPreventionInfo = function() {
        $('#damage li').removeClass('damage_tab');
    };

    $scope.updateAll = function() {
//    	console.log('updateAll', $scope.curTab);
    	var failCb = function() {
    		$scope.mes = 'Can not update. Please try again!';
    		$scope.showError();
		};
    	switch ($scope.curTab) {
    	case '鉄道運行': // update trains info
    		$scope.reloadTrainsStatus();
			break;
    	case '一時滞在施設': // update building info
    		var winCb = function(buildingInfo) {
//    			console.log('update building OK', buildingInfo);
	    		$scope.buildings = buildingInfo;
	    		// reset originBuildingStr
	    		_setupOriginBuilding($scope.buildings.detail);
	    		_setupBuildingPeopleEnrollment();
	    		$scope.hasWestBuildingUpdate = false;
	    		$scope.hasEastBuildingUpdate = false;
	    		$scope.hasSouthBuildingUpdate = false;
	    		$scope.hasBuildingUpdate = false;
	    		$scope.$apply();
	    		var tableId = 'building';
	    		window.cssFilters('#' + tableId + ' .table-responsive', '#' + tableId + ' .nav-pills');
	    	};

	    	HomeService.getBuildingStatus(winCb, failCb);
			break;
    	case '医療機関': // update medical info
    		var winCb = function(medicalInfo) {
//    			console.log('update medical OK', medicalInfo);
    			$scope.medicals = medicalInfo;
    			// reset originMedicalStr
    			_setupOriginMedical($scope.medicals.detail);
    			$scope.hasWestMedicalUpdate = false;
    			$scope.hasEastMedicalUpdate = false;
    			$scope.hasSouthMedicalUpdate = false;
	    		$scope.hasMedicalUpdate = false;
	    		$scope.$apply();
	    		var tableId = 'medical';
	    		window.cssFilters('#' + tableId + ' .table-responsive', '#' + tableId + ' .nav-pills');
	    	};

	    	HomeService.getMedicalStatus(winCb, failCb);
			break;
    	case '被害情報': // update damage info
			var winCb = function(data) {
//				console.log('update damage OK', data);
				$scope.Statistic = data.statistic;
	    		// reset originStatisticStr
				originStatisticStr = JSON.stringify($scope.Statistic);
				$scope.hasTrainStatisticUpdate = false;
				$scope.hasMedicalStatisticUpdate = false;
				
				$scope.buildings = data.info.buildings;
	    		// reset originBuildingStr
	    		_setupOriginBuilding($scope.buildings.detail);
				$scope.hasWestBuildingUpdate = false;
	    		$scope.hasEastBuildingUpdate = false;
	    		$scope.hasSouthBuildingUpdate = false;
	    		$scope.hasBuildingUpdate = false;
				// Get value for Number_of_people and Enrollment columns
				_setupBuildingPeopleEnrollment();
				
				$scope.dOfficeInfo = data.info.dOfficeInfo;
			    // Format dofficeOpentime for display
				_setupDofficeInfo();
				$scope.hasPreventionUpdate = false;
				$scope.$apply();
			};

			HomeService.getStatistic(winCb, failCb);
			break;

		default:
			break;
		}
    };
});

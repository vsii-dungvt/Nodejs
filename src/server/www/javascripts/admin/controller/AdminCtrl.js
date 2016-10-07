'use strict';

var SINDOS = [4, 5, 6, 7];
angular.module('sip.admin').controller('AdminCtrl', function($scope, notifications, AdminService, TokyoSitecodes) {
//	console.log('[AdminCtrl]');
	$scope.sendTime = new Date('2016-10-08 14:56');
	$scope.Sindos = SINDOS;
	$scope.selectedPhase = 9999; // NO disaster
	$scope.phases = [{id: 1, value: 0, imageSrc: "/sip/public/images/phase1_off.png"}
	                 , {id: 2, value: 0, imageSrc: "/sip/public/images/phase2_off.png"}
	                 , {id: 3, value: 0, imageSrc: "/sip/public/images/phase3_off.png"}
	                 , {id: 4, value: 0, imageSrc: "/sip/public/images/phase4_off.png"}];
	
	$scope.tokyoSitecodes = TokyoSitecodes;
    $scope.curLocation = Messages.topLocation;// + ' > ' + Messages.homeLocation + ' (鉄道運行)';
    var isHistoryDate = function() {
    	return (new Date($scope.sendTime)).getTime() < (new Date()).setHours(0, 0, 0, 0);
    };
    
    $scope.getSendTimeClasses = function() {
    	return isHistoryDate()? 'form_setting_admin dateMinInvalid': 'form_setting_admin';
    };
    
    $scope.changeDemoPhase = function(bousaiId) {
//    	console.log('changeMainStatus', bousaiId);
    	var valueSelectedPhase = $scope.phases[bousaiId].value;
    	$scope.phases.forEach(function(phase, i) {
    		phase.value = 0;
    		phase.imageSrc = '/sip/public/images/phase' + (i+1) + '_off.png';
    	});

    	if (!valueSelectedPhase) {
    		$scope.selectedPhase = bousaiId + 1; // selected phase
    		$scope.phases[bousaiId].value = 1;
    		$scope.phases[bousaiId].imageSrc = '/sip/public/images/phase' + (bousaiId+1) + '.png';
    	}
    };
    /**
	 * Add new bousai demo.
	 */
	$scope.addDemo = function() {
		console.log('addDemo', $scope.sendTime);
		var demoData = {};
		demoData.phaseId = $scope.selectedPhase;
		
		demoData.sendTime = $scope.sendTime; // yyyy.MM.dd, HH.mm
		demoData.siteCode = $scope.selectedSitecode;
		demoData.maxSindo = $scope.selectedMaxSindo;
		demoData.shinjukuSindo = $scope.selectedShinjukuSindo;
		demoData.lpgm = $scope.selectedLPGM; // LomgPeriodGroundMotionIntensityScale

		var winCb = function() {
			console.log('Add Demo successfully.');
			notifications.showSuccess({
		    	message: 'Add Demo successfully',
		    	hideDelay: 1500, //ms
		    	hide: true //bool
		    });
		};
		var failCb = function() {
			notifications.showError({
		    	message: 'Can not add Demo. Please try again',
		    	hideDelay: 1500, //ms
		    	hide: true //bool
		    });
		};
		
		if (!$scope.sendTime || isHistoryDate() || !$scope.selectedSitecode || !$scope.selectedMaxSindo 
				|| !$scope.selectedShinjukuSindo || !$scope.selectedLPGM) {
			
			notifications.showError({
		    	message: 'Please enter valid value  for all field',
		    	hideDelay: 1000, //ms
		    	hide: true //bool
		    });
			return;
		}
			
		// Call service to update
		AdminService.addBousaiDemo(demoData, winCb, failCb);
	};
});
'use strict';

var app = angular.module('login');
app.controller('LoginCtrl', function ($scope, LoginService, notifications) {
	$scope.error = "";
	$scope.doLogin = function () {
	    LoginService.doLogin($scope.username, $scope.password).done(function (res) {
	    	if (res.error) {
		        $scope.$apply(function () {
		        	$scope.error = res.error;
		        	$scope.showError();
		        });
	    	} else if (res.url) {
	    		window.location.href = res.url;
	    	}
	    });
	};

	$scope.showError = function () {
	    notifications.showError({
	    	message: $scope.error,
	    	hideDelay: 1500, //ms
	    	hide: true //bool
	    });
	};
});

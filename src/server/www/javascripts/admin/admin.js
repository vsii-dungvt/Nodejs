'use strict';
// start ng app
angular.element(document).ready(function() {
	angular.bootstrap(document.getElementById('admin'), ['sip.admin']);
});
// create ng app
angular.module('sip.admin', ['ngAnimate', 'ui.bootstrap', 'ngNotificationsBar']);

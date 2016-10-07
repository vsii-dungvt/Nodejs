'use strict';
// start ng app
angular.element(document).ready(function() {
      angular.bootstrap(document.getElementById('home'), ['sip.home']);
});
// create ng app
angular.module('sip.home', ['ngAnimate', 'ui.bootstrap','ngNotificationsBar']);

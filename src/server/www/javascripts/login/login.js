'use strict';
// start ng app
angular.element(document).ready(function() {
  angular.bootstrap(document.getElementById('login'), ['login']);
});
// create ng app
angular.module('login', ['ngAnimate', 'ui.bootstrap','ngNotificationsBar']);

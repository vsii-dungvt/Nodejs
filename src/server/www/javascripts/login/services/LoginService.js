'use strict';

var LOGIN_SERVICE = '/sip/authen/service';
angular.module('login').factory('LoginService', function() {
	return {
	    doLogin: function (username, password) {
	    	return $.ajax({
		        url: LOGIN_SERVICE,
		        method: 'POST',
		        data:{username: username, password: password}
	    	});
	    },
	}
});

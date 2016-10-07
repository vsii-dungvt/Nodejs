'use strict';
var NEW_BOUSAI_SERVICES_PATH = '/sip/newbousai/service';

angular.module('sip.admin').factory('AdminService', function(){
	return {
		addBousaiDemo: function(demoData, winCb, failCb) {
			console.log('addBousaiDemo', demoData);
			return $.ajax({
				url: NEW_BOUSAI_SERVICES_PATH,
				method: 'POST',
				data: demoData,
				success: function(data, textStatus, jqXHR) {
					if (winCb)
						winCb();
				},
				error: function(jqXHR, textStatus, e) {
					if (failCb)
						failCb();
				}
			});
		}
	};
});

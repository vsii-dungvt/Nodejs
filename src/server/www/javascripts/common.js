'use strict';
// Set this to handle the session get expired
$.ajaxSetup({
	global : true
});
$(document).ajaxError(function(jq, xhr, data, msg) {
	if (xhr.status == 401) {
		console.log('-----------------------------UNAUTHORIZED----------------------------');
        alert('Your session has been timed out');
        location.href = '/sip';
	} else {
		console.log('-----------------------------SYSTEM ISSUE----------------------------');
		console.log('AJAX-FAIL', xhr.status, data.type, data.url);
	}
}).ajaxSuccess(function(jq, xhr, data, msg) {
	//console.log('-----------------------------AJAX-SUCC----------------------------');
	//console.log('AJAX-SUCC', data.type, data.url);
});
// jQuery plugins
(function($) {
    $.fn.hasScrollBar = function() {
        return (this.get(0) && this.get(0).scrollHeight > this.get(0).clientHeight) || (this.get(1) && this.get(1).scrollHeight > this.get(1).clientHeight);
    }
})(jQuery);

window.cssFilters = function(idScroll, idFilters) {
//	console.log('cssFilters', idFilters);
	var _cssFilters = function () {
		if ($(idScroll).hasScrollBar()) {
//			console.log('cssFilters hasScrollBar', idFilters);
			$(idFilters).addClass('filters_padding');
	    } else {
	    	$(idFilters).removeClass('filters_padding');
	    }
	};
	
	setTimeout(_cssFilters, 300);
};
/**
 * Check if 2 JSONs object are equal.
 */
window.jsonEqual = function(a, b) {
	return JSON.stringify(a) === JSON.stringify(b);
};

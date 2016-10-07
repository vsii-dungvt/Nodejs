/**
 * Helpers for Handlebars template engine.
 */
'use strict';

var exports = module.exports = {};

/**
 * Increase input value by one. 
 */
exports.inc = function(value, options) {
	return parseInt(value) + 1;
};

exports.toJSON = function(object, options) {
	return JSON.stringify(object);
};

exports['raw-helper'] = function(options) {
	return options.fn();
};

exports.mIf = function(v1, operator, v2, options) {
	switch (operator) {
	case '==':
		return (v1 == v2) ? options.fn(this) : options.inverse(this);
	case '===':
		return (v1 === v2) ? options.fn(this) : options.inverse(this);
	case '<':
		return (v1 < v2) ? options.fn(this) : options.inverse(this);
	case '<=':
		return (v1 <= v2) ? options.fn(this) : options.inverse(this);
	case '>':
		return (v1 > v2) ? options.fn(this) : options.inverse(this);
	case '>=':
		return (v1 >= v2) ? options.fn(this) : options.inverse(this);
	case '&&':
		return (v1 && v2) ? options.fn(this) : options.inverse(this);
	case '||':
		return (v1 || v2) ? options.fn(this) : options.inverse(this);
	default:
		return options.inverse(this);
	}
};

exports.eachMainStatus = function(context, options) {
	var ret = "";

	for (var i = 0, j = context.length; i < j; i++) {
		ret = ret + options.fn(context[i]);
	}

	return ret;
};

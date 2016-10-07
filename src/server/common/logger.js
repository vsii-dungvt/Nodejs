'use strict';
var log4js = require('log4js');

module.exports = function() {
	log4js.configure({
		appenders: [
		  { type: 'console' },
		  {
			 type: 'dateFile', 
			 filename: 'logs/access.log', 
			 pattern: "_yyyy-MM-dd.log",
			 alwaysIncludePattern: true,
			 maxLogSize: 1024*1024,
		     backups: 20,
			 category: 'access' 
		  },{
		     type: 'dateFile', 
		     filename: 'logs/console.log',
		     pattern: "_yyyy-MM-dd.log",
		     alwaysIncludePattern: true,
		     maxLogSize: 1024*1024,
		     backups: 20,
		     category: 'console' 
		  }
		],
		replaceConsole: true
	});
	return log4js;
};

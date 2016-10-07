'use strict';
var cluster = require('cluster');
var os = require('os');
var logger = require('./common/logger');
var debug = require('debug');

var log = debug('sip:info');

process.env.IS_CLUSTER = true;

var isProd = (process.env.NODE_ENV === 'production');
var enableLog4j = process.env.ENABLE_LOG4J||true;
//Apply the log4j if any
if (enableLog4j) {
	var logLevel = (process.env.LOG_LEVEL || 'INFO');
	//FATAL, ERROR, WARN, INFO, DEBUG, TRACE
	var logjs = logger();
	//write access logs into access.log
	//var logAccess = logjs.getLogger('access');
	//app.use(logjs.connectLogger(logAccess, {level: 'auto'}));
	// write console logs into log
	var logConsole = logjs.getLogger('console');
	logConsole.setLevel(logLevel);
}
/**
 * Get workers size
 */
var workers = process.env.WORKERS || os.cpus().length;
// default size of workers must be greater or equal 4
if (isProd) {
	if (workers < 4) {
		workers = 4;
	}
} else {
	workers = 1;
}

/**
 * Create a new cluster for master or slaves
 */
if (cluster.isMaster) {
	log('Start cluster with %s workers', workers);
	for (var i = 0; i < workers; i++) {
		var worker = cluster.fork().process;
		log('Worker %s started.', worker.pid);
	}
	cluster.on('exit', function(worker) {
		log('Worker %s died', worker.process.pid);
		if (isProd) {
			log('Worker restart...', worker.process.pid);
			cluster.fork();
		}
	});
} else {
	log('Create HTTP server');
	require('./app');
}//if-else cluster

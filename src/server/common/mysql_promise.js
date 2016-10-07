'use strict';

var Promise = require('bluebird');
var using = Promise.using;
var mysqlConfig = require('../datasources.json');
var mysql = require("mysql");
Promise.promisifyAll(mysql);
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);
var mConfig = Object.assign({multipleStatements: true}, mysqlConfig.SIP);
var pool  = mysql.createPool(mConfig);
var exports = module.exports = {};

function getSqlConnection() {
	return pool.getConnectionAsync().disposer(function(connection) {
        connection.release();
    });
}

exports.singleQuery = function (sql, values) {
    return using(getSqlConnection(), function (connection) {
      return connection.queryAsync({
        sql: sql
//        , values: values
        // nestTables: true,
        // typeCast: false,
        // timeout: 10000
      });
    });
};

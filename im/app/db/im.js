var mysql = require('mysql'),
    config = require('../conf/mysql'),
    _pool = null;

_pool = mysql.createPool(config.mysql);

exports.query = function (sql, values, callback) {

    _pool.query(sql, values, callback);

};

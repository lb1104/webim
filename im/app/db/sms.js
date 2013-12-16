var mysql = require('mysql'),
    config = require('../conf/mysql'),
    _pool = null;

_pool = mysql.createPool(config.smsmysql);

exports.query = function (sql, values, callback) {

    _pool.query(sql, values, callback);

};

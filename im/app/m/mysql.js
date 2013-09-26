var mysql = require('mysql'),
    date = require('dateformatter'),
    config = require('../conf/config');

var connection;

function handleError(err){
    if(err){
        console.log(date.format('Y-m-d H:i:s'),'mysql:',err);
        if(err.code==='PROTOCOL_CONNECTION_LOST'){
            connect();
        }
    }
}

function connect(){

    connection = mysql.createConnection(config.mysql);
    connection.connect(handleError);
    connection.on('error',handleError);
    console.log(date.format('Y-m-d H:i:s'),'mysql connect');

}

function disconnect(){

    connection.end();
    //connection.disconnect();
    console.log(date.format('Y-m-d H:i:s'),'mysql disconnect');

}

//connect();
exports.connect = connect;
exports.disconnect = disconnect;

exports.query = function(sql,args,cb){
    connection.query(sql,args,cb);
};

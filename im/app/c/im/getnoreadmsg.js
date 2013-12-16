var mysql = require('../../db/im'),
    tool = require('../../lib/tool'),
    im = require('./init');

exports.index = function (socket, data, callback) {
    console.time('getnoreadmsgtime');
    if (typeof(callback) != 'function') {
        return;
    }

    if (!socket.sessid) {
        callback({result: 'error', msg: '没有sessid!'});
        return;
    }

    console.log('im getnoreadmsg:', data, socket.user);

    mysql.query(
        "select j.*,db.fcname,db.ztitle,db.msg,db.fujian " +
            "from oa_im_msg_js j JOIN oa_im_msg db on j.sid=db.id " +
            "where j.fc=0 and j.jsid=? ", [socket.user.uid], return_rows);
    
    function return_rows(err, result) {
        if (err) {
            //throw err;
            console.log(err);
            callback({result: 'error', msg: '数据读取失败!'});
            return;
        }

        callback({result: 'ok', total: result.length, rows: result});

        console.timeEnd('getnoreadmsgtime');
    }

};
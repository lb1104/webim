var mysql = require('../../db/im'),
    tool = require('../../lib/tool'),
    im = require('./init');

exports.index = function (socket, data, callback) {
    console.time('getnewlymsgtime');
    if (typeof(callback) != 'function') {
        return;
    }

    if (!socket.sessid) {
        callback({result: 'error', msg: '没有sessid!'});
        return;
    }

    console.log('im getnewlymsg:', data, socket.user);

    mysql.query("update oa_im_msg_js set fc=1 where fc=0 and jsid=? and fcid=?", [socket.user.uid, data.id], update_js);

    function update_js(err, dresult) {
        if (err) {
            //throw err;
            console.log(err);
            callback({result: 'error', msg: '数据更新失败!'});
            return;
        }

        console.log(dresult);

        var limit = 10;
        if (dresult.changedRows > 10) {
            limit = dresult.changedRows;
        }

        mysql.query(
            "select j.*,db.fcname,db.ztitle,db.msg,db.fujian " +
                "from oa_im_msg_js j JOIN oa_im_msg db on j.sid=db.id " +
                "where (j.jsid=? and j.fcid=?) or (j.fcid=? and j.jsid=?) order by j.id desc limit 0,?",
            [socket.user.uid, data.id, socket.user.uid, data.id, limit], return_rows
        );

        function return_rows(err, result) {
            if (err) {
                //throw err;
                console.log(err);
                callback({result: 'error', msg: '数据查询失败!'});
                return;
            }

            callback({result: 'ok', total: result.length, rows: result});

            console.timeEnd('getnewlymsgtime');
        }

    }


};
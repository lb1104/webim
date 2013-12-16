var mysql = require('../../db/im'),
    tool = require('../../lib/tool'),
    _ = require('underscore'),
    im = require('./init');

exports.index = function (socket, data, callback) {

    console.time('sendmsgtime');

    if (typeof(callback) != 'function') {
        return;
    }
    if (!socket.sessid) {
        callback({result: 'error', msg: '没有sessid!'});
        return;
    }

    if (!data.id) {
        callback({result: 'error', msg: '没有用户id!'});
        return;
    }

    if (!data.msg) {
        callback({result: 'error', msg: '没有msg!'});
        return;
    }

    console.log(' im sendmsg:', data, socket.user);

    var fcdata = {
        fcid: socket.user.uid,
        fcname: socket.user.realname,
        ztitle: socket.user.realname + " - " + tool.datetime(),
        msg: data.msg,
        fujian: data.fujian
    };

    fcdata.fujian = JSON.stringify(fcdata.fujian);


    mysql.query("insert into oa_im_msg set ?", fcdata, insert_db);

    function insert_db(err, result) {

        if (err) {
            //throw err;
            console.log(err);
            callback({result: 'error', msg: '数据存储失败!'});
            return;
        }
        console.log(result);

        fcdata.sid = fcdata.id = result.insertId;

        var ids = data.id.toString().split(',');

        ids = _.uniq(ids);//去重

        ids.forEach(foreachids);//多个id循环

        function foreachids(id) {

            if (!id) {
                return;
            }
            var jsdata = {
                sid: fcdata.id,
                fcid: fcdata.fcid,
                fc: 0,
                fctime: tool.time(),
                jsid: id
            };

            mysql.query("insert into oa_im_msg_js set ?", jsdata, insert_oa_im_msg_js);

            function insert_oa_im_msg_js(err, jsresult) {
                if (err) {
                    //throw err;
                    console.log(err);
                    callback({result: 'error', msg: '数据存储失败!'});
                    return;
                }

                console.log(jsresult);

                im.uidemit(
                    jsdata.jsid,
                    'receivemsg',
                    { result: 'ok', fcdata: fcdata}
                );

                console.timeEnd('sendmsgtime');
            }
        }

        callback({result: 'ok', fcdata: fcdata});

    }

};
var mysql = require('../../db/im'),
    tool = require('../../lib/tool'),
    im = require('./init');

exports.index = function (socket, data, callback) {

    if (typeof(callback) != 'function') {
        callback({result: 'error', msg: 'no find callback!'});
        return;
    }

    if (!data.sessid) {
        callback({result: 'error', msg: 'IM没有sessid!'});
        return;
    }

    console.time('login');

    function login_callback(err, result) {

        if (err) {
            //throw err;
            console.log(err);
            callback({result: 'error', msg: '数据读取失败!'});
            return;
        }

        if (!result[0] || !result[0].user_data) {
            callback({result: 'error', msg: '登陆IM失败!查询不到该用户数据!'});
            return;
        }

        var session = tool.phpunserialize(result[0].user_data);

        if (!session || !session.user_id) {
            callback({result: 'error', msg: '登陆IM失败!查询不到该用户id!'});
            return;
        }

        var user = {
            uid: session.user_id,
            socketid: socket.id,
            sessid: data.sessid,
            username: session.user_uname,
            realname: session.user_realname
        };
        session = null;

        socket.sessid = data.sessid;
        socket.user = user;

        var oldrow = im.Users[user.uid] || {};
        if (tool.isEmptyObject(oldrow)) {
            socket.broadcast.emit('otherlogin', { result: 'ok', uid: user.uid});
        }
        oldrow[socket.id] = user;
        im.Users[user.uid] = oldrow;

        callback({result: 'ok', user: user});

        console.log(user, ' login');
        console.timeEnd('login');

    }

    mysql.query("select * from ci_sessions where session_id=? limit 1", [data.sessid], login_callback);

};
var mysql = require('../../m/mysql'),
    date = require('dateformatter'),
    phpunserialize = require('php-unserialize');


var Users = {};     //{uid1:{smsid1:user,smsid2:user},uid2:{smsid3:user,smsid4:user}}
var Smsusers = {};  //{smsid1:user,smsid2:user}


function isEmptyObject(obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
}


module.exports = function (socket, im, io) {

    /**
     * 登陆
     */
    socket.on('login', function (data, callback) {

        if (typeof(callback) != 'function') {
            return;
        }

        if (isEmptyObject(Smsusers)) {
            mysql.connect();
        }

        if (!data.smsid) {
            callback({result: 'error', msg: 'IM没有smsid!'});
            return;
        }

        mysql.query(
            "select * from ci_sessions where session_id=? limit 1",
            [data.smsid],
            function (err, result) {
                if (err) {
                    //throw err;
                } else {

                    if (result[0]) {
                        var row = result[0];
                        if (row.user_data) {

                            var session = phpunserialize.unserialize(row.user_data);

                            if (session) {
                                if (session.user_id) {
                                    var user = {
                                        user_id: session.user_id,
                                        user_uname: session.user_uname,
                                        user_realname: session.user_realname
                                    };
                                    socket.smsid = data.smsid;
                                    socket.user = user;
                                    user.id = socket.id;

                                    Smsusers[socket.smsid] = user;
                                    var oldrow = Users[user.user_id] || {};
                                    if (isEmptyObject(oldrow)) {
                                        socket.broadcast.emit('otherlogin', { result: 'ok', uid: user.user_id});
                                    }
                                    oldrow[socket.smsid] = user;
                                    Users[user.user_id] = oldrow;

                                    callback({result: 'ok', user: user});
                                    console.log(date.format('Y-m-d H:i:s'),user.user_id,' login');
                                    return false;
                                }

                            }
                        }

                    }

                }

                callback({result: 'error', msg: '登陆IM失败!'});

                return true;
            }
        );


    });


    /**
     * 返回在线人员
     */
    socket.on('getonline', function (data, callback) {

        if (typeof(callback) != 'function') {
            return;
        }

        if (socket.smsid && Smsusers[socket.smsid]) {

            callback({result: 'ok', users: Users});

        } else {
            callback({result: 'error', msg: 'getonline没有smsid!'});
        }

    });

    /**
     * 发送刷新请求
     */
    socket.on('allf5', function () {
        socket.broadcast.emit('f5');
    });

    /**
     * 断开连接
     */
    socket.on('disconnect', function () {

        if (socket.smsid && Smsusers[socket.smsid]) {

            var uid = Smsusers[socket.smsid].user_id;

            console.log(date.format('Y-m-d H:i:s'),socket.id + '/' + socket.smsid + '/' + uid + " disconnect.");

            delete Users[uid][socket.smsid];

            if (isEmptyObject(Users[uid])) {
                delete Users[uid];
                socket.broadcast.emit('otherexit', { result: 'ok', uid: uid});
            }
            delete Smsusers[socket.smsid];

            if (isEmptyObject(Smsusers)) {
                mysql.disconnect();
            }

        } else {
            console.log(date.format('Y-m-d H:i:s'),socket.id + " disconnect.");
        }


    });

    /**
     * 发送信息
     */
    socket.on('sendmsg', function (data, callback) {

        if (typeof(callback) != 'function') {
            return;
        }
        if (!socket.smsid || !Smsusers[socket.smsid]) {
            callback({result: 'error', msg: 'sendmsg没有smsid或没有登陆!'});
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

        var uid = Smsusers[socket.smsid].user_id;
        var user_realname = Smsusers[socket.smsid].user_realname;

        var ztitle = user_realname + " - "
            + date.format('Y-m-d H:i:s');

        var fcdata = {
            //jsid: data.id,
            fcid: uid,
            fcname: user_realname,
            ztitle: ztitle,
            msg: data.msg,
            fujian: data.fujian
        };

        fcdata.fujian = JSON.stringify(fcdata.fujian);

        mysql.query("insert into oa_im_msg set ?", fcdata, function (err, result) {
            if (err) {
                //throw err;
            } else {
                fcdata.id = result.insertId;

                var ids = data.id.toString().split(',');
                var jsdata = {
                    sid: fcdata.id,
                    fcid: uid,
                    fc: 0,
                    fctime: Math.floor(new Date().getTime() / 1000)
                };

                for (var i in ids) {
                    jsdata.jsid = ids[i];

                    mysql.query("insert into oa_im_msg_js set ?", jsdata, function (err, result) {
                        if (err) {
                            //throw err;
                        } else {

                            if (Users[jsdata.jsid]) {

                                for (var j in Users[jsdata.jsid]) {
                                    var dsocket = im.sockets[Users[jsdata.jsid][j]['id']];
                                    if (dsocket) {
                                        dsocket.emit('receivemsg', {
                                            result: 'ok', fcdata: fcdata
                                        });
                                    }
                                }
                            }

                        }

                    });
                }
                callback({result: 'ok', fcdata: fcdata});
            }

        });


    });


    /**
     * 阅读消息
     */
    socket.on('readfc', function (data) {

        if (!socket.smsid || !Smsusers[socket.smsid]) {
            return;
        }

        var uid = Smsusers[socket.smsid].user_id;

        if (data && data.id) {
            mysql.query(
                "update oa_im_msg_js set fc=1 where fc=0 and sid=? and jsid=?",
                [data.id, uid],
                function (err, result) {
                    //if(err) throw err;
                }
            );
        }

    });

    /**
     * 取得所有未读消息
     */
    socket.on('getfc0msg', function (data, callback) {

        if (typeof(callback) != 'function') {
            return;
        }
        if (!socket.smsid || !Smsusers[socket.smsid]) {
            callback({result: 'error', msg: 'getfc0msg没有smsid或没有登陆!'});
            return;
        }

        var uid = Smsusers[socket.smsid].user_id;

        mysql.query(
            "select j.*,m.fcname,m.ztitle,m.msg,m.fujian " +
                "from oa_im_msg_js j JOIN oa_im_msg m on j.sid=m.id " +
                "where j.fc=0 and j.jsid=? ",
            [uid],
            function (err, result) {
                if (err) {
                    //throw err;
                } else {

                    if (result) {
                        callback({result: 'ok', total: result.length, list: result});
                    } else {
                        callback({result: 'ok', total: 0});
                    }

                }

            }
        );


    });


    /**
     * 取得某用户发出的未读消息
     */
    socket.on('getfc0msg_fcid', function (data, callback) {

        if (typeof(callback) != 'function') {
            return;
        }

        if (!socket.smsid || !Smsusers[socket.smsid]) {
            callback({result: 'error', msg: 'getfc0msg_fcid没有smsid或没有登陆!'});
            return;
        }

        if (!data.id) {
            callback({result: 'error', msg: '没有uid!'});
        }

        var uid = Smsusers[socket.smsid].user_id;

        mysql.query(
            "select j.*,m.fcname,m.ztitle,m.msg,m.fujian " +
                "from oa_im_msg_js j JOIN oa_im_msg m on j.sid=m.id " +
                "where j.fc=0 and j.jsid=? and j.fcid=?",
            [uid, data.id],
            function (err, result) {
                if (err) {
                    //throw err;
                } else {

                    callback({result: 'ok', total: result.length, list: result});

                    mysql.query(
                        "update oa_im_msg_js set fc=1 where fc=0 and jsid=? and fcid=?",
                        [uid, data.id],
                        function (err, result) {
                            //if(err) throw err;
                        }
                    );
                }

            }
        );


    });

};
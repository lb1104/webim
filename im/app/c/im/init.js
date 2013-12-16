var io = false;

var Users = {};//{uid:{socketid:user}}

exports.Users = Users;

exports.init = function (server, app) {

    io = require('socket.io').listen(server);

    //io.set('log level', 1);//将socket.io中的debug信息关闭

    //io.set('transports', ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);

    io.sockets.on('connection', function (socket) {

        console.log(socket.id + " connect.");

        /**
         * 登陆
         */
        socket.on('login', function (data, callback) {
            console.log(socket.id + ' login');
            require('./login').index(socket, data, callback);
        });

        /**
         * 返回在线人员
         */
        socket.on('getonline', function (data, callback) {
            require('./getonline').index(socket, data, callback);
        });

        /**
         * 断开连接
         */
        socket.on('disconnect', function () {
            require('./disconnect').index(socket);
        });

        /**
         * 发送信息
         */
        socket.on('sendmsg', function (data, callback) {
            require('./sendmsg').index(socket, data, callback);
        });

        /**
         * 阅读消息
         */
        socket.on('readfc', function (data, callback) {
            require('./readfc').index(socket, data, callback);
        });


        /**
         * 取得所有未读消息
         */
        socket.on('getnoreadmsg', function (data, callback) {
            require('./getnoreadmsg').index(socket, data, callback);
        });

        /**
         * 取得某人发给自己的最近所有消息,未读消息置为已读,10条未读记录,不足则加上已读的.
         */
        socket.on('getnewlymsg', function (data, callback) {
            require('./getnewlymsg').index(socket, data, callback);
        });

    });

    console.log('   socket.io listening on express ' + app.get('port'));

};


exports.allemit = function (event, data) {

    if (io) {
        console.log('all emit:', event, data);
        io.sockets.emit(event, data);
    }

};

exports.sockets = function () {
    if (io) {
        return io.sockets.sockets;
    } else {
        return false;
    }
};

exports.idemit = function (socketid, event, data) {
    if (io) {
        console.log('idemit:', socketid, event, data);
        if (io.sockets.sockets[socketid]) {
            io.sockets.sockets[socketid].emit(event, data);
        }

    }
};

exports.uidemit = function (uid, event, data) {
    if (io) {
        console.log('uidemit:', uid, event, data);
        if (Users[uid]) {
            for (var socketid in Users[uid]) {
                if (socketid) {
                    io.sockets.sockets[socketid].emit(event, data);
                }
            }
        }
    }
};
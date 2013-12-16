var mysql = require('../../db/im'),
    tool = require('../../lib/tool'),
    im = require('./init');

exports.index = function (socket, data, callback) {

    if (typeof(callback) != 'function') {
        return;
    }

    if (!socket.sessid) {
        callback({result: 'error', msg: '没有sessid!'});
        return;
    }

    console.log('im getonline:', data, socket.user);

    callback({result: 'ok', onlineusers: Object.keys(im.Users)});

};
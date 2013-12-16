var mysql = require('../../db/im'),
    tool = require('../../lib/tool'),
    im = require('./init');

exports.index = function (socket) {

    console.log(socket.id + " disconnect.");

    if (socket.sessid && socket.user && im.Users[socket.user.uid] && im.Users[socket.user.uid][socket.id]) {

        console.log(socket.sessid + '/' + socket.user.uid + " exit.");

        delete im.Users[socket.user.uid][socket.id];

        console.log(im.Users[socket.user.uid]);

        if (tool.isEmptyObject(im.Users[socket.user.uid])) {
            console.log('otherexit:' + socket.user.uid);
            delete im.Users[socket.user.uid];
            socket.broadcast.emit('otherexit', { result: 'ok', uid: socket.user.uid});
        }

    }

    //socket=null;
};
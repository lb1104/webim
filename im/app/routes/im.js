var im = require('../c/im/init');

module.exports = function (app) {

    app.get('/im', function (req, res) {
        res.send('1');
    });

    app.get('/avatar/:uid', function (req, res) {

        var uid = req.param('uid');
        res.sendfile(global.static + '/images/avatar.jpg');

    });


    app.all('/allf5', function (req, res) {
        im.allemit('f5');
        res.send('all send f5 event');
    });

    app.all('/allusers', function (req, res) {

        var data = [], sockets = im.sockets();
        for (var sid in sockets) {
            data.push({socket: {id: sid, user: sockets[sid].user}});
        }

        res.send({
            socket_length: data.length, sockets: data,
            users_length: Object.keys(im.Users).length, users: im.Users
        });

    });


};
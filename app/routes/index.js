module.exports = function (app, io) {

    app.get('/', function (req, res) {

        res.send('1');

    });

    app.get('/i', function (req, res) {

        res.send('1');

    });

    app.get('/avatar/:uid', function (req, res) {

        var uid = req.param('uid');
        res.sendfile(global.static + '/images/avatar.jpg');
        //res.sendfile(__dirname + '/../../static/images/avatar.jpg');

    });

    app.all('/msgbox/:id', function (req, res) {
        var id = req.param('id');
        res.render('msgbox', {id: id});
    });

    app.all('/allf5', function (req, res) {

        for (var socket in io.of('/im').sockets) {
            io.of('/im').sockets[socket].emit('f5');
        }
        res.send('all send f5 event');
    });

    app.all('/allusers', function (req, res) {
        var data={};
        for (var socket in io.of('/im').sockets) {
            data[socket]=io.of('/im').sockets[socket].user;
        }
        //console.log(io.of('/im').sockets);
        res.send(JSON.stringify(data));
    });


    app.all('/sendmsg', function (req, res) {
        //var data={};
        console.log(req.param);
            //io.of('/im').sockets[socket].user;
        //}
        //console.log(io.of('/im').sockets);
        res.send('1');
    });


};
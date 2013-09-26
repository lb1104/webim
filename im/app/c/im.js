var date = require('dateformatter');
module.exports = function (app, io) {

    io.set('transports',['websocket','flashsocket','htmlfile','xhr-polling','jsonp-polling']);

    var im = io
        .of('/im')
        .on('connection', function (socket) {

            console.log(date.format('Y-m-d H:i:s'),socket.id + " connect.");

            require('./im/init')(socket, im,io);

        });

    console.log('   im listening on port ' + app.get('port'));

};
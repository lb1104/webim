var spawn = require('child_process').spawn,
    date = require('dateformatter'),
    fs = require('fs'),
    server = null;

function startServer() {
    console.log('start app');
    server = spawn('node', [__dirname + '/app.js']);
    server.stdout.on('data', function (data) {
        log(data.toString());
    });
    server.stderr.on('data', function (data) {
        log(data.toString());
    });
    server.on('close', function (code, signal) {
        log('app exit code:' + code + "\n");
        server.kill(signal);
        restart();
    });
    server.on('error', function (code, signal) {
        log('app error code:' + code + "\n");
        server.kill(signal);
        restart();
    });

}

function restart() {
    console.log('restart app on after 5s');
    setTimeout(startServer, 5000);
}

function log(data) {
    data = 'LOG(' + date.format('Y-m-d H:i:s') + ')\n' + data;
    console.log(data);
    fs.appendFile(
        __dirname + '/log/info' + date.format('Y-m-d') + '.log',
        data,
        function (err) {
            if (err) {
                console.log(err);
            }
        });
}

startServer();
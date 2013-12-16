var express = require('express'),
    routes = require('../routes'),
    config = require('../conf/config'),
    app = express(),
    server = require('http').createServer(app);

exports.start = function () {

    app.set('port', config.wwwport);

    app.disable('x-powered-by');

    app.set('views', global.apppath + 'v');

    app.engine('html', require('ejs').renderFile);

    app.set('view engine', 'html');

    app.use(express.favicon());
    app.use(express.compress());

    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(express.cookieParser());
    app.use(express.session({ secret: config.secret}));

    app.use('/static', express.static(global.static,{maxAge:60*60*1000}));

     app.use(express.logger('dev'));

    // development only
    if ('development' == app.get('env')) {
        app.use(express.errorHandler({dumpExceptions:true}));
    }

    routes(app);//路由

    /*web socket.io*/
    require('./im/init').init(server, app);

    server.listen(app.get('port'), function () {
        console.log('   express listening on port ' + app.get('port'));
    });

};
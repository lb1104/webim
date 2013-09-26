global.apppath = './app/';
global.static = __dirname + '/static';

var express = require('express'),
    routes = require(global.apppath + 'routes'),
    config = require(global.apppath + 'conf/config'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

app.disable('x-powered-by');

app.set('port', '8081');

app.set('views', global.apppath + 'v');

app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');


app.use(express.favicon());
app.use(express.compress());

app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(express.cookieParser());
app.use(express.session({ secret: config.secret}));

app.use('/static', express.static(global.static));

app.use(express.logger('dev'));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

routes(app,io);//路由

server.listen(app.get('port'), function () {
    console.log('   express listening on port ' + app.get('port'));
});


io.set('log level', 1);//将socket.io中的debug信息关闭

require(global.apppath + 'c/im')(app, io);

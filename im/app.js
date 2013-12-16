global.apppath = __dirname+'/app/';
global.static = __dirname + '/static';
/*web*/
require(global.apppath + 'c/web').start();

/*监听端口 net socket*/
require(global.apppath + 'c/socket').start();

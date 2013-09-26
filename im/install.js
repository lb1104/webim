var wincmd = require('node-windows');
var Service = require('node-windows').Service;

var svc = new Service({
	  name:'OAIMServer',
	  description: 'OA IM Server',
	  script: __dirname+'/run.js'
	});

function install(){

	if(svc.exists){
		console.log('server repeat.');
	}

	svc.on('install',function(){
	  svc.start();
	  console.log('install complete.');
	});

	svc.install();
}

function uninstall(){

	svc.on('uninstall',function(){
	  console.log('Uninstall complete.');
	  console.log('The service exists: ',svc.exists);
	});

	svc.uninstall();

}

wincmd.isAdminUser(function(isAdmin){

  if (isAdmin) {
    console.log('The user has administrative privileges.');

    process.stdin.resume();
	process.stdin.setEncoding('utf8');

	console.log("输入1/2回车\n 	1:install\n 	2:unstall\n 	0:exit");

	process.stdin.on('data', function(chunk) {

		process.stdin.emit('end',{chunk:chunk});

	});

	process.stdin.on('end', function(data) {
		//console.log('end'+data.chunk+"/a");
		if(data.chunk=='1\r\n'){
			install();
		}
		if(data.chunk=='2\r\n'){
			uninstall();
		}
	});


  } else {
    console.log('NOT AN ADMIN');
  }

});
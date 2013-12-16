var wincmd = require('node-windows'),
    readline = require('readline'),
    rl = readline.createInterface(process.stdin, process.stdout),
    Service = require('node-windows').Service;

var svc = new Service({
    name: 'OAIMServer',
    description: 'OA IM Server',
    script: __dirname + '/run.js'
});

function install() {

    if (svc.exists) {
        console.log('The service is installed.');
        rl.prompt();
        return;
    }
    console.log('service installing....');
    svc.on('install', function () {
        svc.start();
        console.log('install success.');
        rl.prompt();
    });

    svc.install();
}

function uninstall() {
    if (!svc.exists) {
        console.log('The service is not installed.');
        rl.prompt();
        return;
    }
    console.log('service uninstalling....');
    svc.on('uninstall', function () {
        console.log('Uninstall success.');
        console.log('The service exists: ', svc.exists);
        rl.prompt();
    });

    svc.uninstall();

}

function exists() {
    if (!svc.exists) {
        console.log('The service is not installed.');
    } else {
        console.log('The service is installed.');
    }
    rl.prompt();
}

wincmd.isAdminUser(function (isAdmin) {

    if (isAdmin) {
        console.log(svc.name + " installation");
        console.log("   \033[36m Please enter number or string!\033[0m");
        console.log("    \033[31m 1 \033[0m:  install server");
        console.log("    \033[32m 2 \033[0m:  uninstall server");
        console.log("    \033[33m 3 \033[0m:  exists server");
        console.log("    \033[35m 0 \033[0m:  exit");

        rl.setPrompt('> ');
        rl.prompt();

        rl.on('line',function (line) {
            switch (line.trim()) {
                case "1":
                case "i":
                case "install":
                    install();
                    break;
                case "2":
                case "u":
                case "uninstall":
                    uninstall();
                    break;
                case "3":
                case "exists":
                    exists();
                    break;
                case "0":
                case "quit":
                case "exit":
                    rl.close();
                    break;
                default:
                    console.log("not find " + line.trim());
                    rl.prompt();
                    break;
            }

        }).on('close', function () {
                process.exit(0);
            });

    } else {
        console.log('NOT AN ADMIN');
    }

});
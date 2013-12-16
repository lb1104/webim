var net = require('net'),
    iconv = require('iconv-lite'),
    config = require('../conf/sensor'),
    sensor = require('./sensor'),
    server = false;


exports.start = function () {

    server = net.createServer(function (conn) {
        conn.idname = conn.remoteAddress + ':' + conn.remotePort;
        console.log('CONNECTED: ' + conn.idname);

        conn.on('data', function (buf) {

            console.log('---');
            console.log(conn.idname);
            //console.time('100-socket-msg');
            console.log('socket data:');
            console.log(buf);

            if (buf[0] == 0x7b) {//第一个字符为 {
                var msg = iconv.decode(buf, 'gbk');
                console.log('socket msg:', msg);
                setTimeout(sensor.addBySocket, 0, msg, conn.remoteAddress);//处理数据
            }

            for (var i = 0; i < buf.length;) {

                if (buf[i] == 0x25 && buf[i + 1] == 0x25 && buf[i + 2] == 0x24) {
                    var json = {};
                    switch (buf[i + 3]) {
                        case 0x01:
                            conn.write('LOK');
                            break;
                        case 0x02:

                            json.类型 = '甲烷';
                            json.id = buf.readUInt8(i + 4);
                            json.id = json.id << 8 | buf.readUInt8(i + 5);
                            json.ppm = buf.readUInt8(i + 6);
                            json.ppm = json.ppm << 8 | buf.readUInt8(i + 7);

                            console.log(json);
                            setTimeout(sensor.addBySocket, 0, json, conn.remoteAddress);//处理数据

                            break;
                        case 0x03:

                            json.类型 = '井盖';
                            json.id = buf.readUInt8(i + 4);
                            json.id = json.id << 8 | buf.readUInt8(i + 5);
                            json.状态 = buf.readUInt8(i + 6);
                            json.状态 = json.状态 << 8 | buf.readUInt8(i + 7);

                            console.log(json);

                            setTimeout(sensor.addBySocket, 0, json, conn.remoteAddress);//处理数据

                            break;
                        case 0x04:

                            json.类型 = '边坡';
                            var isx = buf.readUInt8(i + 4);
                            json.id = buf.readUInt8(i + 5);
                            var xy = buf.readInt8(i + 6);
                            xy = xy << 8 | buf.readInt8(i + 7);
                            if (isx == 1) {
                                json.x = xy;
                            } else {
                                json.y = xy;
                            }

                            console.log(json);

                            setTimeout(sensor.addBySocket, 0, json, conn.remoteAddress);//处理数据

                            break;
                        default:
                            break;
                    }
                    i += 8;
                } else {
                    i++;
                }

            }

            //25 25 24 04 01 01 01 01

            //conn.end();

            //console.timeEnd('100-socket-msg');
            console.log('---');
        });

        conn.on('close', function () {
            console.log('DISCONNECTED', conn.idname);
        });

        //conn.write('welcome to socket');
        //conn.pipe(sock);

    });

    server.listen(config.netport, function () {
        console.log("   net socket listen on port " + config.netport);
    });


};
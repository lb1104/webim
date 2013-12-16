var mysql = require('../db/im'),
    config = require('../conf/sensor'),
    tool = require('../lib/tool');

var sensordata = [];


function add(body, ip) {

    if (body) {
        var data = {};
        if (typeof body == 'object') {
            data = body;
            data.str = JSON.stringify(body);
            data.jsonok = true;
        } else {
            body = body.replace(/}\s*}/, "}");
            try {
                data = JSON.parse(body);
                if (typeof data != 'object') {
                    data = {jsonok: false};
                } else {
                    data.jsonok = true;
                }

            } catch (e) {
                //console.error(e);
                data = {jsonok: false};
            }
            data.str = body;
        }

        data.date = tool.datetime();
        sensordata.unshift(data);
        if (data.jsonok && data.id > 0) {
            savetodb(data, ip);
        }

        console.log('sensor add');
        console.log(data);

        require('./im/init').emit('newsensor');

    }

}

function savetodb(data, ip) {

    var sdata = {
        ty: data['类型'],
        cid: data.id,
        cidtrue: 0,
        state: '',
        value: data['ppm'] || 0,
        x: 0,
        y: 0,
        dateline: tool.time(),
        ip: ip,
        bjstate: 0,
        bjtime: tool.datetime()
    };

    //{'id':1,'类型':'边坡','x':30}
    //{'id':1,'类型':'边坡','y':60}


    if (!config.sensor[sdata.ty] || !sdata.cid) {
        return;
    }

    mysql.query("select * from " + config.sensor[sdata.ty].table + " where newest=1 and cid=? limit 1", [data.id], function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        if (result[0]) {
            sdata.cidtrue = 1;
        } else {
            console.log('no find row in ' + config.sensor[sdata.ty].table);
        }
        var sensorrow = result[0];

        if (sdata.ty == '井盖') {
            if (data['状态'] == '0') {
                sdata.bjstate = 1;
                sdata.state = '打开';
            } else {
                sdata.state = '关闭';
            }
        }

        if (sdata.ty == '甲烷') {
            if (parseInt(sdata.value) > 10000) {
                sdata.bjstate = 1;
            }
        }

        if (sdata.ty == '边坡') {

            if (data['x'] != 0) {
                sdata.x = data['x'];
            }
            if (data['y'] != 0) {
                sdata.y = data['y'];
            }

        }


        mysql.query("insert into sensor set ?", sdata, function (err, result2) {
            if (err) {
                console.log(err);
                return;
            }
            sdata.id = result2.insertId;
            if (sdata.cidtrue == 1 && sdata.bjstate == 1) {
                sendsms(sensorrow);
                console.log('报警', sdata);
                require('./im/init').emit('newsensorbj', sdata);
            }

            if (sdata.ty == '边坡') {
                require('./im/init').emit('newsensorbianpo', sdata);
            }

        });


    });

}

function sendsms(sensorrow) {

//      var smsmysql = require('../db/sms');
//    if(sensorrow.sms_send=="1"){
//        smsmysql.query("insert into t_sms set ?",[],function(err){
//            if (err) {
//                console.log(err);return;
//            }
//        });
//    }

}

exports.addPost = function (req, res) {

    if (req.body) {

        add(JSON.stringify(req.body), req.ip);

    }

};

exports.addBySocket = function (body, ip) {

    add(body, ip);

};

exports.list = function (req, res) {

    var page = parseInt(req.body.page) || 1;
    var rows = parseInt(req.body.rows) || 10;
    var offset = (page - 1) * rows;

    var result = {total: 0, rows: []};

    result.total = sensordata.length;

    result.rows = sensordata.slice(offset, offset + rows);

    res.send(result);
};

exports.sensorlist = function (req, res) {

    console.time('sensorlisttime');
    var page = parseInt(req.body.page) || 1;
    var rows = parseInt(req.body.rows) || 10;
    var id = req.body.id;
    var ty = req.body.ty;
    var offset = (page - 1) * rows;

    var rtresult = {total: 0, rows: []};

    var where = ' where 1=1 ';
    if (id) {
        where += " and cid='" + id + "'";
    }
    if (ty == 'all') {
        ty = '';
    }
    if (ty) {
        where += " and ty='" + ty + "'";
    }

    mysql.query("select count(*) as count from sensor " + where, function (err, result) {

        if (err) {
            throw err;
        }
        console.log(result);
        rtresult.total = result[0].count;

        mysql.query("select * from sensor " + where + " order by id desc limit ?,?", [offset, rows], function (err, result) {
            if (err) {
                throw err;
            }

            rtresult.rows = result;
            res.send(rtresult);
            console.timeEnd('sensorlisttime');
        });

    });


};

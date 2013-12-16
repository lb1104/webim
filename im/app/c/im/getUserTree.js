var mysql = require('../../db/im'),
    tool = require('../../lib/tool'),
    im = require('./init');

exports.index = function (socket, data, callback) {

    if (typeof(callback) != 'function') {
        return;
    }

    if (!socket.sessid) {
        callback({result: 'error', msg: '没有sessid!'});
        return;
    }

    console.log('im getUserTree:', data, socket.user);

    console.time('getusertree');

    mysql.query(
        "select * from (SELECT 1,id,pid,name,name as text,sort FROM department order by sort asc) as temp1 union all select * from (select 2,id,department,realname,position,sort from user order by sort desc,id asc) as temp2",
        function (err, result) {
            if (err) {
                //throw err;
                console.log(err);
                callback({result: 'error', msg: 'department user数据读取失败!'});
                return;
            }

            var tarr = genTree(result);

            callback({result: 'ok', tree: tarr.tree, totaluser: tarr.totaluser, users: tarr.users, onlineusers: im.Users});
            console.timeEnd('getusertree');

        });


};

function genTree(list) {

    var totaluser = 0, users = [];
    var temptree = [], tree = [], items = [];
    for (var i in list) {
        if (list[i][1] == 1) {
            var trow = {
                id: 'z' + list[i].id,
                did: list[i].id,
                fid: list[i].pid,
                text: list[i].text,
                iconCls: 'im_role',
                children: []
            };
            temptree[list[i].id] = trow;

            items.push(trow);

        }
        if (list[i][1] == 2) {

            if (list[i].pid) {
                var pidarr = list[i].pid.toString().split(',');
                for (var p in pidarr) {
                    if (temptree[pidarr[p]]) {
                        temptree[pidarr[p]]['children'].push({
                            id: list[i].id,
                            text: list[i].name + ' / ' + list[i].text,
                            iconCls: 'im_user'
                        });

                    }

                }

            }

            if (!users[list[i].id]) {
                totaluser++;
            }

            users[list[i].id] = list[i];

        }
    }

    for (var j in items) {
        if (temptree[items[j].fid]) {
            temptree[items[j].fid]['children'].push(temptree[items[j].did]);
        } else {
            tree.push(temptree[items[j].did]);
        }
    }
    temptree = null;
    items = null;

    return {tree: tree, totaluser: totaluser, users: users};
}
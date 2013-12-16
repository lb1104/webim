var mysql = require('../../db/im'),
    tool = require('../../lib/tool'),
    im = require('./init');

exports.index = function (socket, data, callback) {
    console.time('readfctime');

    if (!socket.sessid) {
        callback({result: 'error', msg: '没有sessid!'});
        return;
    }

    console.log('im readfc:', data, socket.user);

    if (data && data.fcid && socket.user.uid) {

        mysql.query(
            "update oa_im_msg_js set fc=1 where fc=0 and fcid=? and jsid=?",
            [data.fcid, socket.user.uid],
            function (err, result) {
                if (err) {
                    // throw err;
                    console.log(err);
                }
                console.timeEnd('readfctime');
            }
        );
    }
};
jQuery.fn.extend({
    ctrlSubmit: function (fn, thisObj) {
        var obj = thisObj || this;
        var stat = false;
        return this.each(function () {
            $(this).keydown(function (event) {

                if (event.keyCode == 17) {
                    stat = true;
                    setTimeout(function () {
                        stat = false;
                    }, 300);
                }
                if (event.keyCode == 13 && (stat || event.ctrlKey)) {
                    fn.call(obj, event);
                }

            });
        });
    }
});


var WebIm = (function () {

    var Config = { smshost: '', sessid: '', user: false, online: 0, users: [], tree: [], xymove: 0 };

    var result = {};

    var socket;

    var nowSendIds = {};//已打开窗口的id集合 {id:realname}

    /**
     * 初始化载入
     * @param data
     */
    result.init = function (data) { //{smshost,sessid}

        $('body').append('<div id="webimwbox"><div id="webimmin"></div><div id="webimbox"></div></div>');

        var top = ($(document).height() - $('#webimwbox').height()) / 2;
        if (top < 100) {
            top = 100;
        }
        $('#webimwbox').css('top', top);

        $('#webimmin').click(function () {
            $('#webimbox').toggle();
        });

        Config.smshost = data.smshost;
        Config.sessid = data.sessid;

        socket = io.connect(Config.smshost);

        socket.on('connect', function () {
            console.log('connect');
            login();
        });

        socket.on('reconnecting', function () {
            console.log('reconnecting');
            $('#webimbox').html('<div id="webim_dis">连接丢失,正在等待连接...' +
                '<br/><a href="javascript:WebIm.reconnect()">点击重连接</a>'+
                '<br/>长时间未连接请<a href="javascript:window.location.reload();">刷新页面</a></div>');
        });

        socket.on('connect_failed', function () {
            console.log('connect_failed');
            socket.socket.reconnect();
        });

        socket.on('disconnect', function () {
            Config.user = false;

        });

        socket.on('f5', socket_on_f5);//刷新

        socket.on('otherlogin', socket_on_otherlogin);//其他人登录通知

        socket.on('otherexit', socket_on_otherexit);//其他人退出通知

        socket.on('receivemsg', socket_on_receivemsg);//接收到消息

        socket.on('newsensorbj', socket_on_newsensorbj);//传感器报警

        socket.on('newsensorbianpo', socket_on_newsensorbianpo);//边坡传感器时时数据

        WebIm.notify('', false, true);//chrome 通知

        result.socket=socket;
        result.config=Config;

    };

    result.reconnect=function(){
        socket.socket.reconnect();
    };

    /**
     * 登录
     */
    function login() {

        Config.online = 0;
        Config.user = false;

        function init_login(data) {

            if (data.result != 'ok') {
                $('#webimbox').text(data.msg);
                console.log(data);
                return;
            }

            Config.user = data.user;

            $('#webimbox').html('<div id="webim_top"></div><div id="webim_lxr"></div><div id="webim_tree"></div>');

            $('#webim_top').html('<dl><dt>' + avatar(Config.user.uid) + '</dt>' +
                '<dd>昵称：' + Config.user.realname + '</dd>' +
                '<dd>UID：' + Config.user.username + '</dd>' +
                '<dd>' +
                '<a id="webim_qun_msg" href="javascript:WebIm.showmsgboxq()">[群发消息]</a> ' +
                '<a class="blue" href="javascript:WebIm.showmsgbox(4)">[联系管理员]</a> ' +
                '</dd>' +
                '</dl>');

            userinit();

        }

        socket.emit('login', { sessid: Config.sessid }, init_login);
    }

    /**
     * 头像
     * @param uid
     * @returns {string}
     */
    function avatar(uid) {
        uid = uid || '0';
        return '<img src="' + Config.smshost + '/avatar/' + uid + '" />';
    }

    /**
     * 设置公用变量
     * @param data
     */
    function settreeusers(data) {

        Config.tree = data.tree;
        Config.users = data.allusers;

    }

    /**
     * 载入人员结构树
     */
    function userinit() {

        if (!Config.user) {
            console.log('no find user!');
            return;
        }

        function init_tree(data) {
            console.log('inittree:', data);
            if (data && data.tree) {

                $('#webim_lxr').html('联系人(<span id="webim_lxr_num">0</span>/' + data.totaluser + ')');

                settreeusers(data);

                $('#webim_tree').tree({
                    lines: true,
                    fit: true,
                    data: data.tree,
                    onDblClick: function (node) {

                        if (node.iconCls == 'im_user') {
                            showmsgbox(node.id);
                        }

                    }, onLoadSuccess: function () {
                        getonline();
                    }
                });

                ImMsgTip.show();//查询消息

            } else {
                $('#webimbox').text('获取用户列表失败');
                console.log(data);
            }

        }

        $.post(URL + '/im/userTree', init_tree, 'json');

    }

    /**
     * 获取在线用户
     */
    function getonline() {

        if (!Config.user) {
            console.log('no find user!');
            return;
        }

        function init_getonline(data) {
            console.log('getonline', data);
            if (data && data.result == 'ok') {
                Config.online = 0;
                for (var i in data.onlineusers) {
                    setonline(data.onlineusers[i], true);
                }
            }
        }

        socket.emit('getonline', {}, init_getonline);

    }

    /**
     * 设置用户在线不在线
     * @param id
     * @param online
     */
    function setonline(id, online) {
        if (!id) {
            return;
        }

        if ($('#webim_tree div.tree-node[node-id=' + id + ']')[0]) {

            $('#webim_tree div.tree-node[node-id=' + id + ']').each(function () {
                if (online) {
                    $(this).find('span.tree-icon').removeClass('im_user').addClass('im_user_online');
                    $(this).find('span:last').addClass('im_online_text');
                } else {
                    $(this).find('span.tree-icon').removeClass('im_user_online').addClass('im_user');
                    $(this).find('span:last').removeClass('im_online_text');
                }

            });
            if (online) {
                Config.online = parseInt(Config.online) * 1 + 1;
            } else {
                Config.online = parseInt(Config.online) * 1 - 1;
            }

            $('#webim_lxr_num').text(Config.online);

        }
    }

    ////////////////////////////////////////////

    /**
     * 其他人登录通知
     * @param data
     */
    function socket_on_otherlogin(data) {
        console.log('otherlogin', data);
        if (!Config.user) {
            console.log('no find user!');
            return;
        }
        if (data) {
            if (data.result == 'ok') {
                setonline(data.uid, true);
            }
        }
    }


    /**
     * 其他人退出通知
     * @param data
     */
    function socket_on_otherexit(data) {
        console.log('otherexit', data);
        if (!Config.user) {
            console.log('no find user!');
            return;
        }
        if (data) {
            if (data.result == 'ok') {
                setonline(data.uid, false);
            }
        }
    }

    /**
     * 刷新页面
     */
    function socket_on_f5() {
        if (!Config.user) {
            console.log('no find user!');
            return;
        }
        $.messager.show({
            title: '提示',
            msg: '<p style="line-height: 2;">接收到刷新请求! 服务端可能修改了程序!<br/>' +
                '<a class="red" href="window.location.reload();">点击这里刷新以便载入新功能!</a><br/> </p>',
            style: {
                right: '', bottom: '', top: $(document).scrollTop()
            },
            timeout: 0
        });

    }

    /**
     * 接收到消息
     * @param data
     */
    function socket_on_receivemsg(data) {
        if (!Config.user) {
            console.log('no find user!');
            return;
        }
        console.log('receivemsg', data);
        if (data) {
            if (data.result == 'ok') {

                ImMessage.open();

                if (nowSendIds[data.fcdata.fcid]) {//已打开聊天窗口

                    writemsg(data.fcdata);

                    $('#im_msgbox_' + data.fcdata.fcid).unbind('click')
                        .bind('click',
                        {fcid: data.fcdata.fcid},
                        function (event) {
                            ImMsgTip.delone(event.data.fcid);
                            socket.emit('readfc', {fcid: event.data.fcid});//点击窗口后标记已读
                            $('#im_msgbox_' + data.fcdata.fcid).unbind('click');
                        });
                }

                ImMsgTip.show();//查询消息

//                window.focus();
//                window.blur();
            }
        }
    }

    /**
     * 报警信息
     * @param data
     */
    function socket_on_newsensorbj(data) {

        console.log('newsensorbj', data);
        if (!Config.user) {
            console.log('no find user!');
            return;
        }
        if (Sensor) {
            Sensor.opentip(data);
        }

    }

    /**
     * 边坡数据传输
     * @param data
     */
    function socket_on_newsensorbianpo(data) {
        console.log('newsensorbianpo', data);
        if (!Config.user) {
            console.log('no find user!');
            return;
        }
        if (Bianpo) {
            Bianpo.addsernsor(data);
        }
    }

    ////////////////////////////////////////////

    /**
     * 转义代码中<>'"
     * @param str
     * @returns {string}
     */
    function html_escape(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            .replace(/\n/g, '<br/>');
    }

    /**
     * 处理消息中的代码和附件链接
     * @param data
     * @returns {*}
     */
    function clmsg(data) {

        var msg = html_escape(data.msg);
        try {
            data.fujian = $.parseJSON(data.fujian);
        } catch (e) {
        }

        if (data.fujian && data.fujian.name && data.fujian.url) {
            msg += '( <a href="' + data.fujian.url + '" ' +
                ((data.fujian.blank) ? 'target="_blank"' : '') + '>' +
                data.fujian.name + '</a> )';
        }
        return msg;
    }

    /**
     * 输出消息
     * @param data json {fcid,ztitle,msg,fujian:{name,url,blank}}
     * @param m bool 我发出的消息
     */
    function writemsg(data, m) {
        var id = m ? m : data.fcid;
        console.log('writemsg:', data);

        if (!$('#webim_msg_body_' + id)[0]) {
            return;
        }
        if ($('#webim_msg_li_' + data.sid)[0]) {
            return;
        }

        m = m ? 'm' : 't';

        var msg = clmsg(data);

        $('<li id="webim_msg_li_' + data.sid + '"><p></p><div class="info"></div></li>')
            .appendTo('#webim_msg_body_' + id);

        $('#webim_msg_li_' + data.sid).find('p:eq(0)').addClass(m).html(data.ztitle);

        $('#webim_msg_li_' + data.sid).find('div.info:last').html(msg);

        $('#webim_msg_body_' + id).parent().scrollTop($('#webim_msg_body_' + id).parent()[0].scrollHeight);

    }

    /**
     * 发送消息
     * @param id string '1,2'
     * @param msg
     * @param fujian json|void {name,url,blank:true}
     * @returns {boolean}
     */
    function sendmsg(id, msg, fujian) {
        if (!id) {
            $.messager.alert('提示', '没有接收人id!');
            return false;
        }
        if (msg == '') {
            $.messager.alert('提示', '请输入消息内容!');
            return false;
        }
        var sendids = '';

        if (id == 'qun') {
            var cnode = $('#webim_sel_quser').tree('getChecked');
            var ids = [];
            if (cnode) {
                for (var i in cnode) {
                    if (cnode[i]) {
                        if (cnode[i].iconCls == 'im_user' && cnode[i].id > 0) {
                            ids.push(cnode[i].id);
                        }
                    }
                }
            }

            if (ids.length == 0) {
                $.messager.alert('提示', '请选择要群发的人员!');
                return;
            }
            sendids = ids.join(',');

        } else {
            sendids = id;
        }

        fujian = fujian || '';
        console.log('sendmsg:', sendids, msg, fujian);
        socket.emit('sendmsg', {id: sendids, msg: msg, fujian: fujian}, function (data) {
            if (data) {
                if (data.fcdata) {
                    writemsg(data.fcdata, id);
                } else {
                    console.log('sendmsg_error:', data);
                }

            }

        });

    }

    result.sendmsg = sendmsg;//外置接口直接发送消息

    ///////////////////////////////////////

    /**
     * 读取某人的全部未读消息或最近的10条消息
     * @param id
     */
    function shownewlymsg(id) {

        function init_newlymsg(data) {
            console.log('getnewlymsg:', data);
            if (data && data.result == 'ok') {
                if (data.total > 0) {
                    data.rows.reverse();
                    for (var i in data.rows) {
                        if (Config.user.uid == data.rows[i].fcid) {
                            writemsg(data.rows[i], id);
                        } else {
                            writemsg(data.rows[i]);
                        }
                    }
                }
            }
        }

        socket.emit('getnewlymsg', {id: id}, init_newlymsg);

    }

    result.showmsgbox = showmsgbox;

    /**
     * 打开交谈窗口
     * @param id
     */
    function showmsgbox(id) {

        if (!Config.users[id]) {
            return;
        }

        if ($('#im_msgbox_' + id)[0]) {
            $('#im_msgbox_' + id).window('open');
            return;
        }

        var text = Config.users[id].realname + ' / ' + Config.users[id].position;

        nowSendIds[id] = Config.users[id].realname;

        $.window({
            winId: 'im_msgbox_' + id,
            title: '与 ' + text + ' 交谈',
            width: 600, height: 500,
            left: ($(document).width() - 600) / 2 + Config.xymove,
            top: ($(document).height() - 500) / 2 + Config.xymove,
            contents: '<div data-options="fit:true" class="webim_msgbox easyui-layout" id="webim_msgbox_' + id + '">' +
                '<div data-options="region:\'center\'">' +
                '<ul class="webim_msg_ul" id="webim_msg_body_' + id + '">' +
                //'<li>测试版本,仅能在线发送</li>' +
                '</ul></div>' +
                '<div data-options="region:\'south\',split:true" style="height:140px;">' +
                '<table width="100%"><tr><td colspan="3">' +
                '<textarea class="webim_msg" id="webim_msg_text_' + id + '"></textarea>' +
                '</td></tr>' +
                '<tr><td>' +
                '<input class="upFile" type="file" id="upFile' + id + '" name="upFile' + id + '" />' +
                '<a class="im_btn">发送文件</a>' +
                '<a id="webim_msg_history_' + id + '" class="im_btn">历史消息</a>' +
                '</td>' +
                '<td>按Ctrl+Enter键发送消息</td>' +
                '<td align="right">' +
                '<a class="im_btn" id="webim_msg_close_' + id + '">关闭</a>' +
                '<a class="im_btn" id="webim_msg_send_' + id + '" title="按Ctrl+Enter键发送消息">发送</a>' +
                '</td></tr></table></div>' +
                '</div>',
            onComplete: function () {
                Config.xymove += 20;
                if (Config.xymove > 100) {
                    Config.xymove = 0;
                }

                shownewlymsg(id);//显示最近的所有消息.

                $('#webim_msg_close_' + id).click(function () {
                    $('#im_msgbox_' + id).window('close');
                });

                fujianclick(id);

                $('#webim_msg_send_' + id).click(function () {
                    var msg = $('#webim_msg_text_' + id).val();
                    sendmsg(id, msg);
                    $('#webim_msg_text_' + id).val('').focus();
                });

                $('#webim_msg_history_' + id).click(function () {
                    openhistory(id);
                });

                $('#webim_msg_text_' + id).ctrlSubmit(function () {
                    $('#webim_msg_send_' + id).click();
                }).focus();

            },
            onClose: function () {
                delete nowSendIds[id];
            }

        });

    }

    /**
     * 群发消息
     */
    result.showmsgboxq = function () {
        var id = 'qun';

        $.window({
            winId: 'im_msgbox_' + id,
            title: '群发消息',
            width: 600, height: 500,
            left: ($(document).width() - 600) / 2 + Config.xymove,
            top: ($(document).height() - 500) / 2 + Config.xymove,
            contents: '<div data-options="fit:true" class="webim_msgbox easyui-layout" id="webim_msgbox_' + id + '">' +
                '<div data-options="region:\'center\'">' +
                '<ul class="webim_msg_ul" id="webim_msg_body_' + id + '">' +
                '<li>这里只能发出信息</li>' +
                '</ul></div>' +
                '<div data-options="region:\'east\'" style="width:200px;">' +
                '<div id="webim_sel_quser"></div></div>' +
                '<div data-options="region:\'south\',split:true" style="height:140px;">' +
                '<table width="100%"><tr><td colspan="3">' +
                '<textarea class="webim_msg" id="webim_msg_text_' + id + '"></textarea>' +
                '</td></tr>' +
                '<tr><td>' +
                '<input class="upFile" type="file" id="upFile' + id + '" name="upFile' + id + '" />' +
                '<a class="im_btn">发送文件</a>' +
//                '<a id="webim_msg_history_' + id + '" class="im_btn">历史消息</a>' +
                '</td>' +
                '<td>按Ctrl+Enter键发送消息</td>' +
                '<td align="right">' +
                '<a class="im_btn" id="webim_msg_close_' + id + '">关闭</a>' +
                '<a class="im_btn" id="webim_msg_send_' + id + '" title="按Ctrl+Enter键发送消息">发送</a>' +
                '</td></tr></table></div>' +
                '</div>',
            onComplete: function () {

                Config.xymove += 25;

                $('#webim_msg_close_' + id).click(function () {
                    $('#im_msgbox_' + id).window('close');
                });

                $('#webim_sel_quser').tree({
                    lines: true,
                    fit: true,
                    data: Config.tree,
                    checkbox: true
                });

                fujianclick(id);

                $('#webim_msg_send_' + id).click(function () {
                    var msg = $('#webim_msg_text_' + id).val();
                    sendmsg(id, msg);
                    $('#webim_msg_text_' + id).val('').focus();
                });

                $('#webim_msg_text_' + id).ctrlSubmit(function () {
                    $('#webim_msg_send_' + id).click();
                }).focus();

            }

        });


    };

    /**
     * 上传文件按钮载入
     * @param id
     */
    function fujianclick(id) {

        document.getElementById('upFile' + id).onchange = function () {
            upfilefujian(id);
            $.messager.progress({
                title: '文件上传中', msg: '请稍候...',
                text: ''
            });
            fujianclick(id);
        };
    }

    /**
     * 上传文件并发出消息
     * @param id
     */
    function upfilefujian(id) {

        $.ajaxFileUpload({
            url: URL + '/im/ajaxfileupload',
            secureuri: false,
            fileElementId: 'upFile' + id,
            dataType: 'json',
            data: { fileElementName: 'upFile' + id },
            success: function (data, status) {
                $.messager.progress('close');

                if (data.filePath == undefined) {
                    $.messager.alert('提示', data.error);
                } else {
                    if (data.filePath == '') {
                        $.messager.alert('提示', '文件路径错误');
                    } else {

                        var row = {
                            url: data.filePath,
                            name: data.filename,
                            blank: true
                        };

                        sendmsg(id, '发送文件', row);

                    }
                }
            },
            error: function (data, status, e) {
                $.messager.progress('close');
                alert(e);
            }
        });

    }

    /**
     * 历史记录列表定义
     * @type {*|void}
     */
    var historyview = $.extend({}, $.fn.datagrid.defaults.view, {
        renderRow: function (target, fields, frozen, rowIndex, rowData) {
            var cc = [];
            cc.push('<td  colspan="' + fields.length + '"><ul class="webim_msg_ul"><li>');
            var m = 't';
            if (rowData.fcid == Config.user.uid) {
                m = 'm';
            }
            cc.push('<p class="' + m + '">' + rowData.ztitle + '</p>');
            var msg = clmsg(rowData);
            cc.push('<div class="info">' + msg + '</div>');
            cc.push('</li></ul></td>');
            return cc.join('');

        },
        onAfterRender: function () {
            $('#im_msg_historybox').find('table.datagrid-btable').width('100%');
        }
    });

    /**
     * 打开历史消息窗口
     * @param id
     */
    function openhistory(id) {

        $.window({
            winId: 'im_msg_historybox',
            title: '与 ' + Config.users[id].realname + ' 交谈的历史消息记录 ',
            width: 600, height: 500,
            left: ($(document).width() - 600) / 2 + Config.xymove,
            top: ($(document).height() - 500) / 2 + Config.xymove,
            contents: '<div id="im_msg_history_grid"></div>',
            maximizable: true,
            onComplete: function () {

                $('#im_msg_history_grid').datagrid({
                    view: historyview,
                    fit: true,
                    url: URL + '/im/history/' + id,
                    singleSelect: true,
                    pagination: true,
                    pageNumber: 1,
                    fitColumns: true
                });

            }
        });

    }


    /////////////////////////////////////////

    var ImMessage = {
        time: 0,
        title: document.title,
        timer: null,
        show: function () {
            var title = ImMessage.title.replace("［　　　］", "").replace("［新消息］", "");
            ImMessage.timer = setTimeout(function () {
                ImMessage.time++;
                ImMessage.show();
                if (ImMessage.time % 2 == 0) {
                    document.title = "［新消息］" + title;
                } else {
                    document.title = "［　　　］" + title;
                }
            }, 600);
            return [ImMessage.timer, ImMessage.title];
        },
        clear: function () {
            clearTimeout(ImMessage.timer);
            document.title = ImMessage.title;
        },
        open: function () {
            ImMessage.show();
            document.onclick = function () {
                ImMessage.clear();
            }
        }
    };

    ////////////////////////////

    result.notify = function (body, func, first) {

        if (window.webkitNotifications) {

            if (window.webkitNotifications.checkPermission() == 0) {

                if (first) {
                    return;
                }
                console.log('notify');
                body = body || 'chrome浏览器有新消息将弹出该信息!';
                var notification_test = window.webkitNotifications
                    .createNotification(Config.smshost + '/static/images/avatar.jpg', '通知', body);
                notification_test.display = function () {
                };
                notification_test.onerror = function () {
                };
                notification_test.onclose = function () {
                };
                notification_test.onclick = function () {
                    if (typeof(func) == 'function') {
                        func();
                    }
                    window.focus();
                    this.cancel();
                };
                notification_test.replaceId = 'OAWebIm';
                notification_test.show();

            } else {

                if (!first) {
                    return;
                }
                $.messager.confirm('开启桌面通知功能',
                    '点击确定后上方将出现允许或拒绝' +
                        '<br/>请点击<span class="blue">允许</span>' +
                        '<br/>下次收到消息后将弹出消息提示!', function (r) {
                        if (r) {
                            WebIm.requestPermission();
                        }
                    });

            }
        }
    };

    result.requestPermission = function () {
        window.webkitNotifications.requestPermission(WebIm.notify);
    };

    ///////////////////////////////////

    var ImMsgTip = {
        time: 0,
        timer: null,
        show: function () {
            if (!socket) {
                return;
            }

            socket.emit('getnoreadmsg', {}, getnoreadmsg);

        },
        openmsg: function (event) {
            var id = event.data.id;
            if (!id) {
                return;
            }
            showmsgbox(id);
            ImMsgTip.delone(id);

        },
        delone: function (id) {

            $('#messagebubble_msg_' + id).remove();
            $('#messagebubble_msg_tip_' + id).remove();
            $('#messageBubble_bubblePanel_message div.messagebubble_msg_tip:last').show();

            ImMsgTip.clear();
        },
        clear: function () {

            if ($('#messageBubble_bubbleMsgList_ul').find('li').length == 0) {
                ImMessage.clear();
                $('#Im_messageBubble').remove();
            }

        }
    };

    /**
     * 仿webQQ消息提示
     * @param data
     */
    function getnoreadmsg(data) {

        console.log('getnoreadmsg:', data);

        if (data.result != 'ok') {
            console.log(data.msg);
            return;
        }
        if (data.total == 0) {
            return;
        }

        if (!$('#Im_messageBubble')[0]) {

            $('<div id="Im_messageBubble" class="bubbleContainer">' +
                '<div class="bubblePanel" id="messageBubble_bubblePanel">' +
                '<span title="消息管理器" class="icon setting" id="messageBubble_bubblePanel_setting"></span>' +
                '<div class="item" id="messageBubble_bubblePanel_message">' +
                '</div>' +
                '</div>' +
                '<div class="bubbleMsgList" id="messageBubble_bubbleMsgList">' +
                '<h3>未读消息(<span class="count" id="messageBubble_bubbleMsgList_userCount">1</span>)</h3>' +
                '<div class="bubbleMsgListInner">' +
                '<div class="bubbleMsgListContainer" id="messageBubble_bubbleMsgListContainer">' +
                '<ul id="messageBubble_bubbleMsgList_ul"></ul>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>'
            ).appendTo('body');

            var left = ($('body').width() - $('#Im_messageBubble').width()) / 2;
            $('#Im_messageBubble').css('left', left).hover(function () {
                $('#messageBubble_bubbleMsgList').show();
            },function () {
                $('#messageBubble_bubbleMsgList').hide();
            }).show();

        }

        var Nums = {};

        for (var i in data.rows) {

            var fcdata = data.rows[i];

            if (!Nums[fcdata.fcid]) {
                Nums[fcdata.fcid] = 1;
            } else {
                Nums[fcdata.fcid]++;
            }

            if (fcdata) {

                var msg = html_escape(fcdata.msg);

                if (!$('#messagebubble_msg_' + fcdata.fcid)[0]) {
                    $('#messageBubble_bubbleMsgList_ul')
                        .append('<li id="messagebubble_msg_' + fcdata.fcid + '" class="item"></li>');

                    $('#messagebubble_msg_' + fcdata.fcid).unbind('click')
                        .bind('click', {id: fcdata.fcid}, ImMsgTip.openmsg)
                        .html('<a href="javascript:void(0)">' +
                            '<span class="count">(1)</span>' +
                            '<span class="content">' +
                            '<span class="contentInner">' + fcdata.fcname + '：' + msg + ' </span>' +
                            '</span></a>');

                    $('#messageBubble_bubblePanel_message')
                        .append('<div class="messagebubble_msg_tip" id="messagebubble_msg_tip_' + fcdata.fcid + '">' +
                            '<span class="icon single"></span>' +
                            '<span class="body">' +
                            '<span class="content">' +
                            '<span class="nick">' + fcdata.fcname + '</span>：' + msg + ' ' +
                            '</span>' +
                            '</span>' +
                            '<span class="count">(1)</span></div>');

                    $('#messagebubble_msg_tip_' + fcdata.fcid).unbind('click')
                        .bind('click', {id: fcdata.fcid}, ImMsgTip.openmsg);

                }
                $('#messagebubble_msg_' + fcdata.fcid).find('span.count').text('(' + Nums[fcdata.fcid] + ')');
                $('#messagebubble_msg_' + fcdata.fcid).find('span.contentInner').html(fcdata.fcname + '：' + msg);
                $('#messagebubble_msg_tip_' + fcdata.fcid).find('span.count').text('(' + Nums[fcdata.fcid] + ')');
                $('#messagebubble_msg_tip_' + fcdata.fcid).find('span.content').html('<span class="nick">' +
                    fcdata.fcname + '</span>：' + msg);
                $('#messageBubble_bubblePanel_message div.messagebubble_msg_tip').hide();
                $('#messageBubble_bubblePanel_message div.messagebubble_msg_tip:last').show();

                WebIm.notify(fcdata.fcname + ':' + msg, function () {
                    ImMsgTip.openmsg({data: {id: fcdata.fcid}});
                    ImMessage.clear();
                });

            }

        }

        $('#messageBubble_bubbleMsgList_userCount').text(data.total);

    }

    return result;
}());

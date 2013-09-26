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

    var Sms_host, Sms_id, Sms_user = false, Sms_online_total = 0, allUsers = [];

    var result = {};

    var socket;
    var firstconnect = true;

    var nowSendIds = [];

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
        clearfunc: false,
        clear: function () {
            clearTimeout(ImMessage.timer);
            document.title = ImMessage.title;
            if (typeof ImMessage.clearfunc == 'function') {
                ImMessage.clearfunc();
                ImMessage.clearfunc = false;
            }
        },
        open: function () {
            ImMessage.show();
            document.onclick = function () {
                ImMessage.clear();
            }
        }
    };


    result.notify = function (body, func, first) {

        if (window.webkitNotifications) {

            if (window.webkitNotifications.checkPermission() == 0) {

                if (first) {
                    return;
                }
                console.log('notify');
                body = body || 'chrome浏览器有新消息将弹出该信息!';
                var notification_test = window.webkitNotifications
                    .createNotification(Sms_host + '/static/images/avatar.jpg', '通知', body);
                notification_test.display = function () {
                };
                notification_test.onerror = function () {
                };
                notification_test.onclose = function () {
                };
                notification_test.onclick = function () {
//                    if (typeof(func) == 'function') {
//                        func();
//                    }
                    window.focus();
                    this.cancel();
                };

                notification_test.replaceId = 'OAWebIm';

                notification_test.show();

            } else {

                if (!first) {
                    return;
                }
                $.messager.confirm('新增桌面通知功能',
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


    var ImMsgTip = {
        time: 0,
        timer: null,
        show: function () {

            socket.emit('getfc0msg', {id: Sms_id}, function (data) {

                console.log('getfc0msg:', data);

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

                for (var i in data.list) {

                    var fcdata = data.list[i];

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

            });


        },
        openmsg: function (event) {
            var id = event.data.id;
            if (!id) {
                return;
            }
            showmsgbox(id, function () {

                socket.emit('getfc0msg_fcid', {id: id}, function (data) {

                    if (data.result != 'ok') {
                        console.log(data.msg);
                        return;
                    }
                    if (data.total == 0) {
                        return;
                    }

                    for (var j in data.list) {
                        writemsg(data.list[j]);
                    }

                });

                ImMsgTip.delone(id);
            });

        },
        clear: function () {

            if ($('#messageBubble_bubbleMsgList_ul').find('li').length == 0) {
                ImMessage.clear();
                $('#Im_messageBubble').remove();
            }

        },
        delone:function(id){

            $('#messagebubble_msg_' + id).remove();
            $('#messagebubble_msg_tip_' + id).remove();
            $('#messageBubble_bubblePanel_message div.messagebubble_msg_tip:last').show();

            ImMsgTip.clear();
        }
    };


    result.init = function (data) { //{smshost,smsid}

        Sms_host = data.smshost;
        Sms_id = data.smsid;

        $('body').append('<div id="webimwbox"><div id="webimmin"></div><div id="webimbox"></div></div>');

        var top = ($(document).height() - $('#webimwbox').height()) / 2;
        $('#webimwbox').css('top', top);
        //console.log(top, $('body').height(), $('#webimwbox').height());

        $('#webimmin').click(function () {
            $('#webimbox').toggle();
        });

        if (firstconnect) {
            socket = io.connect(Sms_host + '/im');
        } else {
            socket.socket.reconnect();
        }

        socket.on('connect', function () {
            console.log('connect');
            result.login();
        });

        socket.on('reconnecting', function () {
            console.log('reconnecting');
            $('#webimbox').html('<div id="webim_dis">连接丢失,正在等待连接...' +
                '<br/>长时间未连接请<a href="javascript:window.location.reload();">刷新页面</a></div>');
        });

        WebIm.notify('', false, true);

    };

    result.login = function () {
        Sms_online_total = 0;
        socket.emit('login', {smsid: Sms_id}, function (data) {

            if (data) {
                if (data.result == 'ok') {
                    Sms_user = data.user;

                    $('#webimbox').html('<div id="webim_top"></div><div id="webim_lxr"></div><div id="webim_tree"></div>');

                    $('#webim_top').html('<dl><dt>' + avatar(Sms_user.user_id)
                        + '</dt><dd>昵称：' + Sms_user.user_realname
                        + '</dd><dd>UID：' + Sms_user.user_uname
                        + '</dd><dd>' +
                        '<a id="webim_setting" href="javascript:void(0)">[设置]</a> ' +
                        '<a id="webim_msg_tip" href="javascript:void(0)">[消息]</a>' +
                        '</dd></dl>');

                    userinit();

                } else {
                    console.log(data);
                }
            }

        });
    };

    result.exit = function () {
        socket.removeAllListeners();
        socket.disconnect();
    };


    /*--------------------------*/

    function avatar(uid) {

        uid = uid || 'null';
        return '<img src="' + Sms_host + '/avatar/' + uid + '" />';
    }

    function setallusers(data) {
        allUsers = data.allusers;
    }


    function userinit() {
        if (Sms_user) {

            $.post(URL + '/im/userTree', function (data) {

                setallusers(data);

                $('#webim_tree').tree({
                    lines: true,
                    fit: true,
                    data: data.tree,
                    onDblClick: function (node) {
                        showmsgbox(node.id);
                    }
                });

                $('#webim_lxr').html('联系人(<span id="webim_lxr_num">0</span>/' + data.totaluser + ')');

                getonline();//获取在线人员

                if (firstconnect) {
                    socketevent();
                    firstconnect = false;
                }

                ImMsgTip.show();//查询离线消息

            }, 'json');

        }

    }

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
                Sms_online_total = parseInt(Sms_online_total) * 1 + 1;
            } else {
                Sms_online_total = parseInt(Sms_online_total) * 1 - 1;
            }
            $('#webim_lxr_num').text(Sms_online_total);
        }
    }

    function getonline() {

        socket.emit('getonline', {smsid: Sms_id}, function (data) {
            console.log('getonline', data);
            if (data) {
                if (data.result == 'ok') {
                    Sms_online_total = 0;
                    for (var i in data.users) {
                        setonline(i, true);
                    }

                }
            }
        });

    }


    function socketevent() {

        if (!Sms_user) {
            return;
        }
        socket.on('disconnect', function () {
            //socket.removeAllListeners();
            Sms_user = false;
        });

        socket.on('f5', function () {
            $.messager.confirm('提示', '接收到刷新请求!<br/>服务端可能修改了程序!<br/>需要重新载入!<br/>', function (r) {
                if (r) {
                    window.location.reload();
                }
            });

        });

        socket.on('otherlogin', function (data) {
            console.log('otherlogin', data);
            if (data) {
                if (data.result == 'ok') {

                    setonline(data.uid, true);

                }
            }
        });

        socket.on('otherexit', function (data) {
            console.log('otherexit', data);
            if (data) {
                if (data.result == 'ok') {

                    setonline(data.uid, false);

                }
            }
        });

        socket.on('receivemsg', function (data) {
            console.log('receivemsg', data);
            if (data) {
                if (data.result == 'ok') {

                    ImMessage.open();

                    if (nowSendIds[data.fcdata.fcid]) {

                        writemsg(data.fcdata);

                        $('#im_msgbox_' + data.fcdata.fcid)
                            .one('click',
                            {id: data.fcdata.fcid},
                            function (event) {
                                console.log('clickone',event.data.id);
                                ImMsgTip.delone(event.data.id);
                                socket.emit('readfc', {id: event.data.id});
                            });
                    }

                    ImMsgTip.show();

                    window.focus();
                    window.blur();
                }
            }
        });


    }

    function html_escape(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            .replace(/\n/g, '<br/>');
    }

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

    function writemsg(data, m) { //data={fcid,ztitle,msg,fujian}
        var id = m ? m : data.fcid;

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

        $('#webim_msg_li_' + data.sid ).find('p:eq(0)').addClass(m).html(data.ztitle);

        $('#webim_msg_li_' + data.sid ).find('div.info:last').html(msg);

        $('#webim_msg_body_' + id).parent().scrollTop($('#webim_msg_body_' + id).parent()[0].scrollHeight);

    }

    function sendmsg(id, msg, fujian) {
        if (!id) {
            $.messager.alert('提示', '没有接收人id!');
            return false;
        }
        if (msg == '') {
            $.messager.alert('提示', '请输入消息内容!');
            return false;
        }
        fujian = fujian || '';
        //console.log('sendmsg:',id,msg,fujian);
        socket.emit('sendmsg', {id: id, msg: msg, fujian: fujian}, function (data) {
            if (data) {
                if (data.fcdata) {
                    writemsg(data.fcdata, id);
                } else {
                    console.log(data.msg);
                }

            }

        });

    }

    result.sendmsg = sendmsg;
    result.showmsgbox = showmsgbox;

    function showmsgbox(id, func) {

        if (id == Sms_user.user_id) {
            $.messager.alert('提示', "不能给自己发送消息");
            return;
        }

        if(!allUsers[id]){return;}

        var text = allUsers[id].realname + ' / ' + allUsers[id].position;

        nowSendIds[id] = allUsers[id].realname;

        if ($('#im_msgbox_' + id)[0]) {
            if ($.isFunction(func)) {
                func();
            }
            return;
        }


        $.window({
            winId: 'im_msgbox_' + id,
            title: '与 ' + text + ' 交谈',
            width: 600, height: 500,
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

                if ($.isFunction(func)) {
                    func();
                }

            },
            onClose: function () {
                delete nowSendIds[id];
            }

        });

    }


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
                        //Import.filePath = data.filePath;
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

    var historyview = $.extend({}, $.fn.datagrid.defaults.view, {
        renderRow: function (target, fields, frozen, rowIndex, rowData) {
            var cc = [];
            cc.push('<td  colspan="' + fields.length + '"><ul class="webim_msg_ul"><li>');

            var m = 't';
            if (rowData.fcid == Sms_user.user_id) {
                m = 'm';
            }
            //console.log('fcid:', rowData.fcid, Sms_user.user_id);

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

    function openhistory(id) {

        $.window({
            winId: 'im_msg_historybox',
            title: '历史消息',
            width: 600, height: 500,
            left: ($(document).width() - 600) / 2 + 50,
            top: ($(document).height() - 500) / 2 + 50,
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

    return result;
}());

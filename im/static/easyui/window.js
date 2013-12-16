(function ($) {
	function S4() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	}
	function CreateIndentityWindowId() {
		return "UUID-" + (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
	}
	function destroy(target) {
		$(target).dialog("destroy");
	}
	function getWindow(target) {
		if (typeof target == "string") {
			return document.getElementById(target);
		} else {
			return $(target).closest(".window-body");
		}
	}
	
	if(window.top != self){
		if(window.top.jQuery && window.top.jQuery.window){
			$.window = window.top.jQuery.window;
			return;
		}
		throw "父窗口没有导入jQuery或定义window插件！";
	}
	
	$.window = function (options) {
		if (!options.url && !options.contents) {
			$.messager.alert("提示", "缺少必要参数!(url or contents)");
			return false;
		}
		var windowId = CreateIndentityWindowId();
		if (options.winId) {
			windowId = options.winId;
            $('#'+windowId).dialog('close');
		} else {
			options.winId = windowId;
		}
		var defaultBtn = [{
            iconCls: 'icon-cancel',
			text : '关闭',
			handler : function () {
				$("#" + windowId).dialog("close");
			}
		}
		];
		if(options.buttons&&options.isclosebtn){
			options.buttons = $.merge(options.buttons || [], defaultBtn);
		}
		options = $.extend({}, $.window.defaults, options || {});
		if (options.isMax) {
			options.draggable = false;
			options.closed = true;
		}
		var dialog = $('<div/>');
		if (options.target != 'body') {
			options.inline = true;
		}

		dialog.appendTo($(options.target));
		dialog.dialog($.extend({}, options, {

			onClose : function () {
				if (typeof options.onClose == "function") {
					options.onClose.call(dialog,$);
				}
				destroy(this);
			},
			onMove : function (left, top) {
				if (typeof options.onMove == "function") {
					options.onMove.call(dialog,$);
				}
				var o = $.data(this, 'panel').options;
				if (top < 0) {
					$(this).dialog("move", {
						"left" : left,
						"top" : 0
					});
				} else if (o.maximized) {
					$(this).dialog("restore");
					$(this).dialog("move", {
						"left" : left + 100,
						"top" : top
					});
				}
				if (top > ($(o.target).height() - 20)) {
					$(this).dialog("move", {
						"left" : left,
						"top" : ($(o.target).height() - 25)
					});
				}
			}
		}));
		if (options.align) {
			var w = dialog.closest(".window");
			switch (options.align) {
			case "right":
				dialog.dialog("move", {
					left : w.parent().width() - w.width() - 20
				});
				break;
			case "tright":
				dialog.dialog("move", {
					left : w.parent().width() - w.width() - 20,
					top : 0
				});
				break;
			case "bright":
				dialog.dialog("move", {
					left : w.parent().width() - w.width() - 20,
					top : w.parent().height() - w.height() - 20
				});
				break;
			case "left":
				dialog.dialog("move", {
					left : 0
				});
				break;
			case "tleft":
				dialog.dialog("move", {
					left : 0,
					top : 0
				});
				break;
			case "bleft":
				dialog.dialog("move", {
					left : 0,
					top : w.parent().height() - w.height() - 10
				});
				break;
			case "top":
				dialog.dialog("move", {
					top : 0
				});
				break;
			case "bottom":
				dialog.dialog("move", {
					top : w.parent().height() - w.height() - 10
				});
				break;
			}
		}
		if (options.isMax) {
			dialog.dialog("maximize");
			dialog.dialog("open");
		}
	
		if (options.contents) {
			ajaxSuccess(options.contents);
		} else {
			if (!options.isIframe) {
                if($('#loading_win')[0]){
                    $('#loading_win').dialog('destroy');
                }
                $('<div id="loading_win"><p style="padding:25px 10px;font-size:13px;">数据加载中...</p></div>').appendTo('body');
                $('#loading_win').dialog({
                    title:options.title,
                    width: 300,
                    height: 'auto'
                });

				$.ajax({
					url : options.url,
					type : options.ajaxType || "POST",
					data : options.data == null ? "" : options.data,
					success : function (date) {
                        try{
                            var json = $.parseJSON(date);
                            if (json.error == 1) {
                                $('#loading_win').dialog('destroy');
                                $.messager.alert('提示',json.msg);
								dialog.dialog('close');
                                return false;
                            }
                        }catch(e) {
						    ajaxSuccess(date);
                        }

					}
				});
			} else {
				ajaxSuccess();
			}
		}
		dialog.attr("id",windowId);
		
		dialog.destroy = function(){
			destroy(this);
		};
		
		return dialog;
		function ajaxSuccess(date) {
            $('#loading_win').dialog('destroy');
			if (options.isIframe && !date) {
				dialog.find("div.dialog-content").html('<iframe width="100%" height="100%" frameborder="0" src="' + options.url + '" ></iframe>');
			} else {
				dialog.find("div.dialog-content").html(date);
			}
			$.parser.parse(dialog);

            dialog.dialog("open");


			options.onComplete.call(dialog,$);
		}
	};
	
	$.window.defaults = $.extend({}, $.fn.dialog.defaults, {
		url : '',
		data : '',
		contents:'',
		ajaxType:"POST",
		target : 'body',
		height : 200,
		width : 400,
		collapsible : false,
		minimizable : false,
		maximizable : false,
		closable : true,
        closed:true,
		modal : false,
		shadow : false,
        isclosebtn:true,
        button:false,
		onComplete : function (topjQuery) {}
	});
})(jQuery);
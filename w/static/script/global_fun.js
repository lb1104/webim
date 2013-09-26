// 取得所有html,包括value
(function ($) {
    var oldHTML = $.fn.html;
    $.fn.formhtml = function () {

        if (arguments.length)
            return oldHTML.apply(this, arguments);
        $("input,textarea,button", this).each(function () {
            this.setAttribute('value', this.value);
        });
        $(":radio,:checkbox", this).each(function () {
            if (this.checked)
                this.setAttribute('checked', 'checked');
            else
                this.removeAttribute('checked');
        });
        $("option", this).each(function () {
            if (this.selected)
                this.setAttribute('selected', 'selected');
            else
                this.removeAttribute('selected');
        });
        return oldHTML.apply(this);
    };
})(jQuery);

// 获取表单值json
(function ($) {
    $.fn.serializeJson = function () {

        var serializeObj = {};
        var array = this.serializeArray();
        var str = this.serialize();
        $(array).each(
            function () {
                if (serializeObj[this.name]) {
                    if ($.isArray(serializeObj[this.name])) {
                        serializeObj[this.name].push(this.value);
                    } else {
                        serializeObj[this.name] = [
                            serializeObj[this.name], this.value ];
                    }
                } else {
                    serializeObj[this.name] = this.value;
                }
            });
        //未选中的checkbox
        $(this).find(':checkbox:not(:checked)').each(function () {
            if (!serializeObj[this.name]) {
                serializeObj[this.name] = '';
            }
        });
        return serializeObj;
    };
})(jQuery);


/**
 * 验证表单必填项
 * if(!checkform("#form")){ alert('请填写必填项!');return; }
 * @param form
 * @returns {boolean}
 */
function checkform(form) {

    var flag = true;

    try {
        $(form + ' input.easyui-validatebox:not(:hidden)').each(function () {

            if (!$(this).validatebox('isValid')) {
                flag = false;
                return false;
            }

        });

    } catch (e) {
        console.log(e);
    }

    return flag;
}

function inArray(needle, haystack) {

    for (var i in haystack) {
        if (needle == haystack[i])
            return true;
    }
    return false;
}

function ucfirst(str) {

    return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();

}


/**
 * 查询json text字段含有某关键字 返回id字段,用于查找树
 * @param json
 * @param key
 * @returns {number}
 */
function findjsontext(json, key) {

    var id = 0;
    $.each(json, function (i, n) {
        if (n.text.indexOf(key) > -1) {
            id = n.id;
            return false;
        } else {
            if (n.children) {
                var cid = findjsontext(n.children, key);
                if (cid > 0) {
                    id = cid;
                    return false;
                }
            }
        }

    });

    return id;

}

/**
 * 查询是否grid里面存在相同的idnum和name
 * @param gridid
 * @param idnum
 * @param name
 * @returns {boolean}
 */
function checkIdnumname(gridid,idnum, name) {
    var members = $("#"+gridid).datagrid("getData");
    var flag = false;
    $.each(members.rows, function (i, n) {
        if (idnum == n.idnum && name == n.name) {
            flag = true;
            return false;
        }
    });
    return flag;
}
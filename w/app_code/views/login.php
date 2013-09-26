<!DOCTYPE html>
<html>
<head>
    <title>登录</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>

    <link href="<?php echo base_url()?>static/easyui/themes/default/easyui.css" rel="stylesheet" type="text/css"/>
    <link href="<?php echo base_url()?>static/easyui/themes/icon.css" rel="stylesheet" type="text/css"/>
    <link href="<?php echo base_url()?>static/css/login.css" rel="stylesheet" type="text/css"/>

    <script type="text/javascript" src="<?php echo base_url()?>static/script/jquery-1.8.3.min.js"></script>
    <script type="text/javascript" src="<?php echo base_url()?>static/easyui/jquery.easyui.min.js"></script>
    <script type="text/javascript" src="<?php echo base_url()?>static/easyui/validatebox.js"></script>
    <script type="text/javascript" src="<?php echo base_url()?>static/easyui/window.js"></script>

    <script type="text/javascript" src="<?php echo base_url()?>static/script/global_fun.js"></script>
    <script type="text/javascript" src="<?php echo base_url()?>static/script/login.js"></script>

    <script type="text/javascript">
        var URL = "<?php echo current_url()?>", ROOT = "<?php echo base_url()?>";
    </script>
</head>
<body>
<div class="easyui-window" title="登陆" style="width:400px">
    <form action="" method="post" id='login_form' onsubmit="logincheck();return false;">

        <table width="100%">
            <tr height="40">
                <td nowrap align="right">用户名：</td>
                <td><input type="text" class="easyui-validatebox txt" data-options="required:true"
                           id="user" name="user" value="<?php echo $user;?>"/></td>
            </tr>
            <tr height="40">
                <td nowrap align="right">密　码：</td>
                <td><input type="password" class="txt easyui-validatebox" data-options="required:true"
                           name="pwd" id="pwd"/></td>
            </tr>
            <tr height="40">
                <td nowrap align="right">验证码：</td>
                <td><input type="text" class="txt code easyui-validatebox"
                           data-options="required:true,tipPosition:'left'"
                           style="width: 60px;"
                           id="checkimg" name="checkimg"/>
                    <img src="<?php echo current_url()?>/checkimg" id="ckimg"
                         onclick="reloadcheckimg();" alt="点击换一张验证码"/>
                </td>
            </tr>
            <tr height="40">
                <td></td>
                <td>
                    <input type="submit" class="btn" value="登 录" />
                    <input type="reset" class="btn reset" value="重 置"/>
                </td>
            </tr>
            <tr height="30">
                <td colspan="2" id="logininfo"></td>
            </tr>

        </table>


    </form>
</div>

</body>
</html>

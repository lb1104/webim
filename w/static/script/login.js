function logincheck()
{

//    $.messager.progress({
//        title:'登录中',msg:'请稍候...',
//        text:''
//    });

    var params = $('#login_form').serializeJson();

    $.post(URL+"/logined",params,function(data){

        if(data=="ok"){   //登陆成功
            document.location.reload();
        }else{
             $("#logininfo").html(data);
             reloadcheckimg();
            //$.messager.progress('close');
        }

    });

    return false;

}

function reloadcheckimg()   //验证码看不清？换一张 更改图片的属性，就会自动重载图片
{
    $('#checkimg').val('');
    $("#ckimg").attr('src',URL+'/checkimg?abc='+Math.random());
}

window.onload=function(){

    $('#loading').remove();

};

function closeall(){// 初始化，将查询结果框和基本表框隐藏

    $('.window,.window-shadow,.window-mask').remove();

}

if(!console){
    var console={
        log:function(ms){

    }};
}
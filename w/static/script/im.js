var WebIm=false;
$(function () {
    $.post(URL + "/im",{ip:location.hostname}, function (data) {

        if (data) {

            if (data.smshost) {

                $('head').append('<link rel="stylesheet" type="text/css" href="' + data.smshost + '/static/css/style.css"/>');

                $.getScript(data.smshost + '/socket.io/socket.io.js', function () {
                    $.getScript(data.smshost + '/static/js/im.js?'+new Date().getTime(), function () {
                        setTimeout(function(){
                            WebIm.init(data);
                        },2000);
                    });
                });

            }

        }
    }, 'json');
});

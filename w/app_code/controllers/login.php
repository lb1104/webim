<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Login extends CI_Controller
{

    function index()
    {

        $userid = $this->session->userdata('user_id');
        if ($userid>0) {
            redirect(site_url(''));
        }

        $user=$this->input->cookie('comm_user');
        $data=array(
            'user'=>$user,
        );

        $this->load->view('login',$data);

    }

    function logined()
    {

        $user = $this->input->post('user',TRUE);
        $pwd = $this->input->post('pwd',TRUE);
        $checkimg = $this->input->post('checkimg',TRUE);
        $vcode = $this->session->userdata('validationcode');

        if (strcasecmp($checkimg, $vcode) != 0) {
            exit('验证码不正确!');
        }

        $pwdcheck = md5 ( $user . $pwd );
        $m=M('user');

        $user=$m->find("uname='{$user}' and pwd='{$pwdcheck}' and status='1'",'id,uname,realname,acode');

        if(!$user){
            exit('密码错误!');
        }

        $session=array(
            'user_id'=>$user['id'],
            'userRole'=>$user['role'],
            'userAcode'=>$user['acode'],
            'user_uname'=>$user['uname'],
            'user_realname'=>$user['realname'],

        );

        $this->input->set_cookie('comm_user',$user['uname'],864000);

        $this->session->set_userdata($session);

        exit('ok');

    }

    function logout(){

        $this->session->sess_destroy();

        redirect(site_url('login'));

    }

    function checkimg()
    {

        $this->load->library('validationcode');
        $this->validationcode->outImage();
        $this->session->set_userdata('validationcode', $this->validationcode->code);

    }

}
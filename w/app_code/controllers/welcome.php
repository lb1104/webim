<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Welcome extends MY_Controller {

	public function index()
	{

        $data=array();
        
        $data['realname']=$this->session->userdata('user_realname');

        $this->display('welcome.html',$data);

        //$this->output->enable_profiler(TRUE);

    }


}

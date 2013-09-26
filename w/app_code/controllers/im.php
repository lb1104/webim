<?php

class Im extends MY_Controller
{

    function index()
    {

        //sms center

        $configsmshost = config_item('smshost');
        $ip = $this->input->get_post('ip', true);
        $purl = parse_url($configsmshost);
        $smshost = 'http://' . $ip . ':' . $purl['port'];
        $im = @file_get_contents($smshost . '/i');
        if ($im != '1') {
            $smshost = false;
            $im = @file_get_contents($configsmshost . '/i');
            if ($im == '1') {
                $smshost = $configsmshost;
            } else {
                $smshost = false;
            }
        }


        $data['smshost'] = $smshost;
        $data['smsid'] = $this->session->userdata('session_id');
        //sms center

        exit(json_encode($data));

    }

    /**
     * 返回角色人员列表
     */
    function userTree()
    {
        $m = M('department');
        $alllist = $m->fetAll("", "id,pid as fid,name as text", "sort asc ,id asc");
        $users = array();
        foreach ($alllist as $key => $row) {
            $alllist[$key]['iconCls'] = 'im_role';
            $alllist[$key]['id']='z'.$row['id'];
            $alllist[$key]['fid']='z'.$row['fid'];
//          $alllist[$key]['state'] = 'closed';
            $alllist[$key]['children'] = $this->getRoleuser($row['id'], $users);
        }
        $this->load->library('tool');
        $tree = $this->tool->genTree($alllist, 'id', 'fid');

        $m = M('user');
        $list = $m->fetAll('','id,realname,position');
        $allusers=array();
        foreach($list as $row){
            $allusers[$row['id']]=$row;
        }

        $result = array(
            'tree' => $tree,
            'totaluser' => count($users),
            //'userids' => array_keys($users),
            'allusers'=>$allusers,
        );
        exit(json_encode($result));
    }

    /**
     * 返回指定角色的用户列表
     * @param int $roleid
     * @param $users
     * @return array
     */
    function getRoleuser($roleid = 0, &$users)
    {
        $m = M('user');
        $list = $m->fetAll(" concat(',',department,',') like '%,{$roleid},%'", 'id,uname,realname,position');

        $result = array();

        foreach ($list as $row) {
            $users[$row['id']] = $row;
            $result[] = array(
                'id' => $row['id'],
                'iconCls' => 'im_user',
                'text' => $row['realname'] . ' / ' . $row['position'],
            );
        }

        return $result;

    }

    function ajaxfileupload()
    {

        $filetype = '*';
        $this->load->library('uploadfile');
        $ret = $this->uploadfile->upload('static/uploads/im', $filetype, true);
        echo json_encode($ret);

    }

    function delfileupload()
    {
        $filepath = $this->input->post('filepath', true);
        $this->load->library('uploadfile');
        $this->uploadfile->delfile($filepath);

    }

    function history($id = 0)
    {

        if ($id) {

            $m = M('oa_im_msg_js');
            $where = "( j.fcid='{$this->userid}' and j.jsid='{$id}' ) or (j.fcid='{$id}' and j.jsid='{$this->userid}')";

            $sql = "
             from oa_im_msg_js j
             JOIN oa_im_msg m
             on j.sid=m.id
             where $where
             ";
            $result = array();
            $row = $m->getOne('select count(*) as num ' . $sql);
            $result['total'] = $row['num'];
            $list = $m->getAll(' select j.jsid,j.fcid,m.fcname,m.ztitle,m.msg,m.fujian ' . $sql . ' order by j.id desc limit ' . $this->offset . ',' . $this->rows);
            $result['rows'] = $list;

            $this->datajson($result);
        } else {
            $this->datajson();
        }


    }

    function test()
    {

        //$data=@file_get_contents("http://127.0.0.1:8081/sendmsg/120/");


    }


}
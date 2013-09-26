<?php
/**
 * User: lrb
 * Date: 13-5-5
 * Time: 下午1:10
 */
class MY_Controller extends CI_Controller
{

    var $ip = '';
    var $userid=FALSE;
    var $id=0;
    var $memid=0;
    var $dbtable='';
    var $idnum='';
    var $page=1;
    var $rows=20;
    var $offset=0;
    var $guid=FALSE;
    var $uuid=FALSE;

    function __construct()
    {

        $this->my_init();

        if(!isset($_SERVER['HTTP_SOAPACTION'])){
            $this->checklogin(); //检查登录
        }

    }

    function my_init(){

        parent::__construct();

        $id = $this->input->get_post('id', TRUE);
        $memid=$this->input->post('memid',TRUE);
        $this->id = $id ? intval($id) : 0;
        $this->memid = $memid ? intval($memid) : 0;

        $this->dbtable = $this->input->get_post('dbtable', TRUE);
        $this->guid = $this->input->get_post('guid', TRUE);
        $this->uuid = $this->input->get_post('uuid', TRUE);

        $this->idnum = $this->input->get_post('idnum', TRUE);

        $page = $this->input->get_post('page', TRUE);
        $rows = $this->input->get_post('rows', TRUE);

        $this->page = $page ? intval($page) : 1;
        $this->rows = isset($rows) ? intval($rows) : 20;
        $this->offset = ($this->page - 1) * $this->rows;
        unset($id,$memid,$page,$rows);

        if (in_array($this->dbtable, array('user', 'role'))) {
            $this->error('无权访问数据库！');
        }

        $this->ip = $this->input->ip_address();
    }

    /**
     * 检查登录
     */
    function checklogin()
    {
        $this->userid = $this->session->userdata('user_id');
        if (!$this->userid) {

            if ($_SERVER["REQUEST_METHOD"] == 'POST') {
                $this->error('请先登录!');
            } else {
                redirect(site_url('login'));
            }

        }

    }

    /**
     * 返回成功信息 json {error:0,msg:''}
     * @param string $msg
     * @param string $farr
     */
    function success($msg = '', $farr = '')
    {
        return_win($msg, 0, $farr);
    }

    /**
     * 返回错误信息 json {error:1,msg:''}
     * @param string $msg
     * @param string $farr
     */
    function error($msg = '', $farr = '')
    {
        return_win($msg, 1, $farr);
    }

    /**
     * 返回datagrid用数据
     * @param string $data {'',result{total,rows}}
     */
    function datajson($data = '')
    {
        $result = array();
        if ($data != '') {
            $result = $data;
        }
        $this->output->set_output(json_encode($result));
    }

    /**
     * Smarty 添加数据
     * @param $name
     * @param string $val
     */
    function assign($name, $val = '')
    {

        $this->load->library('smarty');

        if (is_array($name)) {
            $this->smarty->assign($$name);
        } else {
            $this->smarty->assign($name, $val);
        }

    }

    /**
     * Smarty 返回模版数据
     * @param string $template
     * @param string $data
     * @return mixed
     */
    function fetch($template = '', $data = '')
    {
        $this->load->library('smarty');
        if (is_array($data)) {
            $this->smarty->assign($data);
        }

        if (file_exists(APPPATH . 'views/' . $template)) {
            return $this->smarty->fetch($template);
        } else {
            return '页面不存在!';
        }

    }

    /**
     * Smarty 显示模版数据
     * @param string $template
     * @param string $data
     */
    function display($template = '', $data = '')
    {
        $this->load->library('smarty');

        if (is_array($data)) {
            $this->smarty->assign($data);
        }

        if (file_exists(APPPATH . 'views/' . $template)) {
            $this->smarty->display($template);
        } else {
            $this->error('页面' . $template . '不存在!');
        }

    }


    /**
     * 返回easyui用查询条件 数据分页列表
     * @param $dbtable
     * @param array $where
     * @param string $fields
     * @param string $orderby
     * @return array {total:0,rows:[]}
     */
    function getpagelist($dbtable, $where = array(), $fields = '*', $orderby = '')
    {

        $where = $this->getwhere($dbtable, $where);
        $fields = $this->getfields($dbtable, $fields);

        return $this->getlist($dbtable, $where, $fields, $orderby);
    }

    function getlist($dbtable, $where = '', $fields = '*', $orderby = '')
    {
        if (is_array($where)) {

            $wherestr = join(' and ', $where);;
        } else {
            $wherestr = $where;
        }

        $m = M($dbtable);
        $result = array();
        $result['total'] = $m->count($wherestr); //统计行数
        $result["rows"] = $m->fetall($wherestr, $fields, $orderby, $this->offset, $this->rows);

        return $result;
    }

    /**
     * 处理查询条件
     * @param $dbtable
     * @param string $where
     * @param bool|array $remove
     * @return array|string
     */
    function getwhere($dbtable, $where = '',$remove=false)
    {

        if (is_string($where)) {
            if (empty($where)) {
                $where = array();
            } else {
                $where = array($where);
            }
        }

        $table_fields = $this->db->field_data($dbtable); //解析表,返回字段名数组

        foreach ($table_fields as $field) {
            if($remove){
                if(in_array($field->name,$remove)){
                    continue;
                }
            }
            $val = $this->input->post($field->name, TRUE);
            $val = trim($val);
            if($field->name=='acode'){
                if(!empty($val)){
                    $where[] = "acode like " . handleAcode($val); //用户访问数据范围
                    continue;
                }else{
                    $where[] = "acode like " . handleAcode($this->session->userdata('userAcode')); //用户访问数据范围
                }
            }
            if($field->name=='idnum'&&!empty($val)){  //新老身份证查询
                $idnum2 = idnumUpgrade($val);
                if($idnum2){
                    $where[] = "idnum IN ('{$val}','{$idnum2}')";
                    continue;
                }
            }
            if (!empty($val) && !in_array($val, array('--', '不清楚', '请选择'))) {
                if($field->type=='varchar'){
                    $where[] = $field->name . " like '%" . $val . "%' ";
                }else{
                    $where[] = $field->name . " ='" . $val . "' ";
                }

            }

        }

        return $where;
    }

    /**
     * 处理查询字段
     * @param $dbtable
     * @param string $fields
     * @return string
     */
    function getfields($dbtable, $fields = '*')
    {
        if ($fields != '*') {
            return $fields;
        }
        $m = M($dbtable);
        $table_fields = $m->getField(); //解析表,返回字段名数组
        $postfields = $this->input->post('fields');
        if (!$postfields) {
            return $fields;
        }
        $fieldsarr = explode(',', $postfields);
        $fieldsarray = array('id');
        foreach ($table_fields as $field) {

            if (in_array($field, $fieldsarr)) {
                $fieldsarray[] = $field;
            }

        }
        if (count($fieldsarray) > 1) {
            $fields = join(',', $fieldsarray);
        }
        return $fields;
    }


}
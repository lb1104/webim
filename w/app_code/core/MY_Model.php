<?php
/**
 * Name: MY_Model.php
 * User: lrb
 * Date: 13-5-10
 * Time: 上午9:02
 * $m=M(tablename);
 */
class MY_Model extends CI_Model{
    var $table;
    var $PK='id';
    var $userid;

    function __construct($table=''){
        parent::__construct();
        if($table!=''){
            $this->table=$table;
        }
        $this->userid=$this->session->userdata['user_id'];
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
     * @param $sql
     * @return mixed
     */
    function query($sql){
        return $this->execute($sql);
    }

    /**
     * @param $sql
     * @return mixed
     */
    function exec($sql){

        return $this->execute($sql);

    }

    /**
     * @param $sql
     * @return mixed
     */
    public function execute($sql)
    {
        return $this->db->query($sql);
    }

    /**
     * @param array $data
     * @return bool
     */
    public function add($data=array()){

        $num=$this->db->insert($this->table,$data);

        if($num>0){
            return $this->db->insert_id();
        }else{
            return false;
        }

    }

    /**
     * @param array $data
     * @param string $where
     * @return mixed
     */
    public function update($data=array(),$where=''){
        $this->get_where($where);
        return $this->db->update($this->table,$data);
    }

    /**
     * @param array $data
     * @param string $where
     * @return mixed
     */
    public function save($data=array(),$where=''){
        return $this->update($data,$where);
    }

    /**
     * @param string $where
     * @return mixed
     */
    public function delete($where=''){
        $this->get_where($where);

        return $this->db->delete($this->table);
    }


    /**
     * @param string $where
     * @param string $field
     * @param string $orderby
     * @return mixed
     */
    public function fetOne($where='',$field='*',$orderby=''){
        $this->db->select($field);
        $this->get_where($where);

        if($orderby!=''){
            $this->db->order_by($orderby);
        }
        $query=$this->db->get($this->table,1,0);
        if($query->num_rows()>0){
            $row=$query->row_array();
            foreach($row as $key=>$val){
                if($val=='0000-00-00'){
                    $row[$key]='';
                }
            }
            return $row;
        }else{
            return false;
        }

    }

    /**
     * @param string $where
     * @param string $field
     * @param string $orderby
     * @param int $offset
     * @param int $limit
     * @return mixed
     */
    public function fetAll($where='',$field='*',$orderby='',$offset=0,$limit=0){
        $this->db->select($field);
        $this->get_where($where);

        if($orderby!=''){
            $this->db->order_by($orderby);
        }

        if($offset>0||$limit>0){
            $query=$this->db->get($this->table,$limit,$offset);
        }else{
            $query=$this->db->get($this->table);
        }

        return $query->result_array();

    }

    /**
     * @param string $sql
     * @return mixed
     */
    public function getOne($sql=''){

        $query=$this->db->query($sql);
        if($query->num_rows()>0){
            $row=$query->row_array();
            foreach($row as $key=>$val){
                if($val=='0000-00-00'){
                    $row[$key]='';
                }
            }
            return $row;
        }else{
            return false;
        }
    }

    /**
     * @param string $sql
     * @return mixed
     */
    public function getAll($sql=''){

        $query=$this->db->query($sql);
        return $query->result_array();
    }

    /**
     * @param $id
     * @param string $field
     * @param bool $orderby
     * @return mixed
     */
    public function find($id,$field='*',$orderby=false){
        return $this->fetOne($id,$field,$orderby);
    }

    /**
     * @param string $where
     * @return string
     */
    public function count($where=''){

        $this->get_where($where);
        return $this->db->count_all_results($this->table);
    }

    /**
     * @return mixed
     */
    public function getField(){

        return $this->db->list_fields($this->table);

    }

    /**
     * @return mixed
     */
    public function getLastId(){
        return $this->db->insert_id();
    }

    /**
     * @name 创建表单
     * @param string $data
     * @return array|bool|string
     */
    public function create($data=''){
        // 如果没有传值默认取POST数据
        if (empty($data)) {
            $data = $_POST;
        } elseif (is_object($data)) {
            $data = get_object_vars($data);
        }
        // 验证数据
        if (empty($data) || !is_array($data)) {
            return false;
        }

        $fields = $this->getField();


        unset($data[$this->PK],$fields[$this->PK]);

        foreach ($data as $key => $val) {
            if(in_array($val,array('--','不清楚','请选择','0000-00-00'))){
                $val='';
            }
            if (!in_array($key, $fields)) {
                unset($data[$key]);
            } elseif (is_string($val)) {
                    $data[$key] = stripslashes($val);
            }

        }

        //处理acode
        if(in_array('acode',$fields)){
            $this->load->config("community");
            $community = $this->config->item('community');
            array_shift($community);
            $userAcode = $this->session->userdata('userAcode');
            if(isset($community[$userAcode])){
                $data['acode'] = $userAcode;
            }

            if(empty($data['acode'])){
                $data['acode']=$userAcode;
            }

        }

        // 返回创建的数据以供其他调用
        return $data;

    }

    private function get_where($where=''){

        if(is_numeric($where)){
            $this->db->where($this->PK,$where);
        }elseif(is_array($where)){
            $this->db->where($where);
        }elseif(is_string($where)){
            if(preg_match('/^[\d,]+$/',$where)){
                $where=$this->PK." in ({$where})";
            }
            if(!empty($where)){
                $this->db->where($where,null,false);
            }
        }else{

        }
    }




}
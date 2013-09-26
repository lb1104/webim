<?php
/**
 * Name: Tool.php
 * User: lrb
 * Date: 13-5-17
 * Time: 下午1:31
 */

class Tool{

    function genSonids($fid,$items,$rt=false) {

        $tmpMap = array(); //临时扁平数据

        foreach ($items as $item) {
            $tmpMap[$item['id']] = $item;
        }
        $result=array();
        if($fid>0){
            $result[]=$fid;
        }

        $this->_getsubid($tmpMap,$fid,$result);

        unset($tmpMap);
        unset($items);

        if($rt){
            return $result;
        }

        return join(',',$result);
    }

    function _getsubid(&$items,$fid=0,&$result){

        foreach ($items as $item){
            if($item['fid']==$fid){
                $result[]=$item['id'];
                $this->_getsubid($items,$item['id'],$result);
            }
        }

    }

    /**
     * 生成tree {id:id,text:'',children:{}}
     * @param $items
     * @param string $id
     * @param string $fid 默认fid
     * @param string $son children
     * @return array
     */
    function genTree($items, $id = 'id', $fid = 'fid', $son = 'children')
    {
        $tree = array(); //格式化的树
        $tmpMap = array(); //临时扁平数据

        foreach ($items as $item) {
            $tmpMap[$item[$id]] = $item;
        }

        foreach ($items as $item) {
            if (isset($tmpMap[$item[$fid]])) {
                $tmpMap[$item[$fid]][$son][] = & $tmpMap[$item[$id]];
            } else {
                $tree[] = & $tmpMap[$item[$id]];
            }
        }
        unset($tmpMap);
        return $tree;
    }

    /**
     * 建立文件夹
     * @param $dir
     * @param int $mode
     * @return bool
     */
    function mk_dir($dir, $mode = 0755)
    {
        if (is_dir($dir) || @mkdir($dir,$mode,true)) return true;
        if (!$this->mk_dir(dirname($dir),$mode)) return false;
        return @mkdir($dir,$mode,true);
    }

}
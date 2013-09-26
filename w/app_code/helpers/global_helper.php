<?php
/**
 * 全局helper
 *
 */


/**
 * 处理社区代码
 * @prama $acode 社区编码
 */
if (!function_exists('handleAcode')) {
    function handleAcode($acode)
    {
        if(substr($acode,-2) == "00"){
            return '\'' . substr($acode,0,-2) . '%\'';
        }
        return '\'' . $acode . '\'';
    }
}

/**
 * 权限判断
 * @prama $purview 权限编码
 */
if (!function_exists('checkPurv')) {
    function checkPurv($purview='')
    {
        $CI = & get_instance();
        if ($CI->session->userdata('userPurvs')) {

            $userPurvs = json_decode($CI->session->userdata('userPurvs'));
            if (in_array('99999', $userPurvs)) { //超级管理员
                return true;
            } else {
                return in_array($purview, $userPurvs);
            }
        }
        return false;
    }
}



//读取XML $xml = join("",file($filePath));
if (!function_exists('xml_to_array')) {
    function xml_to_array($xml)
    {
        $reg = "/<(\\w+)[^>]*?>([\\x00-\\xFF]*?)<\\/\\1>/";
        if (preg_match_all($reg, $xml, $matches)) {
            $count = count($matches[0]);
            $arr = array();
            for ($i = 0; $i < $count; $i++) {
                $key = $matches[1][$i];
                $val = xml_to_array($matches[2][$i]); // 递归
                if (array_key_exists($key, $arr)) {
                    if (is_array($arr[$key])) {
                        if (!array_key_exists(0, $arr[$key])) {
                            $arr[$key] = array($arr[$key]);
                        }
                    } else {
                        $arr[$key] = array($arr[$key]);
                    }
                    $arr[$key][] = $val;
                } else {
                    $arr[$key] = $val;
                }
            }
            return $arr;
        } else {
            return $xml;
        }
    }
}


/**
 * 验证身份证号
 * @param $vStr
 * @return bool
 */
if (!function_exists('isCreditNo')) {
    function isCreditNo($vStr)
    {
        $vCity = array(
            '11', '12', '13', '14', '15', '21', '22',
            '23', '31', '32', '33', '34', '35', '36',
            '37', '41', '42', '43', '44', '45', '46',
            '50', '51', '52', '53', '54', '61', '62',
            '63', '64', '65', '71', '81', '82', '91'
        );

        if (!preg_match('/^([\d]{17}[xX\d]|[\d]{15})$/', $vStr)) return false;

        if (!in_array(substr($vStr, 0, 2), $vCity)) return false;

        $vStr = preg_replace('/[xX]$/i', 'a', $vStr);
        $vLength = strlen($vStr);

        if ($vLength == 18) {
            $vBirthday = substr($vStr, 6, 4) . '-' . substr($vStr, 10, 2) . '-' . substr($vStr, 12, 2);
        } else {
            $vBirthday = '19' . substr($vStr, 6, 2) . '-' . substr($vStr, 8, 2) . '-' . substr($vStr, 10, 2);
        }

        if (date('Y-m-d', strtotime($vBirthday)) != $vBirthday) return false;
        if ($vLength == 18) {
            $vSum = 0;

            for ($i = 17; $i >= 0; $i--) {
                $vSubStr = substr($vStr, 17 - $i, 1);
                $vSum += (pow(2, $i) % 11) * (($vSubStr == 'a') ? 10 : intval($vSubStr, 11));
            }

            if ($vSum % 11 != 1) return false;
        }

        return true;
    }
}


/**
* 新老身份证自动转换
*/
if (!function_exists('idnumUpgrade')){
    function idnumUpgrade($idnum){
        if(preg_match('/^[\d]{15}$/', $idnum)){ //升级
            $n17 = substr_replace($idnum, '19', 6, 0);
            $ns = 0;
            for ($i = 0; $i < 17; $i++) {
                $c = substr($n17, $i, 1);
                $ns += (pow(2, (17-$i)) % 11) * $c;
            }

            $c17 = $ns = 12 - $ns % 11;
            if($ns==10){
                $c17 = 'X';
            }elseif($ns==12){
                $c17 = '1';
            }elseif($ns==11){
                $c17 = '0';
            }
            return $n17.$c17;
        }elseif(preg_match('/^[\d]{17}[xX\d]$/', $idnum)){
            return substr_replace(substr($idnum, 0, -1), '', 6, 2);
        }else{
            return '';
        }
    }
}


if (!function_exists('return_win')) {
    /**
     * 返回信息 json {error:0/1,msg:'',data:''}
     * @param string $msg
     * @param int $error 1为错误,0正确
     * @param string $farr 附加信息 默认data='',or array
     */
    function return_win($msg = '', $error = 1, $farr = '')
    {
        $rt = array('msg' => $msg, 'error' => $error);
        if (is_array($farr)) {
            $rt = array_merge($rt, $farr);
        } elseif ($farr != '') {
            $rt['data'] = $farr;
        }

        exit(json_encode($rt));
    }

}

if (!function_exists('idcard_img_url')) {
    /**
     * 身份者图片地址
     * @param string $idnum
     * @param bool $rt
     * @return string
     */
    function idcard_img_url($idnum = '', $rt = false)
    {

        $photo_file = base_url() . 'static/images/tx_img.gif';
        if ($rt) {
            $photo_file = 'static/images/tx_img.gif';
        }

        $bmp_tmp = 'photos/' . $idnum . '.bmp';

        if (file_exists(FCPATH . $bmp_tmp)) {
            $photo_file = base_url() . $bmp_tmp;
            if ($rt) {
                $photo_file = $bmp_tmp;
            }
        }
        return $photo_file;

    }

}


if (!function_exists('guid')) {
    /**
     * 生成GUID {xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}
     * @return string
     */
    function guid()
    {
        if (function_exists('com_create_guid')) {
            return com_create_guid();
        }

        mt_srand((double)microtime() * 10000);
        $charid = strtoupper(md5(uniqid(rand(), true)));
        $hypen = chr(45); //"-"
        $uuid = chr(123) //"{"
            . substr($charid, 0, 8) . $hypen
            . substr($charid, 8, 4) . $hypen
            . substr($charid, 12, 4) . $hypen
            . substr($charid, 16, 4) . $hypen
            . substr($charid, 20, 12) . $hypen
            . chr(125);

        return $uuid;
    }


}


if (!function_exists('checkmobile')) {
    /**
     * 检查电话号码格式正确
     * @param $phone
     * @return int
     */
    function checkmobile($phone)
    {
        return preg_match('/^((\(\d{2,3}\))|(\d{3}\-))?1[3458]\d{9}$/', $phone);
    }
}




if (!function_exists('getConfig')) {
    /**
     * 获取系统配置参数
     * @param $key
     * @return $value
     */
    function getConfig($key)
    {
        $CI = & get_instance();
        $result = $CI->db->select('value')->where("key",$key)->get('config')->row_array();
        if(empty($result)){
            return false;
        }else{
            return $result['value'];
        }
    }
}

if (!function_exists('my_pathinfo')) {
    /**
     * 处理utf8 路径中含中文,pathinfo被忽略
     * @param $filepath
     * @return array
     */
    function my_pathinfo($filepath) {
        $ret=array();
        preg_match('%^(.*?)[\\\\/]*(([^/\\\\]*?)(\.([^\.\\\\/]+?)|))[\\\\/\.]*$%im',$filepath,$m);
        if($m[1]) $ret['dirname']=$m[1];
        if($m[2]) $ret['basename']=$m[2];
        if($m[5]) $ret['extension']=$m[5];
        if($m[3]) $ret['filename']=$m[3];
        return $ret;
    }
}

if (!function_exists('returngztime')) {
    /**
     * 日志系统工作时间转换用
     * 1-15 解析为1小时15分钟
     * @param string $gztime
     * @return string
     */
    function returngztime($gztime = '')
    {

        $tarr = explode('-', $gztime);
        $str = '';
        if ($tarr[0] > 0) {
            $str = $tarr[0] . '小时';
        }
        if ($tarr[1] > 0) {
            $str .= $tarr[1] . '分钟';
        }
        return $str;
    }
}
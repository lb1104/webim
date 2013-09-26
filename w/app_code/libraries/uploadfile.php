<?php
/**
 * 上传文件
 * @author: hfox
 * @prama: $fileDir => 文件保存目录
 * @prama: $fileTypes => 允许上传类型
 * @prama: $noRepeat => 不允许重复文件覆盖
 * @return: 数组array('filePath'=>文件路径) 或 array('error'=>错误提示)
 */
class UploadFile
{
    function upload($fileDir = 'static/uploads', $fileTypes = array(),$noRepeat=false)
    {
        $fileElementName = $_POST['fileElementName'];
        $tempFile = $_FILES[$fileElementName];

        $error = "";
        if (!empty($tempFile['error'])) {
            switch ($tempFile['error']) {
                case '1':
                    $error = '传的文件超过了 php.ini 中 upload_max_filesize 选项限制的值';
                    break;
                case '2':
                    $error = '上传文件的大小超过了 HTML 表单中 MAX_FILE_SIZE 选项指定的值';
                    break;
                case '3':
                    $error = '文件只有部分被上传';
                    break;
                case '4':
                    $error = '没有文件被上传';
                    break;
                case '6':
                    $error = '找不到临时文件夹';
                    break;
                case '7':
                    $error = '文件写入失败';
                    break;
                case '8':
                    $error = 'File upload stopped by extension';
                    break;
                case '999':
                default:
                    $error = '未知错误';
            }
        } elseif (empty($tempFile['tmp_name']) || $tempFile['tmp_name'] == 'none') {
            $error = '没有上传文件';
        } else {
            if($fileTypes!='*'){

                if (!is_array($fileTypes) || empty($fileTypes)) {
                    $fileTypes = array('xls', 'jpg');
                }
                $fileParts = pathinfo($tempFile['name']);
                if (!in_array($fileParts['extension'], $fileTypes)) {
                    $error = '不允许上传的文件类型';
                }
            }
        }

        //保存文件
        if (empty($error)) {
            file_exists($fileDir) OR mkdir($fileDir);
            $fileName = $tempFile['name'];
            $filePath = $fileDir . '/' . $fileName;

            if($noRepeat){
                $filePath = $this->getNoRepeatFile($filePath,1,$filePath);
            }
            $ok = @move_uploaded_file($tempFile['tmp_name'], iconv('utf-8', 'gb2312', $filePath));
            @unlink($tempFile);
            if ($ok) {
                return array('filePath' => $filePath,'filename'=>$fileName);
            } else {
                return array('error' => '文件移动失败');
            }
        } else {
            return array('error' => $error);
        }

    }

    function getNoRepeatFile($filePath = '',$num=1,$newfilePath='')
    {
        $filePath2=iconv('utf-8', 'gb2312', $newfilePath);
        if (file_exists(FCPATH . $filePath2)) {

            $path_parts=my_pathinfo($filePath);

            $newfilePath=$path_parts["dirname"].'/'.$path_parts['filename'].'-'.$num.'.'.$path_parts["extension"];
            $num++;
            $newfilePath = $this->getNoRepeatFile($filePath,$num,$newfilePath);
        }
        return $newfilePath;

    }

    function delfile($filepath=''){

        $filePath2=iconv('utf-8', 'gb2312', $filepath);
        if(file_exists(FCPATH.$filePath2)){
            @unlink(FCPATH.$filePath2);
        }

    }

}
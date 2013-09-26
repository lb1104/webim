<?php  if (!defined('BASEPATH')) exit('No direct script access allowed');

class Validationcode {
    private $width, $height, $codenum;  //验证码宽度、高度、位数
    public $code;  //产生的验证码
    private $codeimage;  //验证码图片
    private $distrubcolor;  //干扰像素

    //析构函数，设置验证码宽度、高度、位数
    function __construct($width = '80', $height = '28', $codenum = '4') {
        $this->width = $width;
        $this->height = $height;
        $this->codenum = $codenum;
    }

    //输出验证码图片
    public function outImage() {
        $this->outFileHeader();
        $this->createCode();
        $this->createImage();
        $this->setDistrubColor();
        $this->writeCodeImage();
        imagepng($this->codeimage);
        imagedestroy($this->codeimage);
    }

    //验证码输出头
    public function outFileHeader() {
        header('Content-type: image/png');
    }

    //产生验证码
    public function createCode() {
        $str = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHIJKLMNPQRSTUVW";
        $code = '';

        for($i = 0; $i < $this->codenum; $i ++) {
            $code .= $str [mt_rand ( 0, strlen ( $str ) - 1 )];
        }

        $this->code = $code;
    }

    //产生验证码图片
    public function createImage() {
        $this->codeimage = @imagecreate($this->width, $this->height);  //新建一个基于调色板的图像
        imagecolorallocate($this->codeimage, 200, 200, 200);  //为新建的图像分配颜色
    }

    //设置图片干扰像素
    public function setDistrubColor() {
        for ($i = 0; $i < 128; $i++) {
            $this->distrubcolor = imagecolorallocate($this->codeimage, rand(0, 255), rand(0, 255), rand(0, 255));
            imagesetpixel($this->codeimage, rand(2, 128), rand(2, 38), $this->distrubcolor);  //画上干扰点
        }
    }

    //在背景上逐个画上验证码
    public function writeCodeImage() {
        for ($i = 0; $i < $this->codenum; $i++) {
            $bg_color = imagecolorallocate($this->codeimage, rand(0, 255), rand(0, 128), rand(0, 255));
            $x = 3+floor($this->width / $this->codenum) * $i;
            imagefttext ( $this->codeimage, 16,0, $x, 23, $bg_color, BASEPATH.'/fonts/verdana.ttf', $this->code[$i] );
            //imagechar($this->codeimage, 5, $x, $y, $this->code[$i], $bg_color);
        }
    }

}
 
 
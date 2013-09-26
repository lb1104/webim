<?php
/**
 * Name: model_helper.php
 * User: lrb
 * Date: 13-5-10
 * Time: 上午9:36
 */


if(!function_exists('M')){

    /**
     * @param string $table
     * @return MY_Model
     * @property MY_Model
     */
    function M($table=''){

        static $_Mclass=array();

        if(isset($_Mclass[$table])){
            return $_Mclass[$table];
        }

        if(!class_exists('CI_Model')){
            load_class('Model','core');
        }

        $name=FALSE;

        /*引入 MY_Model*/
        $class='Model';
        $directory='core';
        if (file_exists(APPPATH.$directory.'/'.config_item('subclass_prefix').$class.'.php'))
        {
            $name = config_item('subclass_prefix').$class;

            if (class_exists($name) === FALSE)
            {
                require(APPPATH.$directory.'/'.$name.'.php');
            }
        }

        /*引入 models/tablename_model*/
        $prefix='_model';
        $directory='models';
        if (file_exists(APPPATH.$directory.'/'.$table.$prefix.'.php'))
        {
            $name = $table.$prefix;

            if (class_exists($name) === FALSE)
            {
                require(APPPATH.$directory.'/'.$name.'.php');
            }
        }

        if($name===FALSE){
            exit("not find Model:".$table." ");
        }

        $_Mclass[$table]=new $name($table);

        return $_Mclass[$table];

    }

}
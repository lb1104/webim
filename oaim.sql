/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50524
Source Host           : localhost:3306
Source Database       : oaim

Target Server Type    : MYSQL
Target Server Version : 50524
File Encoding         : 65001

Date: 2013-09-24 16:17:20
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `ci_sessions`
-- ----------------------------
DROP TABLE IF EXISTS `ci_sessions`;
CREATE TABLE `ci_sessions` (
  `session_id` varchar(40) NOT NULL DEFAULT '0',
  `ip_address` varchar(45) NOT NULL DEFAULT '0',
  `user_agent` varchar(120) NOT NULL,
  `last_activity` int(10) unsigned NOT NULL DEFAULT '0',
  `user_data` text NOT NULL,
  PRIMARY KEY (`session_id`),
  KEY `last_activity_idx` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of ci_sessions
-- ----------------------------
INSERT INTO `ci_sessions` VALUES ('172f2c221a56d2e9ab9310ba61db7e08', '127.0.0.1', 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.57 Safari/537.36', '1380009586', 'a:7:{s:9:\"user_data\";s:0:\"\";s:14:\"validationcode\";s:4:\"GjJA\";s:7:\"user_id\";s:2:\"24\";s:8:\"userRole\";N;s:9:\"userAcode\";s:10:\"0100010100\";s:10:\"user_uname\";s:4:\"test\";s:13:\"user_realname\";s:12:\"测试人员\";}');
INSERT INTO `ci_sessions` VALUES ('23111a28020476d6741a716ef1d73ad3', '127.0.0.1', 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.15 Safari/537.36', '1380004169', 'a:7:{s:9:\"user_data\";s:0:\"\";s:14:\"validationcode\";s:4:\"7uQa\";s:7:\"user_id\";s:1:\"4\";s:8:\"userRole\";N;s:9:\"userAcode\";s:10:\"0100010100\";s:10:\"user_uname\";s:5:\"admin\";s:13:\"user_realname\";s:15:\"超级管理员\";}');
INSERT INTO `ci_sessions` VALUES ('385a35f537c3c12fdf9674fb0bb180d0', '127.0.0.1', 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; WOW64; Trident/6.0; QQBrowser/7.4.14018.400)', '1380009125', 'a:7:{s:9:\"user_data\";s:0:\"\";s:14:\"validationcode\";s:4:\"CKLs\";s:7:\"user_id\";s:1:\"4\";s:8:\"userRole\";N;s:9:\"userAcode\";s:10:\"0100010100\";s:10:\"user_uname\";s:5:\"admin\";s:13:\"user_realname\";s:15:\"超级管理员\";}');
INSERT INTO `ci_sessions` VALUES ('6dc12df47511527772789b6223d7ef9e', '127.0.0.1', 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; WOW64; Trident/6.0)', '1380010311', 'a:7:{s:9:\"user_data\";s:0:\"\";s:14:\"validationcode\";s:4:\"NKV2\";s:7:\"user_id\";s:1:\"4\";s:8:\"userRole\";N;s:9:\"userAcode\";s:10:\"0100010100\";s:10:\"user_uname\";s:5:\"admin\";s:13:\"user_realname\";s:15:\"超级管理员\";}');
INSERT INTO `ci_sessions` VALUES ('d5e3601a208bbd897bbd5d6edbacc78a', '127.0.0.1', 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.15 Safari/537.36', '1380003959', 'a:8:{s:9:\"user_data\";s:0:\"\";s:14:\"validationcode\";s:4:\"LJ5D\";s:7:\"user_id\";s:1:\"4\";s:9:\"userPurvs\";s:1433:\"[\"10101\",\"10102\",\"10103\",\"10104\",\"10105\",\"10106\",\"10107\",\"10108\",\"10109\",\"10201\",\"10202\",\"10203\",\"10204\",\"10205\",\"10206\",\"10301\",\"10302\",\"10303\",\"10304\",\"10305\",\"10401\",\"10402\",\"10403\",\"10404\",\"10405\",\"10406\",\"10501\",\"10502\",\"10503\",\"10504\",\"10601\",\"10602\",\"10603\",\"10701\",\"10702\",\"10703\",\"10704\",\"10705\",\"10706\",\"10707\",\"10708\",\"10709\",\"10710\",\"10711\",\"10712\",\"10801\",\"10802\",\"10803\",\"10804\",\"10805\",\"10901\",\"10902\",\"10903\",\"10904\",\"10905\",\"10906\",\"11001\",\"11002\",\"11003\",\"11101\",\"11102\",\"11103\",\"11104\",\"11105\",\"11106\",\"11107\",\"11108\",\"11109\",\"11110\",\"11111\",\"11112\",\"11201\",\"11202\",\"11203\",\"11204\",\"11301\",\"11302\",\"11303\",\"11304\",\"11401\",\"11402\",\"11403\",\"11501\",\"11502\",\"11503\",\"11504\",\"11601\",\"11602\",\"11603\",\"11604\",\"11701\",\"11702\",\"11703\",\"11704\",\"11705\",\"11706\",\"11801\",\"11802\",\"11803\",\"11804\",\"11805\",\"11806\",\"11901\",\"11902\",\"11903\",\"11904\",\"12001\",\"12002\",\"12003\",\"12004\",\"12005\",\"12006\",\"12007\",\"12008\",\"12009\",\"12010\",\"12011\",\"12012\",\"12013\",\"12014\",\"12101\",\"12102\",\"12103\",\"12201\",\"12202\",\"12203\",\"12204\",\"12301\",\"12302\",\"12303\",\"12304\",\"12305\",\"12306\",\"12307\",\"12308\",\"12309\",\"12310\",\"12311\",\"12312\",\"12313\",\"12314\",\"12315\",\"12316\",\"12317\",\"12318\",\"12401\",\"12402\",\"12403\",\"12404\",\"12405\",\"12406\",\"12407\",\"12408\",\"12409\",\"12501\",\"12502\",\"12503\",\"12504\",\"12505\",\"12506\",\"12601\",\"12602\",\"12603\",\"12604\",\"12605\",\"12606\",\"12607\",\"12701\",\"12702\",\"12703\",\"12704\",\"12801\",\"12802\",\"12803\",\"20200\",\"20300\",\"20400\",\"30101\",\"99999\"]\";s:8:\"userRole\";s:1:\"1\";s:9:\"userAcode\";s:10:\"0100010100\";s:10:\"user_uname\";s:5:\"admin\";s:13:\"user_realname\";s:15:\"超级管理员\";}');
INSERT INTO `ci_sessions` VALUES ('febc9bd2309aec70cee93d707f1709e1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 6.2; WOW64; rv:22.0) Gecko/20100101 Firefox/22.0', '1380006464', 'a:7:{s:9:\"user_data\";s:0:\"\";s:14:\"validationcode\";s:4:\"UBAs\";s:7:\"user_id\";s:1:\"4\";s:8:\"userRole\";N;s:9:\"userAcode\";s:10:\"0100010100\";s:10:\"user_uname\";s:5:\"admin\";s:13:\"user_realname\";s:15:\"超级管理员\";}');

-- ----------------------------
-- Table structure for `department`
-- ----------------------------
DROP TABLE IF EXISTS `department`;
CREATE TABLE `department` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `pid` int(11) NOT NULL COMMENT '父级ID',
  `name` varchar(50) NOT NULL COMMENT '角色名称',
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sort` int(11) DEFAULT '0' COMMENT '排序',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=43 DEFAULT CHARSET=utf8 COMMENT='角色';

-- ----------------------------
-- Records of department
-- ----------------------------
INSERT INTO `department` VALUES ('2', '1', '社保所', '2013-09-24 15:06:10', '3');
INSERT INTO `department` VALUES ('3', '1', '城管科', '2013-09-24 15:06:06', '2');
INSERT INTO `department` VALUES ('5', '1', '街道领导', '2013-09-24 15:06:08', '1');
INSERT INTO `department` VALUES ('1', '0', '街道', '2013-09-24 15:04:57', '1');

-- ----------------------------
-- Table structure for `oa_im_msg`
-- ----------------------------
DROP TABLE IF EXISTS `oa_im_msg`;
CREATE TABLE `oa_im_msg` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fcid` int(11) NOT NULL DEFAULT '0' COMMENT '发出人uid',
  `fcname` varchar(50) DEFAULT NULL COMMENT '发出人昵称',
  `ztitle` varchar(255) DEFAULT NULL COMMENT '信息标题',
  `msg` text COMMENT '消息内容',
  `fujian` text COMMENT '附件json',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC COMMENT='通讯IM';

-- ----------------------------
-- Records of oa_im_msg
-- ----------------------------
INSERT INTO `oa_im_msg` VALUES ('1', '4', '超级管理员', '超级管理员 - 2013-09-24 16:12:17', 'cs', '\"\"');
INSERT INTO `oa_im_msg` VALUES ('2', '4', '超级管理员', '超级管理员 - 2013-09-24 16:12:50', 'cs', '\"\"');
INSERT INTO `oa_im_msg` VALUES ('3', '24', '测试人员', '测试人员 - 2013-09-24 16:12:56', '12', '\"\"');
INSERT INTO `oa_im_msg` VALUES ('4', '4', '超级管理员', '超级管理员 - 2013-09-24 16:13:03', '112', '\"\"');
INSERT INTO `oa_im_msg` VALUES ('5', '4', '超级管理员', '超级管理员 - 2013-09-24 16:13:15', '1545', '\"\"');
INSERT INTO `oa_im_msg` VALUES ('6', '24', '测试人员', '测试人员 - 2013-09-24 16:13:22', 'asd', '\"\"');

-- ----------------------------
-- Table structure for `oa_im_msg_js`
-- ----------------------------
DROP TABLE IF EXISTS `oa_im_msg_js`;
CREATE TABLE `oa_im_msg_js` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sid` int(11) NOT NULL DEFAULT '0',
  `jsid` int(11) NOT NULL DEFAULT '0',
  `fcid` int(11) NOT NULL DEFAULT '0',
  `fc` tinyint(1) NOT NULL DEFAULT '0',
  `fctime` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `sid` (`sid`) USING BTREE,
  KEY `jsid` (`jsid`) USING BTREE,
  KEY `fcid` (`fcid`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 ROW_FORMAT=FIXED;

-- ----------------------------
-- Records of oa_im_msg_js
-- ----------------------------
INSERT INTO `oa_im_msg_js` VALUES ('1', '1', '24', '4', '1', '1380010337');
INSERT INTO `oa_im_msg_js` VALUES ('2', '2', '24', '4', '1', '1380010370');
INSERT INTO `oa_im_msg_js` VALUES ('3', '3', '4', '24', '1', '1380010376');
INSERT INTO `oa_im_msg_js` VALUES ('4', '4', '24', '4', '1', '1380010383');
INSERT INTO `oa_im_msg_js` VALUES ('5', '5', '24', '4', '1', '1380010395');
INSERT INTO `oa_im_msg_js` VALUES ('6', '6', '4', '24', '1', '1380010402');

-- ----------------------------
-- Table structure for `user`
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `uname` varchar(10) NOT NULL COMMENT '用户名',
  `pwd` char(32) NOT NULL COMMENT '密码',
  `role` varchar(100) DEFAULT NULL COMMENT '角色',
  `realname` varchar(20) DEFAULT NULL COMMENT '真实姓名',
  `sex` char(8) DEFAULT NULL COMMENT '性别',
  `position` varchar(30) DEFAULT NULL COMMENT '职位',
  `status` char(1) DEFAULT '0' COMMENT '状态',
  `department` int(11) DEFAULT NULL,
  `linklist` text COMMENT '专业系统链接',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `phone` varchar(30) DEFAULT NULL COMMENT '电话',
  `acode` varchar(12) DEFAULT NULL COMMENT '社区',
  `national` varchar(20) DEFAULT NULL,
  `degree` varchar(10) DEFAULT NULL,
  `birthday` varchar(20) DEFAULT NULL,
  `nativeplace` varchar(50) DEFAULT NULL,
  `canjiagztime` varchar(20) DEFAULT NULL,
  `political` varchar(50) DEFAULT NULL,
  `shenfen` varchar(50) DEFAULT NULL,
  `type` int(4) DEFAULT NULL COMMENT '人员类型 字节位表示(在职员工|系统用户)',
  `note` varchar(200) DEFAULT NULL COMMENT '描述',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=138 DEFAULT CHARSET=utf8 COMMENT='系统用户表';

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES ('4', 'admin', 'f6fdffe48c908deb0f4c3bd36c032e72', '1', '超级管理员', '男', '全能', '1', '2', '', '2013-09-24 15:05:42', '', '0100010100', null, null, null, null, null, null, null, '1', '');
INSERT INTO `user` VALUES ('24', 'test', '05a671c66aefea124cc08b76ea6d30bb', '5,23', '测试人员', '男', '测试', '1', '3', null, '2013-09-24 15:57:58', '', '0100010100', null, null, null, null, null, null, null, '1', null);
INSERT INTO `user` VALUES ('25', 'adm', 'fa61db9a31f047795b62b65ac357cb14', '1', '他啊是', '男', '经理', '1', '5', null, '2013-09-24 15:58:41', null, '0100010100', '', '', '', '', '', '', '', '3', null);
INSERT INTO `user` VALUES ('26', 'jq', 'a50554c58053241cb99031d78a4cd049', '1', '阿斯顿', '女', '工程师', '1', '5', null, '2013-09-24 15:58:45', null, '0100010100', '', '', '', '', '', '', '', '3', null);
INSERT INTO `user` VALUES ('27', 'lj', 'e14e3304e11894a5c27acea365588cf5', '1', '大的', '男', '工程师', '1', '2', null, '2013-09-24 15:58:24', '', '0100010100', null, null, null, null, null, null, null, '1', null);

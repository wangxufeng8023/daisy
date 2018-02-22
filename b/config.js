/**
 * @file 后台个人配置文件。
 * @author ruoshui_engr@163.com (Angela-1)
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 * 
 * © 2017 Angela 版权所有。代码开源仅用于学术交流分享，商业使用请联系作者。
 */

'use strict';

/*
 * MongoDB 连接地址
 */
const host = 'mongodb://localhost:27017';

let Setting = require('./modules/setting');

const config = {
  service: {
    host,
    dbUrl: `${host}/sanitation`,
    setting: {
      dateRange: Setting.parseSetting().dateRange,
      schoolterm: Setting.parseSetting().schoolterm,
    },
  },
};

module.exports = config;

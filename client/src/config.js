/**
 * @file 个人的配置文件。
 * @author ruoshui_engr@163.com (Angela-1)
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 *
 * © 2017 Angela 版权所有。代码开源仅用于学术交流分享，商业使用请联系作者。
 */

'use strict'

/*
 * 测试用后台的地址，生产环境自动设置为空
 */
var host = 'http://127.0.0.1:8001'

if (process.env.NODE_ENV === 'production') {
  host = ''
}

var config = {
  service: {
    host,
    apiUrl: `${host}/api/v2`
  }
}

module.exports = config

/**
 * @file 设置模块，包括数据显示范围、备份。
 * @author ruoshui_engr@163.com (Angela-1)
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 * 
 * © 2017 Angela 版权所有。代码开源仅用于学术交流分享，商业使用请联系作者。
 */

'use strict';

let fs = require('fs');
let path = require('path');
let moment = require('moment');
let spawn = require('child_process').spawn;

let configFile = path.join(__dirname, '/../setting.json');

/**
 * 配置类，读取、保存配置参数。
 */
class Setting {
  /**
   * 解析配置文件为对象。
   * @return {Object} 配置对象。
   */
  static parseSetting() {
    let result = JSON.parse(fs.readFileSync(configFile));
    return result;
  }
  /**
   * 保存配置到文件。
   * @param  {Object} configObj 配置对象。
   */
  static saveSetting(configObj) {
    fs.writeFileSync(configFile, JSON.stringify(configObj, null, 4));
  }
  /**
   * 备份数据。
   * @param  {string} collection 集合名称。
   */
  static backupData(collection) {
    let resultFilePath = path.posix.join(__dirname, '../public/backup/', moment().format('YYYYMMDD'), collection + '_' +
      moment().format('YYYYMMDD') + '.json');
    spawn('mongoexport', [ '-d', 'sanitation', '-c', collection, '-o', resultFilePath, ]);
    // let mongoexport = spawn('mongoexport', ['-d', 'sanitation', '-c', 'daily', '-o', resultFilePath]);
    // // 捕获标准输出并将其打印到控制台 
    // mongoexport.stdout.on('data', function(data) {
    //   console.log('standard output:\n' + data);
    // });
    // // 捕获标准错误输出并将其打印到控制台 
    // mongoexport.stderr.on('data', function(data) {
    //   console.log('standard error output:\n' + data);
    // });
    // // 注册子进程关闭事件 
    // mongoexport.on('exit', function(code, signal) {
    //   console.log('child process eixt ,exit:' + code);
    // });
    return resultFilePath;
  }
}

/**
 * 导出设置类。
 * @type {Setting}
 */
module.exports = Setting;

/**
 * @file 导出报表的 Word 文档生成处理模块。
 * @author ruoshui_engr@163.com (Angela-1)
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 * 
 * © 2017 Angela 版权所有。代码开源仅用于学术交流分享，商业使用请联系作者。
 */
'use strict';
let fs = require('fs');
let os = require('os');
let Docxtemplater = require('docxtemplater');
let JSZip = require('jszip');
let path = require('path');
let moment = require('moment');
let childProcess = require('child_process');
let config = require('../config');
const schoolterm = config.service.setting.schoolterm;
/**
 * 导出的文档类，提供情况表和通报表两种样式。
 */
class Template {
  /**
   * 构造函数
   * @param  {string} target_file 生成的文件全名
   * @param  {object} data     包含数据
   * @return {this}          自己
   */
  constructor(type) {
    this._type = type;   
  }
  /* getter and setter */
  get type() {
    return this._type;
  };
  set type(type) {
    this._type = type;
  };
  /**
   * 检测生成的文件是否存在。
   * @param  {string} filePath 生成的 pdf 文件绝对路径
   * @return {string}      生成的 pdf 文件绝对路径
   */
  static _exists(filePath) {
    return new Promise((resolve, reject) => {
      fs.stat(filePath, (err, stats) => {
        if (err) {
          reject(err);
        } else {
          if (stats.isFile()) {
            resolve(filePath);
          } else {
            reject(err);
          }
        }
      });
    });
  }
}
/**
 * 导出报表模块类。
 * @type {Template}
 */
module.exports = Template;
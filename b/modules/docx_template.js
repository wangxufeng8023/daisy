/**
 * @file 导出报表的 Word 文档生成处理模块。
 * @author ruoshui_engr@163.com (Angela-1)
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 *
 * © 2017 Angela 版权所有。代码开源仅用于学术交流分享，商业使用请联系作者。
 */
'use strict';
let fs = require('fs');
let Docxtemplater = require('docxtemplater');
let JSZip = require('jszip');
let path = require('path');
let moment = require('moment');
let config = require('../config');
let Template = require('./template2');
const schoolterm = config.service.setting.schoolterm;
const resourcePath = path.join(__dirname, '/../public/resource/');

/**
 * 导出的文档类，提供情况表和通报表两种样式。
 */
class DocxTemplate extends Template {
  /**
   * 构造函数
   * @param  {string} target_file 生成的文件全名
   * @param  {object} data     包含数据
   * @return {this}          自己
   */
  constructor(type, data) {
    super(type);
    this.init(data);
  }

  init(data) {
    this._data = data;
    this._data['schoolterm'] = schoolterm;
    let types = new Map();
    types.set('report', {
      title: `高${data.grade}届${schoolterm}第${data.week}周${data.sex}宿舍内务卫生情况表_` +
        moment().format('YYYY-MM-DD'),
      templateFilePath: resourcePath + 'report_v2.0.docx',
    });
    types.set('notice', {
      title: `高${data.grade}届${schoolterm}第${data.week}周宿舍内务卫生通报批评_` +
        moment().format('YYYY-MM-DD'),
      templateFilePath: resourcePath + 'notice_v3.0.docx',
    });
    types.set('dormitory', {
      title: `高${data.grade}届班级宿舍情况_` + moment().format('YYYY-MM-DD'),
      templateFilePath: resourcePath + 'dormitory_v1.0.docx',
    });
    this._types = types;
  }

  /**
   * 生成表。
   * @param  {Object} data 内务检查数据
   * @return {string}      生成文件的本地路径
   */
  generate() {
    return new Promise((resolve, reject) => {
      // let type = this._types.get(this._type);
      let title = this._types.get(this._type).title;
      // let style = type[this._style].title;
      let templateFile = this._types.get(this._type).templateFilePath;
      let data = this._data;

      let newDateFormat = moment(data.date).format('YYYY年M月D日');
      data.date = newDateFormat;
      fs.readFile(templateFile, 'binary', (err, content) => {
        if (err) {
          reject(err);
        } else {
          let zip = new JSZip(content);
          let doc = new Docxtemplater().loadZip(zip);
          doc.setData(data);
          doc.render();
          let buf = doc.getZip().generate({
            type: 'nodebuffer',
          });
          let archivePath = path.posix.join(__dirname, '/../public/archive/');
          const resultFilePath = `${archivePath}${title}.docx`;
          fs.writeFile(resultFilePath, buf, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(resultFilePath);
            }
          });
        }
      });
    });
  }
}
/**
 * 导出报表模块类。
 * @type {Template}
 */
module.exports = DocxTemplate;

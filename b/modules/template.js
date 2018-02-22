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
   * 生成一年级一周的男生或女生内务检查情况表。
   * @param  {Object} data 内务检查数据
   * @return {string}      生成文件的本地路径
   */
  static report(data) {
    return new Promise((resolve, reject) => {
      const templateFilePath = path.join(__dirname,
        '../public/resource/report_v2.0.docx');
      fs.readFile(templateFilePath, 'binary', (err, content) => {
        if (err) {
          reject(err);
        } else {
          let zip = new JSZip(content);
          let doc = new Docxtemplater().loadZip(zip);
          doc.setData({
            'grade': data.grade,
            'week': data.week,
            'sex': data.sex,
            'row': data.rooms,
            'date': moment().format('YYYY年M月D日'),
            'schoolterm': schoolterm,
          });
          doc.render();
          let buf = doc.getZip()
            .generate({
              type: 'nodebuffer',
            });
          const resultFilePath = path.posix.join(__dirname, '../public/archive/',
            `高${data.grade}届${schoolterm}第${data.week}周${data.sex}宿舍内务卫生情况表_` +
            moment().format('YYYY-MM-DD') + '.docx');
          fs.writeFile(resultFilePath, buf, async (err) => {
            if (err) {
              reject(err);
            } else {
              if (os.platform() === 'win32') {
                let pdfNotice = await this._convert(resultFilePath);
                resolve(pdfNotice);
              } else {
                resolve(resultFilePath);
              }
            }
          });
        }
      });
    });
  }


  /**
   * 生成一个年级宿舍情况表。
   * @param  {Object} data 班级宿舍数据
   * @return {string}      生成的文件的本地路径
   */
  static dormitory(data) {
    return new Promise((resolve, reject) => {
      let templateFilePath = '';
      let resultFileName = '';

      templateFilePath = path.join(__dirname,
        '../public/resource/dormitory_v1.0.docx');
      resultFileName = `高${data.grade}届班级宿舍情况_`;
      
      fs.readFile(templateFilePath, 'binary', (err, content) => {
        if (err) {
          reject(err);
        } else {
          let zip = new JSZip(content);
          let doc = new Docxtemplater().loadZip(zip);
          doc.setData({
            'grade': data.grade,
            'week': data.week,
            'good_rooms': data.goodRooms,
            'two_problem_rooms': data.twoProblemRooms,
            'date': moment().format('YYYY年M月D日'),
            'schoolterm': schoolterm,
          });
          doc.render();
          let buf = doc.getZip()
            .generate({
              type: 'nodebuffer',
            });
          const noticeFilePath = path.posix.join(__dirname,
            '../public/archive/', resultFileName +
            moment().format('YYYY-MM-DD') + '.docx');
          fs.writeFile(noticeFilePath, buf, async (err) => {
            if (err) {
              reject(err);
            } else {
              if (os.platform() === 'win32') {
                let pdfNotice = await this._convert(noticeFilePath);
                resolve(pdfNotice);
              } else {
                resolve(noticeFilePath);
              }
            }
          });
        }
      });
    });
  }
  /**
   * 生成一个年级一周的通报批评表，批评出现三次及以上问题的班级宿舍。
   * @param  {Object} data 内务检查数据
   * @return {string}      生成的文件的本地路径
   */
  static notice(data) {
    return new Promise((resolve, reject) => {
      let templateFilePath = '';
      let resultFileName = '';

      templateFilePath = path.join(__dirname,
        '../public/resource/notice_v3.0.docx');
      resultFileName = `高${data.grade}届${schoolterm}第${data.week}周宿舍内务卫生通报批评_`;
     
      fs.readFile(templateFilePath, 'binary', (err, content) => {
        if (err) {
          reject(err);
        } else {
          let zip = new JSZip(content);
          let doc = new Docxtemplater().loadZip(zip);
          doc.setData({
            'grade': data.grade,
            'week': data.week,
            'maleproblems': data.maleproblems,
            'femaleproblems': data.femaleproblems,
            'date': moment().format('YYYY年M月D日'),
            'schoolterm': schoolterm,
          });
          doc.render();
          let buf = doc.getZip()
            .generate({
              type: 'nodebuffer',
            });
          const noticeFilePath = path.posix.join(__dirname,
            '../public/archive/', resultFileName +
            moment().format('YYYY-MM-DD') + '.docx');
          fs.writeFile(noticeFilePath, buf, async (err) => {
            if (err) {
              reject(err);
            } else {
              if (os.platform() === 'win32') {
                let pdfNotice = await this._convert(noticeFilePath);
                resolve(pdfNotice);
              } else {
                resolve(noticeFilePath);
              }
            }
          });
        }
      });
    });
  }
  /**
   * 检测生成的 pdf 文件是否存在。
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
  /**
   * 转换 docx 为 pdf 文件，使用 VB 脚本操作 Word 实现。
   * @param  {string} filePath 生成 pdf 文件绝对路径
   * @return {string}      生成的 pdf 文件绝对路径
   */
  static _convert(filePath) {
    return new Promise((resolve, reject) => {
      let absFilePath = path.resolve(filePath);
      let resultFilePath = filePath.split('.')[0] + '.pdf';
      let convertScript = path.resolve(
        path.join(__dirname, '/convert.vbs'));
      childProcess.exec(convertScript + ' ' + absFilePath,
        async (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else {
            let fp = await this._exists(resultFilePath);
            resolve(fp);
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

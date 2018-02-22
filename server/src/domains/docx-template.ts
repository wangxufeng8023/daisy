#!/usr/bin/env node

/**
 * @file 班级宿舍控制器
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 * 
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */


import * as fs from "fs"
import * as path from "path"
import * as JSZip from "jszip"
import * as moment from "moment"

import { DaisyConfig } from "../types/daisy"

let Docxtemplater = require('docxtemplater')

const config: DaisyConfig = require('../config/daisyconfig.json')
const schoolterm = config.schoolterm
const resourcePath = path.join(__dirname, '/../public/resource/')

/**
 * 导出的文档类，提供情况表和通报表两种样式。
 */
class DocxTemplate {
  _types: Map<string, any>
  _data: any
  _type: string
  /**
   * 构造函数
   * @param  {string} target_file 生成的文件全名
   * @param  {object} data     包含数据
   * @return {this}          自己
   */
  constructor(type: any, data: any) {
    this._type = type
    this._types = new Map<string, any>()
    this.init(data)
  }

  /* getter and setter */
  get type(): string {
    return this._type
  }
  set type(type) {
    this._type = type
  }
  /**
   * 检测生成的文件是否存在。
   * @param  {string} filePath 生成的 pdf 文件绝对路径
   * @return {string}      生成的 pdf 文件绝对路径
   */
  static _exists(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.stat(filePath, (err: NodeJS.ErrnoException, stats: any) => {
        if (err) {
          reject(err)
        } else {
          if (stats.isFile()) {
            resolve(filePath)
          } else {
            reject(err)
          }
        }
      })
    })
  }
  

  init(data: any) {
    this._data = data
    this._data['schoolterm'] = schoolterm
    this._types.set('report', {
      title: `高${data.grade}届${schoolterm}第${data.week}周${data.sex}宿舍内务卫生情况表_` +
        moment().format('YYYY-MM-DD'),
      templateFilePath: resourcePath + 'report_v2.0.docx',
    })
    this._types.set('notice', {
      title: `高${data.grade}届${schoolterm}第${data.week}周宿舍内务卫生通报批评_` +
        moment().format('YYYY-MM-DD'),
      templateFilePath: resourcePath + 'notice_v3.0.docx',
    })
    this._types.set('dormitory', {
      title: `高${data.grade}届班级宿舍情况_` + moment().format('YYYY-MM-DD'),
      templateFilePath: resourcePath + 'dormitory_v1.0.docx',
    })
    this._types.set('test', {
      title: `test_` +
        moment().format('YYYY-MM-DD'),
      templateFilePath: resourcePath + 'test_v1.0.docx',
    })
    
  }

  /**
   * 生成表。
   * @param  {Object} data 内务检查数据
   * @return {string}      生成文件的本地路径
   */
  generate(): Promise<string> {
    return new Promise((resolve, reject) => {
      let title = this._types.get(this._type).title
      let templateFile = this._types.get(this._type).templateFilePath
      let data = this._data

      let newDateFormat = moment(data.date).format('YYYY年M月D日')
      data.date = newDateFormat
      fs.readFile(templateFile, 'binary', (err: NodeJS.ErrnoException, content: any) => {
        if (err) {
          reject(err)
        } else {
          let zip = new JSZip(content)
          let doc = new Docxtemplater().loadZip(zip)
          doc.setData(data)
          doc.render()
          let buf = doc.getZip().generate({
            type: 'nodebuffer',
          })
          let archivePath = path.posix.join(__dirname, '/../public/archive/')
          const resultFilePath = `${archivePath}${title}.docx`
          fs.writeFile(resultFilePath, buf, (err: NodeJS.ErrnoException) => {
            if (err) {
              reject(err)
            } else {
              resolve(resultFilePath)
            }
          })
        }
      })
    })
  }
}


export { DocxTemplate }

#!/usr/bin/env node

/**
 * @file 班级宿舍控制器
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 * 
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */


import { DocxTemplate } from "./docx-template"


import * as fs from "fs"
import * as path from "path"
import * as childProcess from "child_process"

import { DaisyConfig } from "../types/daisy"

let Docxtemplater = require('docxtemplater')

const config: DaisyConfig = require('../config/daisyconfig.json')
const schoolterm = config.schoolterm
const resourcePath = path.join(__dirname, '/../public/resource/')

/**
 * 导出的文档类，提供情况表和通报表两种样式。
 */
class PdfTemplate extends DocxTemplate {

  /**
   * 构造函数
   * @param  {string} target_file 生成的文件全名
   * @param  {object} data     包含数据
   * @return {this}          自己
   */
  constructor(type: any, data: any) {
    super(type, data)
  }

  /**
   * 转换 docx 为 pdf 文件，使用 VB 脚本操作 Word 实现。
   * @param  {string} filePath 生成 pdf 文件绝对路径
   * @return {string}      生成的 pdf 文件绝对路径
   */
  static _convert(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let absFilePath = path.resolve(filePath)
      let resultFilePath = filePath.split('.')[0] + '.pdf'
      let convertScript = path.resolve(path.join(__dirname,
        '/convert.vbs'))
      childProcess.exec(convertScript + ' ' + absFilePath, async (error,
        stdout, stderr) => {
        if (error) {
          reject(error)
        } else {
          let fp: string = await DocxTemplate._exists(resultFilePath)
          resolve(fp)
        }
      })
    })
  }
  
  /**
   * 生成表。
   * @param  {Object} data 内务检查数据
   * @return {string}      生成文件的本地路径
   */
  generate2(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      let resultFilePath = await this.generate()
      let pdfFilePath = await PdfTemplate._convert(resultFilePath)
      console.log('pdf', resultFilePath, pdfFilePath)
      resolve(pdfFilePath)
    })
  }
}


export { PdfTemplate }

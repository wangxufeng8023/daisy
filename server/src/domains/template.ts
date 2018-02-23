#!/usr/bin/env node

/**
 * @file template.ts 模板文档抽象类
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 *
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */

import * as fs from 'fs'
import * as path from 'path'
import * as JSZip from 'jszip'
import * as childProcess from 'child_process'

let Docxtemplater = require('docxtemplater')

const resourcePath = path.join(__dirname, '/../public/resource/')
const archivePath = path.join(__dirname, '/../public/archive/')

const enum Format {
  DOCX = 'DOCX',
  PDF = 'PDF'
}


abstract class Template {
  name: string
  title: string
  format: string
  templateFilePath: string
  data: any

  constructor(
    name: string,
    title: string,
    format: string,
    templateFile: string,
    data: any
  ) {
    this.name = name
    this.title = title
    this.format = format === 'pdf' ? Format.PDF : Format.DOCX
    this.templateFilePath = resourcePath + templateFile
    this.data = data
  }

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

  static _convert(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let absFilePath = path.resolve(filePath)
      let resultFilePath = filePath.split('.')[0] + '.pdf'
      let convertScript = path.resolve(path.join(__dirname, '/convert.vbs'))
      childProcess.exec(
        convertScript + ' ' + absFilePath,
        async (error, stdout, stderr) => {
          if (error) {
            reject(error)
          } else {
            let fp: string = await Template._exists(resultFilePath)
            resolve(fp)
          }
        }
      )
    })
  }

  async generate() {
    let result: string
    if (this.format === Format.PDF) {
      result = await this.generatePdf()
    } else {
      result = await this.generateDocx()
    }
    return result
  }

  private generateDocx(): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(
        this.templateFilePath,
        'binary',
        (err: NodeJS.ErrnoException, content: any) => {
          if (err) {
            reject(err)
          } else {
            let zip = new JSZip(content)
            let doc = new Docxtemplater().loadZip(zip)
            doc.setData(this.data)
            doc.render()
            let buf = doc.getZip().generate({
              type: 'nodebuffer'
            })
            let resultFilePath = `${archivePath}${this.title}.docx`
            fs.writeFile(resultFilePath, buf, (err: NodeJS.ErrnoException) => {
              if (err) {
                reject(err)
              } else {
                resolve(resultFilePath)
              }
            })
          }
        }
      )
    })
  }

  private generatePdf(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      let resultFilePath = await this.generateDocx()
      let pdfFilePath = await Template._convert(resultFilePath)
      if (pdfFilePath.length > 0) {
        resolve(pdfFilePath)
      } else {
        reject(new Error('生成 PDF 文件失败。'))
      }
    })
  }
}

export { Template }

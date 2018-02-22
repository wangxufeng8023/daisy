#!/usr/bin/env node

/**
 * @file 导出文档服务
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 * 
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */

import * as Koa from "koa"
import { BaseService } from "./base-service"
import { DocumentRepository } from "../repositories/document-repository"
import { DocxTemplate } from "../domains/docx-template"
import { PdfTemplate } from "../domains/pdf-template"

import { DaisyConfig } from "../types/daisy"

let config: DaisyConfig = require('../config/daisyconfig.json')


class DocumentService extends BaseService {
  constructor(repository: DocumentRepository) {
    super(repository)
  }

  _assembleCondition(where: any) {
    let queryList: any[] = [{
      date: {
        $gte: new Date(config.daterange.from),
        $lte: new Date(config.daterange.to),
      }
    }]
    for (let k in where) {
      if (k === 'format' || k === 'type') {
        continue
      }
      queryList.push({
        [k]: where[k],
      })
    }
    let condition = {
      $and: queryList,
    }
    return condition
  }

  /**
   * 
   * @param where 去除周参数的 condition
   */
  _assembleCondition2(where: any) {
    let queryList: any[] = []
    for (let k in where) {
      if (k === 'format' || k === 'type' || k === 'week') {
        continue
      }
      queryList.push({
        [k]: where[k],
      })
    }
    let condition = {
      $and: queryList,
    }
    return condition
  }

  /**
 * 根据班级排序。
 */
  static _sortClass(a: any, b: any) {
    return parseInt(a.class) - parseInt(b.class)
  }

  /**
   * 组装通报批评的数据。
   */
  static _assembleNoticeOfCriticism(rooms: any) {
    return new Promise((resolve, reject) => {
      let roomsList: any[] = []
      if (rooms.length === 0) {
        resolve(roomsList)
      }
      // 从数组第一项开始，记录班号
      let indexClass = parseInt(rooms[0].class)
      let male = []
      let female = []
      let teacher = ''
      for (let r in rooms) {
        let one = rooms[r]
        // 顺序检测数组里班号，如果不同说明到下一个班了，把上一个班的存储。
        if (parseInt(one.class) !== indexClass) {
          roomsList.push({
            class: indexClass,
            teacher: teacher,
            male: male,
            female: female,
          })
          male = []
          female = []
          teacher = ''
        }
        // 新的一项，读取班号，分宿舍，分老师。
        indexClass = parseInt(one.class)
        if (one.sex === '男生') {
          male.push(one.roomnumber + '宿舍。扣分原因：' + one.desc + '。')
        } else {
          female.push(one.roomnumber + '宿舍。扣分原因：' + one.desc + '。')
        }
        teacher = one.teacher
        // 最后一项，把之前一项存储。
        if (parseInt(r) === (rooms.length - 1)) {
          roomsList.push({
            class: indexClass,
            teacher: teacher,
            male: male,
            female: female,
          })
          male = []
          female = []
        }
      }
      resolve(roomsList)
    })
  }



  async _prepareReportData(where: any) {
    const condition = this._assembleCondition(where)
    let data1 = await this.repository.getDailyData(condition)
    let data2 = DocumentService._assembleData(data1)
    let data3 = {
      grade: where.grade,
      week: where.week,
      sex: where.sex,
      row: this._reduceData(data2),
    }
    return data3
  }

  async _prepareNoticeData(where: any) {
    const condition = this._assembleCondition(where)
    let problemRooms = await this.repository.getProblemRooms(condition)
    let threeProblemRooms = problemRooms.filter((a: any) => {
      return a.count > 2
    })
    threeProblemRooms.sort(DocumentService._sortClass)
    let maleProblemRooms = threeProblemRooms.filter((b: any) => {
      return b.sex === '男生'
    })
    let femaleProblemRooms = threeProblemRooms.filter((c: any) => {
      return c.sex === '女生'
    })
    let maleProblems: any = await DocumentService._assembleNoticeOfCriticism(
      maleProblemRooms)
    let femaleProblems: any = await DocumentService._assembleNoticeOfCriticism(
      femaleProblemRooms)
    let data = {
      grade: where.grade,
      week: where.week,
      maleproblems: maleProblems,
      femaleproblems: femaleProblems,
      malenil: maleProblems.length === 0 ? '无。' : '',
      femalenil: femaleProblems.length === 0 ? '无。' : '',
    }
    return data
  }

  _assembleRooms(rooms: any) {
    return new Promise((resolve, reject) => {
      let roomsList: any[] = []
      if (rooms.length === 0) {
        resolve(roomsList)
      }
      // 从数组第一项开始，记录班号
      let indexClass = parseInt(rooms[0].class)
      let male = []
      let female = []
      let teacher = ''
      for (let r in rooms) {
        let one = rooms[r]
        // 顺序检测数组里班号，如果不同说明到下一个班了，把上一个班的存储。
        if (parseInt(one.class) !== indexClass) {
          roomsList.push({
            class: indexClass,
            teacher: teacher,
            male: male,
            female: female,
          })
          male = []
          female = []
          teacher = ''
        }
        // 新的一项，读取班号，分宿舍，分老师。
        indexClass = parseInt(one.class)
        if (one.sex === '男生') {
          male.push(one.roomnumber + '-' + one.leader)
        } else {
          female.push(one.roomnumber + '-' + one.leader)
        }
        teacher = one.teacher
        // 最后一项，把之前一项存储。
        if (parseInt(r) === (rooms.length - 1)) {
          roomsList.push({
            class: indexClass,
            teacher: teacher,
            male: male,
            female: female,
          })
          male = []
          female = []
        }
      }
      resolve(roomsList)
    })
  }
  async _prepareClassData(where: any) {
    let condition = this._assembleCondition(where)
    let problemRooms = await this.repository.getProblemRooms(condition)
    
    let condition2 = this._assembleCondition2(where)
    let allRooms = await this.repository.getAllRooms(condition2)
    let goodRooms = await this.repository.getGoodRooms(allRooms, problemRooms)
   
    goodRooms.sort(DocumentService._sortClass)
    let sg = await this._assembleRooms(goodRooms)
    let data = {
      grade: where.grade,
      good_rooms: sg
    }
    return data
  }
  async exportToDocx(ctx: Koa.Context) {
    const { type } = ctx.query
    let data: any
    switch (type) {
      case 'report':
        data = await this._prepareReportData(ctx.query)
        break
      case 'notice':
        data = await this._prepareNoticeData(ctx.query)
        break
      case 'dormitory':
        data = await this._prepareClassData(ctx.query)
        break
      default:
        break
    }
    let docx = new DocxTemplate(type, data)
    const reportFilePath = await docx.generate()
    return reportFilePath
  }

  async exportToPdf(ctx: Koa.Context) {
    const where = ctx.query
    const condition = this._assembleCondition(where)
    let data1 = await this.repository.getDailyData(condition)
    let data2 = DocumentService._assembleData(data1)
    let data3 = {
      grade: ctx.query.grade,
      week: ctx.query.week,
      sex: ctx.query.sex,
      row: this._reduceData(data2),
    }
    let pdf = new PdfTemplate('report', data3)
    const reportFilePath = await pdf.generate2()
    return reportFilePath
  }


  static _assembleData(result: any) {
    const wpPre =
      `
              <w:p><w:pPr>
              <w:spacing w:line="240" w:lineRule="exact"/>
              <w:jc w:val="left"/>
              </w:pPr>`
    const wpPost = '</w:p>'
    let wrBdr =
      '<w:bdr w:val="single" w:sz="4" w:space="0" w:color="FF0000"/>'
    const wtDia =
      `
              <w:r><w:rPr><w:color w:val="FF0000"/>
              </w:rPr>
              <w:t>♦</w:t></w:r>`
    const wtRedPre =
      `
              <w:r><w:rPr><w:b/>
              </w:rPr><w:t>`
    const wtDiaBdr =
      `
              <w:r><w:rPr><w:color w:val="FF0000"/>${wrBdr}
              </w:rPr>
              <w:t>♦</w:t></w:r>`
    const wtRedPreBdr =
      `
              <w:r><w:rPr><w:b/>
              ${wrBdr}
              </w:rPr><w:t>`
    const wtEmPre = '<w:r><w:rPr><w:b/></w:rPr><w:t>'
    const spanPre = '<w:r><w:t>'
    const spanPost = '</w:t></w:r>'
    let gl: any = []
    result.forEach(function (a: any) {
      for (let j in a.problems) {
        let d: any = {}
        if (a.problems.length === 2) {
          d.class = 'class' + a.class
          d.desc = wpPre + wtDia + wtRedPre + a.roomnumber + spanPost +
            spanPre + '：' + spanPost + wpPost +
            wpPre + spanPre + a.problems[j].desc + spanPost + wpPost
        } else if (a.problems.length >= 3) {
          d.class = 'class' + a.class
          d.desc = wpPre + wtDiaBdr + wtRedPreBdr + a.roomnumber +
            spanPost + spanPre + '：' + spanPost + wpPost +
            wpPre + spanPre + a.problems[j].desc + spanPost +
            wpPost
        } else {
          d.class = 'class' + a.class
          d.desc = wpPre + wtEmPre + a.roomnumber + spanPost + spanPre +
            '：' + spanPost + wpPost +
            wpPre + spanPre + a.problems[j].desc + spanPost + wpPost
        }
        d['index'] = new Date(a.problems[j].date).getDay()
        gl.push(d)
      }
    })
    return gl
  }

  _reduceData(data: any) {
    let wk: any = {
      '1': '周一',
      '2': '周二',
      '3': '周三',
      '4': '周四',
      '5': '周五',
    }
    const wpPre =
      `
              <w:p><w:pPr>
              <w:spacing w:line="240" w:lineRule="exact"/>
              <w:jc w:val="left"/>
              </w:pPr>`
    const wpPost = '</w:p>'
    let newResult = []
    let initObj: any = {
      class1: wpPre + wpPost,
      class2: wpPre + wpPost,
      class3: wpPre + wpPost,
      class4: wpPre + wpPost,
      class5: wpPre + wpPost,
      class6: wpPre + wpPost,
      class7: wpPre + wpPost,
      class8: wpPre + wpPost,
      class9: wpPre + wpPost,
      class10: wpPre + wpPost,
      class11: wpPre + wpPost,
      class12: wpPre + wpPost,
      class13: wpPre + wpPost,
      class14: wpPre + wpPost,
      class15: wpPre + wpPost,
      class16: wpPre + wpPost,
      class17: wpPre + wpPost,
      class18: wpPre + wpPost,
    }
    for (let i = 1; i < 6; i++) {
      let oneDayData = data.filter((v: any) => {
        return v.index === i
      })
      let row: any = {}
      if (oneDayData.length > 0) {
        row = oneDayData.reduce((p: any, n: any) => Object.assign({}, p, {
          index: wk[n.index],
          [n.class]: p[n.class] === wpPre + wpPost ? n.desc : p[n.class] +
            n.desc,
        }), initObj)
      } else {
        initObj['index'] = wk[i]
        row = initObj
      }
      newResult.push(row)
    }
    return newResult
  }

}
export { DocumentService }

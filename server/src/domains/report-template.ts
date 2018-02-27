#!/usr/bin/env node

/**
 * @file report-template.ts 生成情况表的文档类
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 *
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */

import * as moment from 'moment'

import { Template } from './template'
import { DaisyConfig } from '../types/daisy'
const config: DaisyConfig = require('../../config/daisyconfig.json')

/**
 * 情况表文档类
 */
class ReportTemplate extends Template {
  constructor(format: string, data: any) {
    let newDateFormat = moment(data.date).format('YYYY年M月D日')
    data.date = newDateFormat
    data.schoolterm = config.schoolterm
    let title =
      `高${data.grade}届${data.schoolterm}第${data.week}周${
        data.sex
      }宿舍内务卫生情况表_` + moment().format('YYYY-MM-DD')
    super('report', title, format, 'report_v2.0.docx', data)
  }
}

export { ReportTemplate }

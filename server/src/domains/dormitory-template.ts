#!/usr/bin/env node

/**
 * @file template.ts 模板文档抽象类
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 *
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */

import * as moment from 'moment'

import { Template } from './template'
import { DaisyConfig } from '../types/daisy'

const config: DaisyConfig = require('../config/daisyconfig.json')
const schoolterm = config.schoolterm

class DormitoryTemplate extends Template {
  constructor(format: string, data: any) {
    let newDateFormat = moment(data.date).format('YYYY年M月D日')
    data.date = newDateFormat
    data.schoolterm = schoolterm
    let title = `高${data.grade}届班级宿舍情况_` + moment().format('YYYY-MM-DD')
    super('dormitory', title, format, 'dormitory_v1.0.docx', data)
  }
}

export { DormitoryTemplate }

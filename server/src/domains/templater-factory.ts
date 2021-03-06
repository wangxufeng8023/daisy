#!/usr/bin/env node

/**
 * @file template-factory.ts 模板文档工厂类
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 *
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */
import { ReportTemplate } from './report-template'
import { NoticeTemplate } from './notice-template'
import { DormitoryTemplate } from './dormitory-template'

/**
 * 模板文档工厂类，通过名称生成相应的模板类
 */
class TemplateFactory {
  static createTemplate(name: string, format: string, data: any) {
    switch (name) {
      case 'report':
        return new ReportTemplate(format, data)
      case 'notice':
        return new NoticeTemplate(format, data)
      case 'dormitory':
        return new DormitoryTemplate(format, data)
      default:
        return new ReportTemplate(format, data)
    }
  }
}

export { TemplateFactory }

#!/usr/bin/env node

/**
 * @file 导了文档控制器
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 *
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */

import * as Koa from 'koa'
import { DaisyConfig } from '../types/daisy'

import { DocumentService } from '../services/document-service'
import { DocumentRepository } from '../repositories/document-repository'

/**
 * 班级宿舍控制器
 */
class DocumentController {
  static async export(ctx: Koa.Context, next: Function) {
    const { format } = ctx.query
    let ds = await new DocumentService(new DocumentRepository('dailies'))
    let docx = await ds.export(ctx)
    let docx_link = docx.split('dist')[1]
    ctx.body = { file_path: docx_link }
  }
}

export { DocumentController }

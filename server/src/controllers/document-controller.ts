#!/usr/bin/env node

/**
 * @file 文档控制器
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 *
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */

import * as Koa from 'koa'
import * as path from 'path'

import { DaisyConfig } from '../types/daisy'

import { DocumentService } from '../services/document-service'
import { DocumentRepository } from '../repositories/document-repository'

/**
 * 文档控制器
 * 处理 `/documents` 请求。
 */
class DocumentController {
  /**
   * 获取参数调用服务生成文件。
   * @GET
   */
  static async export(ctx: Koa.Context, next: Function) {
    const { format } = ctx.query
    let ds = await new DocumentService(new DocumentRepository())
    let docx = await ds.export(ctx)
    let docx_link = path.basename(docx)
    ctx.body = { file_path: docx_link }
  }
}

export { DocumentController }

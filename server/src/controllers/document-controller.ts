#!/usr/bin/env node

/**
 * @file 文档控制器
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 *
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */

import * as Koa from 'koa'
import * as send from 'koa-send' 
import * as path from 'path'

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
    let ds = await new DocumentService(new DocumentRepository())
    const { type } = ctx.query
    if (type === 'all') {
      ctx.query.type = 'report'
      ctx.query.sex = '男生'
      let doc1 = await ds.export(ctx)
      ctx.query.sex = '女生'
      let doc2 = await ds.export(ctx)
      ctx.query.type = 'notice'
      let doc3 = await ds.export(ctx)
      let doc_links = [doc1, doc2, doc3].map(v => {
        return path.basename(v)
      })
      console.log(doc_links)
      ctx.body = { file_path: doc_links }
    } else {
      let doc = await ds.export(ctx)
      let doc_link = path.basename(doc)
      ctx.body = { file_path: doc_link }
    }
  }
  /**
   * 下载文件
   */
  static async download(ctx: Koa.Context, next: Function) {
    let fileName = ctx.query.file
    let filePath = path.join('dist/public/archive/', fileName)
    ctx.set('Content-Type', 'application/octet-stream')
    ctx.set('Content-Disposition', 'attachment;filename='+ encodeURI(fileName))
    
    await send(ctx, filePath)
  }
}

export { DocumentController }

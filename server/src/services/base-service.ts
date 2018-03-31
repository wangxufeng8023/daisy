#!/usr/bin/env node

/**
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 *
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */

import * as Koa from 'koa'

import { DaisyConfig } from '../types/daisy'

/**
 * 基本服务类。
 */
abstract class BaseService {
  repository: any
  config: DaisyConfig

  constructor(repository: any) {
    this.repository = repository
    this.config = require('../../config/daisyconfig.json')
  }

  abstract _assembleCondition(where: any): any

  /**
   * 新建内务检查记录。
   */
  create(ctx: Koa.Context) {
    let obj = ctx.request.body
    obj.date = new Date(obj.date)
    return this.repository.create(obj)
  }
  /**
   * 查询内务检查记录。
   */
  find(ctx: Koa.Context) {
    let where = ctx.query
    let condition = this._assembleCondition(where)
    return this.repository.find(condition)
  }
  /**
   * 更新记录
   */
  update(ctx: Koa.Context) {
    const objId = ctx.params.id
    const obj = ctx.request.body
    delete obj._id
    return this.repository.update(objId, obj)
  }
  /**
   * 删除一条内务检查记录。
   */
  delete(ctx: Koa.Context) {
    const objId = ctx.params.id
    return this.repository.delete(objId)
  }
}

export { BaseService }

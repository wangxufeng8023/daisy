#!/usr/bin/env node

/**
 * @file 班级宿舍控制器
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 *
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */

import * as Koa from 'koa'
import { DaisyConfig } from '../types/daisy'

import { ClassService } from '../services/class-service'

/**
 * 班级宿舍控制器
 * 处理 `/classes` 请求。
 */
class ClassController {
  /**
   * @GET
   */
  static async index(ctx: Koa.Context, next: Function) {
    let r = await new ClassService('classes').find(ctx)
    ctx.body = r
  }

  /**
   * @POST
   */
  static async create(ctx: Koa.Context, next: Function) {
    let r = await new ClassService('classes').create(ctx)
    ctx.body = r
  }
  /**
   * @PUT
   */
  static async update(ctx: Koa.Context, next: Function) {
    let r = await new ClassService('classes').update(ctx)
    ctx.body = r
  }
  /**
   * @DELETE
   */
  static async delete(ctx: Koa.Context, next: Function) {
    let r = await new ClassService('classes').delete(ctx)
    ctx.body = r
  }
  /**
   * 获取宿舍
   */
  static async getDormitory(ctx: Koa.Context, next: Function) {
    let r = await new ClassService('classes').getDormitory(ctx)
    ctx.body = r
  }
}

export { ClassController }

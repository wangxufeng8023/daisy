#!/usr/bin/env node

/**
 * @file 班级宿舍控制器
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 * 
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */

import * as Koa from "koa"
import { BaseService } from "./base-service"
import { ClassRepository } from "../repositories/class-repository"

import { DaisyConfig } from "../types/daisy"
const config: DaisyConfig = require('../config/daisyconfig.json')
const dburl: string = config.dburl

/**
 * 班级宿舍类，包括增删改查函数。
 */
class ClassService extends BaseService {
  constructor(collection: string) {
    super(new ClassRepository('classes'))
  }

  /**
   * 组装查询字符串为查询条件。
   */
  _assembleCondition(where: any) {
    let queryList: any[] = []
    for (let k in where) {
      if (k === 'format') {
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

  getDormitory(ctx: Koa.Context) {
    const condition = this._assembleCondition(ctx.query)
    return this.repository.getDormitory(condition)
  }
}

export { ClassService }

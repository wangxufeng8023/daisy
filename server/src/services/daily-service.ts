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

import { MongoClient, ObjectId, Db, Collection, Cursor } from "mongodb"
import { DaisyConfig } from "../types/daisy"
import { DailyRepository } from "../repositories/daily-repository"

let config: DaisyConfig = require('../config/daisyconfig.json')
let dburl: string = config.dburl


/**
 * 内务检查类，包含内务检查功能函数。
 */
class DailyService extends BaseService {

  constructor(repository: DailyRepository) {
    super(repository)
  }
  /**
   * 内务使用函数，组装查询字符串为查询条件。
   */
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

  async getGradesDailies(ctx: Koa.Context) {
    let where = ctx.query
    let condition = this._assembleCondition(where)
    console.log(condition)
    let r = await this.repository.getGradesDailies(condition)
    return r
  }
  /**
   * 获取内务检查数据。
   */
  async getReportData(ctx: Koa.Context) {
    let where = ctx.query
    let condition = this._assembleCondition(where)
    let r = await this.repository.getDailyData(condition)
    return r
  }

  async suggestion(){
     let r = await this.repository.suggestion()
     return r
  }
  
}


export { DailyService }


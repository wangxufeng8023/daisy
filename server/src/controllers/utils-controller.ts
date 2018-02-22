#!/usr/bin/env node

/**
 * @file 班级宿舍控制器
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 * 
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */

import * as Koa from "koa"
import { MongoClient } from "mongodb"
import * as moment from "moment"


import { DaisyConfig } from "../types/daisy"
import { ClassService } from "../services/class-service"
import { Utils } from "../services/utils"

/**
 * 工具控制器
 */
class UtilsController {

  static async resetDb(ctx: Koa.Context, next: Function) {
    const InitDbCollection = {
      CLASSES: 'classes',
      DAILY: 'daily',
    }
    const daisyconfig: DaisyConfig = await Utils.parseSetting2()

    const url = daisyconfig.dburl
    try {
      let client: MongoClient = await MongoClient.connect(daisyconfig.dburl)
      let db = client.db('sanitation')
      switch (ctx.query.db) {
        case InitDbCollection.CLASSES:
          db.collection('classes').drop()
          break
        case InitDbCollection.DAILY:
          console.log('drop daily')
          db.collection('daily').drop()
          break
        default:
          ctx.body = {
            data: "无操作"
          }
          break
      }
    } catch (error) {
      ctx.body = error
      ctx.status = 404
    }
  }

  static async testConnection(ctx: Koa.Context, next: Function) {
    const daisyconfig: DaisyConfig = await Utils.parseSetting2()
    try {
      let client: MongoClient = await MongoClient.connect(daisyconfig.dburl)
      ctx.status = 200
    } catch (error) {
      ctx.status = 404
    }
  }

  static async getConfig(ctx: Koa.Context, next: Function) {
    let config: DaisyConfig = require('../config/daisyconfig.json')
    ctx.body = config
  }

  static async setConfig(ctx: Koa.Context, next: Function) {
    let config = ctx.request.body
    config.daterange.from = moment(config.daterange.from).format(
      'YYYY-MM-DD')
    config.daterange.to = moment(config.daterange.to).format('YYYY-MM-DD')
    await Utils.saveSettingAwait(config)
    ctx.status = 200
  }

  static async backupDb(ctx: Koa.Context, next: Function) {
    Utils.backupData('classes')
    Utils.backupData('daily')
    ctx.status = 200
  }


}

export { UtilsController }
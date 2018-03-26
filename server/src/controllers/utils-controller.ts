#!/usr/bin/env node

/**
 * @file 工具类控制器
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 *
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */

import * as Koa from 'koa'
import { MongoClient } from 'mongodb'
import * as moment from 'moment'


import { ClassService } from '../services/class-service'
import { Utils } from '../services/utils'
import { DaisyConfig } from '../types/daisy'
let config: DaisyConfig = require('../../config/daisyconfig.json')

/**
 * 工具类控制器
 */
class UtilsController {
  /**
   * 清空集合数据
   */
  static async resetDb(ctx: Koa.Context, next: Function) {
    const InitDbCollection = {
      CLASSES: 'classes',
      DAILY: 'dailies'
    }
    const url = config.dburl
    try {
      let client: MongoClient = await MongoClient.connect(config.dburl)
      let db = client.db(config.dbname)
      switch (ctx.query.db) {
        case InitDbCollection.CLASSES:
          db.collection('classes').drop()
          break
        case InitDbCollection.DAILY:
          db.collection('dailies').drop()
          break
        default:
          ctx.body = {
            info: '无操作'
          }
          break
      }
      client.close()
    } catch (error) {
      ctx.body = error
      ctx.status = 404
    }
  }
  /**
   * 测试数据库连接
   */
  static async testConnection(ctx: Koa.Context, next: Function) {
    ctx.body = 'ok'
    try {
      let client: MongoClient = await MongoClient.connect(config.dburl, {
        family: 4
      })
      ctx.status = 200
      client.close()
    } catch (error) {
      ctx.status = 404
    }
  }
  /**
   * 读取配置文件
   */
  static async getConfig(ctx: Koa.Context, next: Function) {
    ctx.body = config
  }

  /**
   * 修改保存配置文件
   */
  static async setConfig(ctx: Koa.Context, next: Function) {
    let config = ctx.request.body
    config.daterange.from = moment(config.daterange.from).format('YYYY-MM-DD')
    config.daterange.to = moment(config.daterange.to).format('YYYY-MM-DD')
    await Utils.saveSetting(config)
    ctx.status = 200
  }
  /**
   * 备份数据库集合数据
   */
  static async backupDb(ctx: Koa.Context, next: Function) {
    Utils.backupData('classes')
    Utils.backupData('dailies')
    ctx.status = 200
  }
}

export { UtilsController }

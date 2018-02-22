#!/usr/bin/env node

/**
 * @file 班级宿舍控制器
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 * 
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */

import * as Koa from "koa"
import { BaseRepository } from "./base-repository"
import { DaisyConfig } from "../types/daisy"

import { MongoClient, ObjectId, Db, Collection, Cursor } from "mongodb"


const config: DaisyConfig = require('../config/daisyconfig.json')
const dburl = config.dburl
const dbname = config.dbname

/**
 * 内务检查类，包含内务检查功能函数。
 */
class DailyRepository extends BaseRepository {

  constructor(collection: string) {
    super(collection)
  }

  /**
   * 获取各年级各周内务检查数据。
   */
  getGradesDailies(condition: any) {
    return new Promise(async (resolve, reject) => {
      try {
        let client: MongoClient = await MongoClient.connect(this.config.dburl)
        let collection: Collection = client.db(this.config.dbname).collection('dailies')
        let cursor = await collection.aggregate([{
          $project: {
            grade: 1,
            week: 1,
            date: 1,
          },
        }, {
          $match: condition,
        }, {
          $group: {
            _id: {
              grade: '$grade',
            },
            grade: {
              $first: '$grade',
            },
            weeks: {
              $addToSet: '$week',
            },
          },
        }])
        let result = await cursor.toArray()
        resolve(result)
        client.close()
      } catch (err) {
        reject(err)
      }
    })
  }
  
}

export { DailyRepository }


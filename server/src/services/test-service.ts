#!/usr/bin/env node

/**
 * @file 班级宿舍控制器
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 *
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */

import * as Koa from 'koa'
import { BaseService } from './base-service'
import { ClassRepository } from '../repositories/class-repository'

import { DaisyConfig } from '../types/daisy'
const config: DaisyConfig = require('../../config/daisyconfig.json')
const dburl: string = config.dburl
const dbname: string = config.dbname
import { MongoData } from '../domains/mongo-data'

import { MongoClient, ObjectId, Db, Collection, Cursor } from 'mongodb'

/**
 * 班级宿舍类，包括增删改查函数。
 */
class ClassService {
  constructor() {}
  static find(ctx: Koa.Context) {
    let where = ctx.query
    let condition = ClassService._assembleCondition(where)
    console.log(new Date())

    // return ClassService.find3(condition)
    return ClassService.find4()
  }

  static find2(condition: any) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('3', new Date())

        let client = await MongoClient.connect(dburl, { family: 4 })
        console.log('4', new Date())
        const db = client.db(dbname)
        let r = await db
          .collection('classes')
          .find(condition)
          .toArray()
        resolve(r)
        client.close()
        console.log(new Date())
      } catch (err) {
        console.log(err.stack)
        reject(err)
      }
    })
  }

  static find3(condition: any) {
    return new Promise((resolve, reject) => {
      console.log('3', new Date())

      MongoClient.connect(dburl, function(err, client) {
        if (err) {
          reject(err)
        } else {
          let collection = client.db('sanitation').collection('dailies')
          collection.find(condition).toArray(function(err, result) {
            if (err) {
              reject(err)
            } else {
              resolve(result)
            }
            console.log('3', new Date())

            client.close()
          })
        }
      })
    })
  }

  static find4() {
    return new Promise((resolve, reject) => {
      let a: any = {}
      a.family = 4
      MongoClient.connect('mongodb://localhost:27017/sanitation', a, function(
        err,
        client
      ) {
        console.log('Connected successfully to server')

        const db = client.db(dbname)
        resolve('db')
        client.close()
      })
    })
  }
  /**
   * 组装查询字符串为查询条件。
   */
  static _assembleCondition(where: any) {
    let queryList: any[] = []
    for (let k in where) {
      if (k === 'format') {
        continue
      }
      queryList.push({
        [k]: where[k]
      })
    }
    let condition = {
      $and: queryList
    }
    return condition
  }
}

export { ClassService }

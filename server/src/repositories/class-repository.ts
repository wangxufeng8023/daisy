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
import {
  MongoClient,
  Db,
  Collection,
  Cursor
} from 'mongodb'

/**
 * 内务检查类，包含内务检查功能函数。
 */
class ClassRepository extends BaseRepository {

  constructor(collection: string) {
    super(collection)
    
  }

  async getDormitory(condition: any) {
    return new Promise(async (resolve, reject) => {
      try {
        let client: MongoClient = await MongoClient.connect(this.config.dburl, this.options)
        let collection: Collection = client
          .db(this.config.dbname)
          .collection(this.collection)
        let cursor = await collection.aggregate([
          {
            $project: {
              rooms: 1,
              class: 1,
              teacher: 1,
              grade: 1
            }
          },
          {
            $unwind: '$rooms'
          },
          {
            $match: condition
          },
          {
            $group: {
              _id: {
                garden: '$rooms.garden' // 按照所在的院子进行聚合
              },
              rooms: {
                $addToSet: {
                  garden: '$rooms.garden',
                  roomnumber: '$rooms.roomnumber',
                  sex: '$rooms.sex',
                  grade: '$grade',
                  class: '$class',
                  teacher: '$teacher',
                  leader: '$rooms.leader'
                }
              }
            }
          }
        ])
        let result = await cursor.toArray()
        resolve(result)
        client.close()
      } catch (err) {
        reject(err)
      }
    })
  }

  async getGrades() {
    return new Promise(async (resolve, reject) => {
      try {
        let client: MongoClient = await MongoClient.connect(this.config.dburl, this.options)
        let collection: Collection = client
          .db(this.config.dbname)
          .collection(this.collection)
        let cursor = await collection.aggregate([
          {
            $project: {
              grade: 1
            }
          },
          {
            $group: {
              _id: {
              },
              grades: {
                $addToSet: '$grade'
              }
            }
          }
        ])
        let result = await cursor.toArray()
        resolve(result)
        client.close()
      } catch (err) {
        reject(err)
      }
    })
  }
}


export { ClassRepository }


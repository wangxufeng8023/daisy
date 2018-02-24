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


/**
 * 内务检查类，包含内务检查功能函数。
 */
class DocumentRepository extends BaseRepository {

  constructor(collection: string = '') {
    super(collection)
  }

  getAllRooms(condition: any) {
    return new Promise(async (resolve, reject) => {
      try {
        let client: MongoClient = await MongoClient.connect(this.config.dburl)
        let collection: Collection = client.db(this.config.dbname).collection('classes')
        let cursor = await collection.aggregate([{
          $project: {
            rooms: 1,
            class: 1,
            teacher: 1,
            grade: 1,
          },
        }, {
          $unwind: '$rooms',
        }, {
          $match: condition,
        }, {
          $group: {
            _id: {
              garden: '$rooms.garden',
            },
            rooms: {
              $addToSet: {
                garden: '$rooms.garden',
                roomnumber: '$rooms.roomnumber',
                sex: '$rooms.sex',
                grade: '$grade',
                class: '$class',
                teacher: '$teacher',
                leader: '$rooms.leader',
              },
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
  getGoodRooms(allRooms: any, problemRooms: any) {
    return new Promise((resolve, reject) => {
      let goodRooms = []
      for (let i in allRooms) {
        // garden
        for (let j in allRooms[i].rooms) {
          // room
          let room = allRooms[i].rooms[j]
          let yorn = true
          problemRooms.forEach((a: any) => {
            if ((a.leader === room.leader) &&
              (a.roomnumber === room
                .roomnumber)) {
              yorn = false
            }
          })
          if (yorn) {
            goodRooms.push(room)
          }
        }
      }
      resolve(goodRooms)
    })
  }
  /**
   * 获取一周的有问题的宿舍。
   */
  getProblemRooms(condition: any) {
    return new Promise(async (resolve, reject) => {
      try {
        let client: MongoClient = await MongoClient.connect(this.config.dburl)
        let collection: Collection = client.db(this.config.dbname).collection('dailies')
        let cursor = await collection.aggregate([{
          $project: {
            grade: 1,
            sex: 1,
            garden: 1,
            week: 1,
            roomnumber: 1,
            leader: 1,
            desc: 1,
            class: 1,
            date: 1,
          },
        }, {
          $match: condition,
        }, {
          $sort: {
            class: -1,
          },
        }, {
          $group: {
            _id: {
              class: '$class',
              roomnumber: '$roomnumber',
            },
            roomnumber: {
              $first: '$roomnumber',
            },
            grade: {
              $first: '$grade',
            },
            class: {
              $first: '$class',
            },
            garden: {
              $first: '$garden',
            },
            sex: {
              $first: '$sex',
            },
            week: {
              $first: '$week',
            },
            leader: {
              $first: '$leader',
            },
            desc: {
              $addToSet: '$desc',
            },
            count: {
              $sum: 1,
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


  getDailyData(condition: any) {
    return new Promise(async (resolve, reject) => {
      try {
        let client: MongoClient = await MongoClient.connect(this.config.dburl)
        let collection: Collection = client.db(this.config.dbname).collection('dailies')
        let cursor = await collection.aggregate([{
          $project: {
            grade: 1,
            sex: 1,
            garden: 1,
            week: 1,
            roomnumber: 1,
            desc: 1,
            class: 1,
            date: 1,
          },
        }, {
          $match: condition,
        }, {
          $group: {
            _id: {
              roomnumber: '$roomnumber',
            },
            roomnumber: {
              $first: '$roomnumber',
            },
            grade: {
              $first: '$grade',
            },
            class: {
              $first: '$class',
            },
            garden: {
              $first: '$garden',
            },
            sex: {
              $first: '$sex',
            },
            week: {
              $first: '$week',
            },
            problems: {
              $push: {
                desc: '$desc',
                date: '$date',
              },
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

export { DocumentRepository }


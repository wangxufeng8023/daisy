#!/usr/bin/env node

/**
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 * 
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */


import { MongoClient, ObjectId, Db, Collection, Cursor } from "mongodb"
import { DaisyConfig } from "../types/daisy"

const config: DaisyConfig = require('../config/daisyconfig.json')
const dburl: string = config.dburl
const dbname: string = config.dbname

/**
 * 数据库增删改查功能函数。
 */
class MongoData {
  collection: string

  constructor(collection: string) {
    this.collection = collection
  }
  /**
   * 新增记录。
   */
  create(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        let client = await MongoClient.connect(dburl)
        const db = client.db(dbname)
        let r = await db.collection(this.collection).insertOne(data)
        resolve(r.insertedId)
        client.close()
      } catch (err) {
        console.log(err.stack)
        reject(err)
      }
    })
  }
  /**
   * 查询记录。
   */
  find(condition: any) {
    return new Promise(async (resolve, reject) => {
      try {
        let client = await MongoClient.connect(dburl)
        const db = client.db(dbname)
        let r = await db.collection(this.collection).find(condition).toArray()
        resolve(r)
        client.close()
      } catch (err) {
        console.log(err.stack)
        reject(err)
      }
    })
  }
  /**
   * 修改一条记录
   * @param objId 要修改的记录 id
   */
  update(objId: string, obj: any) {
    return new Promise(async (resolve, reject) => {
      const id: ObjectId = new ObjectId(objId)
      try {
        let client = await MongoClient.connect(dburl)
        const db = client.db(dbname)
        let r = await db.collection(this.collection)
          .updateOne({
            _id: id,
          }, { $set: obj })
        resolve(r.modifiedCount)
        client.close()
      } catch (err) {
        console.log(err.stack)
        reject(err)
      }
    })
  }
  /**
   * 删除一条记录。
   */
  delete(objId: any) {
    return new Promise(async (resolve, reject) => {
      const id: ObjectId = new ObjectId(objId)
      try {
        let client = await MongoClient.connect(dburl)
        const db = client.db(dbname)
        let r = await db.collection(this.collection).deleteOne({ _id: id })
        resolve(r.deletedCount)
        client.close()
      } catch (err) {
        console.log(err.stack)
        reject(err)
      }
    })
  }
}

export { MongoData }

#!/usr/bin/env node

/**
 * @file mongo-data.ts 数据持久层
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 *
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */

import { MongoClient, ObjectId, Db, MongoClientOptions } from 'mongodb'
import { DaisyConfig } from '../types/daisy'

const config: DaisyConfig = require('../../config/daisyconfig.json')
const dburl: string = config.dburl
const dbname: string = config.dbname

/**
 * 数据持久层类
 */
class MongoData {
  collection: string
  /**
   * :BUG: 连接的时候必须设置 IPV4，网上搜索到这个是一个 BUG，文档可能会更新，同时默认值可能会修改为 4
   * 设置 options 为 { family: 4 }
   */
  options: MongoClientOptions

  constructor(collection: string) {
    this.collection = collection
    this.options = { family: 4 }
  }

  /**
   * 获取数据库连接
   */
  async getClient(): Promise<MongoClient> {
    return await MongoClient.connect(dburl, this.options)
  }
  /**
   * 保存数据到数据库
   * @param data 要持久的数据
   */
  create(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        let client: MongoClient = await this.getClient()
        const db = client.db(dbname)
        console.log('data', data)
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
   * 从数据库查找数据
   * @param condition 查找条件
   */
  find(condition: any) {
    return new Promise(async (resolve, reject) => {
      try {
        let client = await this.getClient()
        const db = client.db(dbname)
        let r = await db
          .collection(this.collection)
          .find(condition)
          .toArray()
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
        let client = await this.getClient()
        const db = client.db(dbname)
        let r = await db.collection(this.collection).updateOne(
          {
            _id: id
          },
          { $set: obj }
        )
        resolve(r.modifiedCount)
        client.close()
      } catch (err) {
        console.log(err.stack)
        reject(err)
      }
    })
  }
  /**
   * 删除一条数据
   * @param objId 要删除的数据 id
   */
  delete(objId: any) {
    return new Promise(async (resolve, reject) => {
      const id: ObjectId = new ObjectId(objId)
      try {
        let client = await this.getClient()
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

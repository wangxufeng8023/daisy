#!/usr/bin/env node

/**
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 * 
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */

import * as Koa from "koa"
import {
  MongoClient,
  Db,
  Collection,
  Cursor,
  MongoClientOptions
} from 'mongodb'

import { MongoData } from "../domains/mongo-data"

import { DaisyConfig } from "../types/daisy"

/**
 * 基本数据服务类。
 */
abstract class BaseRepository {
  collection: string
  config: DaisyConfig
  options: MongoClientOptions
  

  constructor(collection: string) {
    this.collection = collection
    this.config = require('../config/daisyconfig.json')
     this.options = new Object()
     this.options.family = 4
  }

  /**
   * 新建内务检查记录。
   */
  create(obj: any) {
    return new MongoData(this.collection).create(obj)
  }
  /**
   * 查询内务检查记录。
   */
  find(condition: any) {
    return new MongoData(this.collection).find(condition)
  }
  /**
   * 更新记录
   */
  update(objId: string, obj: any) {
    return new MongoData(this.collection).update(objId, obj)
  }
  /**
   * 删除一条内务检查记录。
   */
  delete(objId: string) {
    return new MongoData(this.collection).delete(objId)
  }
}

export { BaseRepository }


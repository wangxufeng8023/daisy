#!/usr/bin / env node

/**
 * @file 内务检查管理后端路由
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 * 
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */

import * as Router from "koa-router"
import * as moment from "moment"
import { MongoClient } from "mongodb"


let router = new Router()

import { ClassController } from "../controllers/class-controller"
import { DailyController } from "../controllers/daily-controller"
import { UtilsController } from "../controllers/utils-controller"
import { DocumentController } from "../controllers/document-controller"
import { DaisyConfig } from "../types/daisy"


const config: DaisyConfig = require('../config/daisyconfig.json')
router.prefix(config.url_prefix)

/**
 * # 工具路由
 */


 /**
  * 清空数据库的集合
  */
router.get('/reset', UtilsController.resetDb)
 /**
  * 测试数据库连通。
  */
router.get('/connect', UtilsController.testConnection)

/**
 * 读取配置文件，下发到客户端显示。
 */
router.get('/config', UtilsController.getConfig)

/**
 * 保存客户端发来的配置信息。
 */
router.post('/config', UtilsController.setConfig)

/**
 * 备份数据
 */
router.get('/backup', UtilsController.backupDb)

/**
 * # 业务路由处理
 */
router.get('/classes', ClassController.index)
router.post('/classes', ClassController.create)
router.put('/classes/:id', ClassController.update)
router.delete('/classes/:id', ClassController.delete)


router.get('/dailies', DailyController.index)
router.post('/dailies', DailyController.create)
router.delete('/dailies/:id', DailyController.delete)

router.get('/dailies/suggestions', DailyController.suggestion)
router.get('/dailies/grades', DailyController.getGrades)


router.get('/dormitories', ClassController.getDormitory)


router.get('/documents', DocumentController.export)

router.get('/downloads', DocumentController.download)

export { router as index }




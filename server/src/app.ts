#!/usr/bin/env node

/**
 * @file 主程序
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 *
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */

import * as Koa from 'koa'
const app = new Koa()
import * as json from 'koa-json'
import * as bodyParser from 'koa-bodyparser'
import * as logger from 'koa-logger'
import * as staticer from 'koa-static'

import { index } from './routes/index'
import { DaisyConfig } from './types/daisy'

// for dev
let cors: any = require('koa2-cors')

// middlewares
app.use(
  bodyParser({
    enableTypes: ['json', 'form', 'text']
  })
)
app.use(json())
app.use(logger())
app.use(staticer(__dirname + '/public'))

// logger
app.use(async (ctx, next) => {
  const start: any = new Date()
  await next()
  const stop: any = new Date()
  const ms: any = stop - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

app.use(cors())

// routes
app.use(index.routes())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})

export { app }

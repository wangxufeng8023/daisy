#!/usr/bin/env node

/**
 * @file 检查记录控制器
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 * 
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */

import * as Koa from "koa"
import { DaisyConfig } from "../types/daisy"

import { DailyService } from "../services/daily-service";
import { DailyRepository } from "../repositories/daily-repository"

/**
 * 检查记录控制器
 */
class DailyController {

    static async index(ctx: Koa.Context, next: Function) {
        const r = await new DailyService(
            new DailyRepository('dailies')).find(ctx);
        ctx.body = r
    }

    static async create(ctx: Koa.Context, next: Function) {
        const r = await new DailyService(
            new DailyRepository('dailies')).create(ctx);
        ctx.body = r
    }

    static async delete(ctx: Koa.Context, next: Function) {
        const r = await new DailyService(
            new DailyRepository('dailies')).delete(ctx);
        ctx.body = r
    }
    static async suggestion(ctx: Koa.Context, next: Function) {
        let r = await new DailyService(
            new DailyRepository('dailies')).suggestion()
        ctx.body = r

    }

    static async getGrades(ctx: Koa.Context, next: Function) {
        let r = await new DailyService(
            new DailyRepository('dailies')).getGradesDailies(ctx)
        ctx.body = r
    }



}

export { DailyController }
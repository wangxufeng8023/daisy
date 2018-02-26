#!/usr/bin/env node

/**
 * @file 工具类
 * @author Angela-1 <ruoshui_engr@163.com>
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 *
 * © 2017-2018 Angela 版权所有。开源仅用于学术交流分享，商业使用请联系作者。
 */

import * as fs from 'fs'
import * as path from 'path'
import * as moment from 'moment'
import { spawn } from 'child_process'

const configFile: string = path.join(__dirname, '../config/daisyconfig.json')

import { DaisyConfig } from '../types/daisy'

/**
 * 工具类，读取保存配置文件，备份数据库。
 */
class Utils {
  static saveSetting(configObj: any) {
    return new Promise(
      (resolve: (value?: string) => void, reject: (error?: any) => void) => {
        fs.writeFile(
          configFile,
          JSON.stringify(configObj, null, 4),
          (err: NodeJS.ErrnoException) => {
            if (err) {
              reject(err)
            } else {
              resolve(configFile)
            }
          }
        )
      }
    )
  }

  /**
   * 备份数据库数据到文件。
   * @param collection 集合名称
   */
  static backupData(collection: string): string {
    const resultFilePath: string = path.resolve(
      path.join(
        __dirname,
        '../../backup/',
        moment().format('YYYYMMDD'),
        collection + '_' + moment().format('YYYYMMDD') + '.json'
      )
    )
    spawn('mongoexport', [
      '-d',
      'sanitation',
      '-c',
      collection,
      '-o',
      resultFilePath
    ])
    // let mongoexport = spawn('mongoexport', ['-d', 'sanitation', '-c', 'daily', '-o', resultFilePath]);
    // // 捕获标准输出并将其打印到控制台
    // mongoexport.stdout.on('data', function(data) {
    //   console.log('standard output:\n' + data);
    // });
    // // 捕获标准错误输出并将其打印到控制台
    // mongoexport.stderr.on('data', function(data) {
    //   console.log('standard error output:\n' + data);
    // });
    // // 注册子进程关闭事件
    // mongoexport.on('exit', function(code, signal) {
    //   console.log('child process eixt ,exit:' + code);
    // });
    return resultFilePath
  }
}

export { Utils }

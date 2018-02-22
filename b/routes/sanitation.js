/**
 * @file 内务检查管理系统后端路由。
 * @author ruoshui_engr@163.com (Angela-1)
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 * 
 * © 2017 Angela 版权所有。代码开源仅用于学术交流分享，商业使用请联系作者。
 */
'use strict';
let express = require('express');
let router = express.Router();
let config = require('../config');
let MongoClient = require('mongodb').MongoClient;
let Daily = require('../modules/daily');
let Setting = require('../modules/setting');
let Dormitory = require('../modules/dormitory');
let moment = require('moment');
/**
 * 测试用，支持跨域
 */
router.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers',
    'Content-Type,Content-Length, Authorization, Accept,X-Requested-With'
  );
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  res.header('X-Powered-By', ' 3.2.1');
  next();
});
/**
 * 初始化数据库，清空现有数据。
 */
router.get('/initdb', function(req, res, next) {
  const InitDbCollection = {
    CLASSES: 'classes',
    DAILY: 'daily',
  };
  const url = config.service.dbUrl;
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log(err);
    } else {
      switch (req.query.db) {
        case InitDbCollection.CLASSES:
          console.log('drop classes');
          // db.collection('classes').drop();
          break;
        case InitDbCollection.DAILY:
          console.log('drop daily');
          // db.collection('daily').drop();
          break;
        default:
          console.log('no action');
          break;
      }
    }
  });
  res.sendStatus(200);
});
/**
 * 测试数据库是否连通。
 */
router.get('/connect', function(req, res) {
  const url = config.service.dbUrl;
  MongoClient.connect(url, function(err, db) {
    if (err) {
      res.sendStatus(404);
    } else {
      res.sendStatus(200);
    }
  });
});
/**
 * GET 获取一个年级所有班级宿舍数据。
 */
router.get('/classes', async function(req, res, next) {
  let result = await Dormitory.find(req);
  res.send(result);
});
/**
 * POST 新建一个班级宿舍数据。
 */
router.post('/classes', async function(req, res, next) {
  let result = await Dormitory.create(req);
  res.send(result);
});
/**
 * PUT 更新一个班级宿舍数据。
 */
router.put('/classes/:id', async function(req, res) {
  let result = await Dormitory.update(req);
  res.send(result);
});
/**
 * DELETE 删除一个班级宿舍数据。
 */
router.delete('/classes/:id', async function(req, res, next) {
  let result = await Dormitory.delete(req);
  res.send(result);
});
/*
 * GET 从班级数据中按院子提取宿舍数据
 */
router.get('/dormitory', async function(req, res) {
  let result = await Dormitory.getDormitory(req);
  res.send(result);
});
/**
 * 新增一条检查记录。
 */
router.post('/daily', async function(req, res) {
  const dailyData = await Daily.create(req);
  res.send(dailyData);
});
/**
 * 获取检查数据。
 */
router.get('/daily', async function(req, res) {
  const dailyData = await Daily.find(req);
  res.send(dailyData);
});
/**
 * 删除一条检查数据。
 */
router.delete('/daily/:id', async function(req, res) {
  const dailyData = await Daily.delete(req);
  res.send(dailyData);
});
/**
 * 获取配置信息。
 */
router.get('/setting', async function(req, res) {
  res.send(config.service.setting);
});
/**
 * 保存配置信息。
 */
router.post('/setting', async function(req, res) {
  let setting = req.body;
  setting.dateRange.from = moment(setting.dateRange.from).format(
    'YYYY-MM-DD');
  setting.dateRange.to = moment(setting.dateRange.to).format('YYYY-MM-DD');
  Setting.saveSetting(setting);
  res.sendStatus(200);
});
/**
 * 导出内务检查表。
 */
router.get('/daily/report', async function(req, res) {
  const dailyData = await Daily.getReportData(req);
  let result = '';
  
  if (req.query.format === 'docx') {
    result = await Daily.exportReportPdf(dailyData);
  } else {
    result = await Daily.exportReportPdf(dailyData);
  }
  res.send(result);
});
/**
 * 导出通报表。
 */
router.get('/daily/notice', async function(req, res) {
  const noticeData = await Daily.getNoticeOfCriticismData(req);
  let result = '';
  if (req.query.format === 'docx') {
    result = await Daily.exportNoticeDocx(noticeData);
  } else {
    result = await Daily.exportNoticePdf(noticeData);
  }
  res.send(result);
});
/**
 * 导出班级宿舍表。
 */
router.get('/daily/dormitory', async function(req, res) {
  const dormitoryData = await Daily.getDormitoryData(req);
  let result = '';
  if (req.query.format === 'docx') {
    result = await Daily.exportDormitoryDocx(dormitoryData);
  } else {
    result = await Daily.exportDormitoryPdf(dormitoryData);
  }
  res.send(result);
});
router.get('/daily/all', async function(req, res) {
  const noticeData = await Daily.getNoticeOfCriticismData(req);
  let qs = req;

  qs.query.sex = '男生';
  const dailyData = await Daily.getReportData(qs);

  qs.query.sex = '女生';
  const dailyData2 = await Daily.getReportData(qs);
  let result1 = '';
  let result2 = '';
  let result3 = '';
  if (req.query.format === 'docx') {
    result1 = await Daily.exportReportDocx(dailyData);
    result2 = await Daily.exportReportDocx(dailyData2);
    result3 = await Daily.exportNoticeDocx(noticeData);
  } else {
    result1 = await Daily.exportReportPdf(dailyData);
    result2 = await Daily.exportReportPdf(dailyData2);
    result3 = await Daily.exportNoticePdf(noticeData);
  }
  res.send([result1, result2, result3]);
});
/**
 * 下载文件
 */
router.get('/download', async function(req, res) {
  res.download(req.query.file);
});
/**
 * 获取已有内务检查年级。
 */
router.get('/daily/grades', async function(req, res) {
  const grades = await Daily.getGrades(req, res);
  res.send(grades);
});
/**
 * 获取一个年级已有检查数据。
 */
router.get('/daily/gradedailys', async function(req, res) {
  const weeks = await Daily.getGradeDailys(req);
  res.send(weeks);
});
/**
 * 备份数据库数据到 json 文件。
 */
router.get('/backupdata', async function(req, res) {
  Setting.backupData('classes');
  Setting.backupData('daily');
  res.sendStatus(200);
});
/**
 * 获取存在的问题描述，用于生成自动完成。
 */
router.get('/suggestion', async function(req, res) {
  let result = await Daily.suggestion('aa');
  res.send(result);
});
/**
 * 导出后端路由。
 * @type {router}
 */
module.exports = router;
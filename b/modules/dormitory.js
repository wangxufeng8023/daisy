/**
 * @file 班级宿舍管理模块。
 * @author ruoshui_engr@163.com (Angela-1)
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 * 
 * © 2017 Angela 版权所有。代码开源仅用于学术交流分享，商业使用请联系作者。
 */

'use strict';

let MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;

let config = require('../config');
let dbUrl = config.service.dbUrl;

/**
 * 班级宿舍类，包括增删改查函数。
 */
class Dormitory {
  /**
   * 查询一个年级所有班级的宿舍数据。
   * @param  {Request} req 获取年级 grade 参数
   * @return {Array<Object>} 一个年级所有班级的宿舍
   */
  static find(req) {
    return new Promise((resolve, reject) => {
      let grade = req.query.grade;
      MongoClient.connect(dbUrl, function(err, db) {
        if (err) {
          reject(err);
        } else {
          let collection = db.collection('classes');
          collection.find({
            grade: {
              $eq: grade,
            },
          }).toArray(function(err, result) {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
            db.close();
          });
        }
      });
    });
  }
  /**
   * 创建一个新的班级宿舍数据。
   * @param  {Request} req 获取 req.body 获取班级宿舍数据
   * @return {Object} 创建数据的情况
   */
  static create(req) {
    return new Promise(function(resolve, reject) {
      MongoClient.connect(dbUrl, function(err, db) {
        if (err) {
          reject(err);
        } else {
          let collection = db.collection('classes');
          collection.insert(req.body, function(err, result) {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
            db.close();
          });
        }
      });
    });
  }
  /**
   * 更新一个班级宿舍数据。
   * @param  {Request} req 获取 req.body 班级宿舍数据
   * @return {Object}     更新数据的情况
   */
  static update(req) {
    return new Promise(function(resolve, reject) {
      let obj = req.body;
      let objId = req.params.id;
      MongoClient.connect(dbUrl, function(err, db) {
        if (err) {
          reject(err);
        } else {
          let collection = db.collection('classes');
          const id = new ObjectID(objId);
          collection.updateOne({
            _id: id,
          }, {
            $set: {
              grade: obj.grade,
              class: obj.class,
              teacher: obj.teacher,
              rooms: obj.rooms,
            },
          }, function(err, result) {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
            db.close();
          });
        }
      });
    });
  }
  /**
   * 删除一个班级宿舍数据。
   * @param  {Request} req 获取要删除的数据 id
   * @return {Object}     删除数据的情况
   */
  static delete(req) {
    return new Promise(function(resolve, reject) {
      let objId = req.params.id;
      MongoClient.connect(dbUrl, function(err, db) {
        if (err) {
          reject(err);
        } else {
          let collection = db.collection('classes');
          const id = new ObjectID(objId);
          collection.deleteOne({
            _id: id,
          }, function(err, result) {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
            db.close();
          });
        }
      });
    });
  }
  /**
   * 按照院子获取一个年级所有宿舍数据。
   * @param  {Request} req 获取年级 grade
   * @return {Array<Object>}     按院子分的宿舍数据
   */
  static getDormitory(req) {
    return new Promise((resolve, reject) => {
      let grade = req.query.grade;
      MongoClient.connect(dbUrl, function(err, db) {
        if (err) {
          reject(err);
        } else {
          let collection = db.collection('classes');
          collection.aggregate([{
            $project: {
              rooms: 1,
              class: 1,
              teacher: 1,
              grade: 1,
            },
          }, {
            $unwind: '$rooms',
          }, {
            $match: {
              grade: grade,
            },
          }, {
            $group: {
              _id: {
                garden: '$rooms.garden', // 按照所在的院子进行聚合
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
          }, ], function(err, result) {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
            db.close();
          });
        }
      });
    });
  }
}

/**
 * 导出班级宿舍类。
 * @type {Dormitory}
 */
module.exports = Dormitory;

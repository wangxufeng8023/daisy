/**
 * @file 内务检查的功能模块，提供获取、导出数据的函数。
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
let DocxTemplate = require('./docx_template.js');
let PdfTemplate = require('./pdf_template.js');
/**
 * 内务检查类，包含内务检查功能函数。
 */
class Daily {
  /**
   * 新建内务检查记录。
   */
  static create(req) {
    return new Promise((resolve, reject) => {
      let obj = req.body;
      obj.date = new Date(obj.date);
      MongoClient.connect(dbUrl, function(err, db) {
        if (err) {
          reject(err);
        } else {
          let collection = db.collection('daily');
          collection.insert(obj, function(err, result) {
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
   * 查询内务检查记录。
   */
  static find(req) {
    return new Promise((resolve, reject) => {
      let where = req.query;
      let condition = this._assembleCondition(where);
      MongoClient.connect(dbUrl, function(err, db) {
        if (err) {
          reject(err);
        } else {
          let collection = db.collection('daily');
          collection.find(condition).toArray(function(err, result) {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
            db.close();
          });
        };
      });
    });
  }
  /**
   * 删除一条内务检查记录。
   */
  static delete(req) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(dbUrl, function(err, db) {
        if (err) {
          reject(err);
        } else {
          let collection = db.collection('daily');
          const objId = req.params.id;
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
   * 获取内务检查数据。
   */
  static getReportData(req) {
    return new Promise((resolve, reject) => {
      let where = req.query;
      let condition = this._assembleCondition(where);

      let that = this;
      MongoClient.connect(dbUrl, function(err, db) {
        if (err) {
          reject(err);
        } else {
          let collection = db.collection('daily');
          collection.aggregate([{
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
          }, ], async function(err, result) {
            if (err) {
              reject(err);
            } else {
              let gl = that._assembleData(result);
              let data = {
                grade: req.query.grade,
                week: req.query.week,
                sex: req.query.sex,
                row: that._reduceData(gl),
              };

              resolve(data);
              db.close();
            }
          });
        }
      });
    });
  }
  /**
   * 导出内务检查情况表。
   */
  static exportReportPdf(data) {
    return new Promise(async (resolve, reject) => {
      let pdf = new PdfTemplate('report', data);
      const reportFilePath = await pdf.generate2();
      if (reportFilePath.length > 0) {
        resolve(reportFilePath);
      } else {
        reject(new Error('生成失败。'));
      }
    });
  }
  static exportReportDocx(data) {
    return new Promise(async (resolve, reject) => {
      let docx = new DocxTemplate('report', data);
      const reportFilePath = await docx.generate();
      if (reportFilePath.length > 0) {
        resolve(reportFilePath);
      } else {
        reject(new Error('生成失败。'));
      }
    });
  }
  /**
   * 获取班级宿舍数据。
   */
  static getDormitoryData(req) {
    return new Promise(async (resolve, reject) => {
      let allRooms = await this.getAllRooms(req);
      let problemRooms = await this.getProblemRooms(req);
      let goodRooms = await this.getGoodRooms(allRooms, problemRooms);
      let twoProblemRooms = problemRooms.filter((a) => {
        return a.count > 1;
      });
      twoProblemRooms.sort(this._sortClass);
      let sg = await this._assembleRooms(goodRooms);
      let stp = await this._assembleRooms(twoProblemRooms);
      let data = {
        grade: req.query.grade,
        week: req.query.week,
        goodRooms: sg,
        twoProblemRooms: stp,
      };
      resolve(data);
    });
  }
  /**
   * 获取内务通报批评的数据，出现三次及以上问题的宿舍。
   */
  static getNoticeOfCriticismData(req) {
    return new Promise(async (resolve, reject) => {
      let problemRooms = await this.getProblemRooms(req);
      let threeProblemRooms = problemRooms.filter((a) => {
        return a.count > 2;
      });
      threeProblemRooms.sort(this._sortClass);
      let maleProblemRooms = threeProblemRooms.filter((b) => {
        return b.sex === '男生';
      });
      let femaleProblemRooms = threeProblemRooms.filter((c) => {
        return c.sex === '女生';
      });
      let maleProblems = await this._assembleNoticeOfCriticism(
        maleProblemRooms);
      let femaleProblems = await this._assembleNoticeOfCriticism(
        femaleProblemRooms);
      let data = {
        grade: req.query.grade,
        week: req.query.week,
        maleproblems: maleProblems,
        femaleproblems: femaleProblems,
        malenil: maleProblems.length === 0 ? '无。' : '',
        femalenil: femaleProblems.length === 0 ? '无。' : '',
      };
      resolve(data);
    });
  }
  /**
   * 导出内务检查通报表。
   */
  static exportNoticePdf(data) {
    return new Promise(async (resolve, reject) => {
      let pdf = new PdfTemplate('notice', data);
      const reportFilePath = await pdf.generate2();
      if (reportFilePath.length > 0) {
        resolve(reportFilePath);
      } else {
        reject(new Error('生成失败。'));
      }
    });
  }
  static exportNoticeDocx(data) {
    return new Promise(async (resolve, reject) => {
      let docx = new DocxTemplate('notice', data);
      const reportFilePath = await docx.generate();
      if (reportFilePath.length > 0) {
        resolve(reportFilePath);
      } else {
        reject(new Error('生成失败。'));
      }
    });
  }
  /**
   * 导出班级宿舍情况表。
   */
  static exportDormitoryPdf(data) {
    return new Promise(async (resolve, reject) => {
      let pdf = new PdfTemplate('dormitory', data);
      const reportFilePath = await pdf.generate2();
      if (reportFilePath.length > 0) {
        resolve(reportFilePath);
      } else {
        reject(new Error('生成失败。'));
      }
    });
  }
  static exportDormitoryDocx(data) {
    return new Promise(async (resolve, reject) => {
      let docx = new DocxTemplate('dormitory', data);
      const reportFilePath = await docx.generate();
      if (reportFilePath.length > 0) {
        resolve(reportFilePath);
      } else {
        reject(new Error('生成失败。'));
      }
    });
  }
  /**
   * 获取各年级各周内务检查数据。
   */
  static getGradeDailys(req) {
    return new Promise((resolve, reject) => {
      let where = req.query;
      let condition = this._assembleCondition(where);
      MongoClient.connect(dbUrl, function(err, db) {
        if (err) {
          reject(err);
        } else {
          let collection = db.collection('daily');
          collection.aggregate([{
            $project: {
              grade: 1,
              week: 1,
              date: 1,
            },
          }, {
            $match: condition,
          }, {
            $group: {
              _id: {
                grade: '$grade',
              },
              grade: {
                $first: '$grade',
              },
              weeks: {
                $addToSet: '$week',
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
  /**
   * 组装通报批评的数据。
   */
  static _assembleNoticeOfCriticism(rooms) {
    return new Promise((resolve, reject) => {
      let roomsList = [];
      if (rooms.length === 0) {
        resolve(roomsList);
      }
      // 从数组第一项开始，记录班号
      let indexClass = parseInt(rooms[0].class);
      let male = [];
      let female = [];
      let teacher = '';
      for (let r in rooms) {
        let one = rooms[r];
        // 顺序检测数组里班号，如果不同说明到下一个班了，把上一个班的存储。
        if (parseInt(one.class) !== indexClass) {
          roomsList.push({
            class: indexClass,
            teacher: teacher,
            male: male,
            female: female,
          });
          male = [];
          female = [];
          teacher = '';
        }
        // 新的一项，读取班号，分宿舍，分老师。
        indexClass = parseInt(one.class);
        if (one.sex === '男生') {
          male.push(one.roomnumber + '宿舍。扣分原因：' + one.desc + '。');
        } else {
          female.push(one.roomnumber + '宿舍。扣分原因：' + one.desc + '。');
        }
        teacher = one.teacher;
        // 最后一项，把之前一项存储。
        if (parseInt(r) === (rooms.length - 1)) {
          roomsList.push({
            class: indexClass,
            teacher: teacher,
            male: male,
            female: female,
          });
          male = [];
          female = [];
        }
      }
      resolve(roomsList);
    });
  }
  /**
   * 内务使用函数，组装查询字符串为查询条件。
   */
  static _assembleCondition(where) {
    if (where.week !== undefined) {
      where.week = parseInt(where.week); // 周存储的是数字，所以需要转换。
    }
    let queryList = [{
      date: {
        $gte: new Date(config.service.setting.dateRange.from),
        $lte: new Date(config.service.setting.dateRange.to),
      },
    }, ];
    for (let k in where) {
      if (k === 'format') {
        continue;
      }
      queryList.push({
        [k]: where[k],
      });
    }
    let condition = {
      $and: queryList,
    };
    return condition;
  }
  /**
   * 组装 word 文档的 raw xml 数据。
   */
  static _assembleData(result) {
    const wpPre =
      `
              <w:p><w:pPr>
              <w:spacing w:line="240" w:lineRule="exact"/>
              <w:jc w:val="left"/>
              </w:pPr>`;
    const wpPost = '</w:p>';
    let wrBdr =
      '<w:bdr w:val="single" w:sz="4" w:space="0" w:color="FF0000"/>';
    const wtDia =
      `
              <w:r><w:rPr><w:color w:val="FF0000"/>
              </w:rPr>
              <w:t>♦</w:t></w:r>`;
    const wtRedPre =
      `
              <w:r><w:rPr><w:b/>
              </w:rPr><w:t>`;
    const wtDiaBdr =
      `
              <w:r><w:rPr><w:color w:val="FF0000"/>${wrBdr}
              </w:rPr>
              <w:t>♦</w:t></w:r>`;
    const wtRedPreBdr =
      `
              <w:r><w:rPr><w:b/>
              ${wrBdr}
              </w:rPr><w:t>`;
    const wtEmPre = '<w:r><w:rPr><w:b/></w:rPr><w:t>';
    const spanPre = '<w:r><w:t>';
    const spanPost = '</w:t></w:r>';
    let gl = [];
    result.forEach(function(a) {
      for (let j in a.problems) {
        let d = {};
        if (a.problems.length === 2) {
          d.class = 'class' + a.class;
          d.desc = wpPre + wtDia + wtRedPre + a.roomnumber + spanPost +
            spanPre + '：' + spanPost + wpPost +
            wpPre + spanPre + a.problems[j].desc + spanPost + wpPost;
        } else if (a.problems.length >= 3) {
          d.class = 'class' + a.class;
          d.desc = wpPre + wtDiaBdr + wtRedPreBdr + a.roomnumber +
            spanPost + spanPre + '：' + spanPost + wpPost +
            wpPre + spanPre + a.problems[j].desc + spanPost +
            wpPost;
        } else {
          d.class = 'class' + a.class;
          d.desc = wpPre + wtEmPre + a.roomnumber + spanPost + spanPre +
            '：' + spanPost + wpPost +
            wpPre + spanPre + a.problems[j].desc + spanPost + wpPost;
        }
        d['index'] = new Date(a.problems[j].date).getDay();
        gl.push(d);
      }
    });
    return gl;
  }
  /**
   * 组装情况表的班级数据。
   */
  static _reduceData(data) {
    let wk = {
      '1': '周一',
      '2': '周二',
      '3': '周三',
      '4': '周四',
      '5': '周五',
    };
    const wpPre =
      `
              <w:p><w:pPr>
              <w:spacing w:line="240" w:lineRule="exact"/>
              <w:jc w:val="left"/>
              </w:pPr>`;
    const wpPost = '</w:p>';
    let newResult = [];
    let initObj = {
      class1: wpPre + wpPost,
      class2: wpPre + wpPost,
      class3: wpPre + wpPost,
      class4: wpPre + wpPost,
      class5: wpPre + wpPost,
      class6: wpPre + wpPost,
      class7: wpPre + wpPost,
      class8: wpPre + wpPost,
      class9: wpPre + wpPost,
      class10: wpPre + wpPost,
      class11: wpPre + wpPost,
      class12: wpPre + wpPost,
      class13: wpPre + wpPost,
      class14: wpPre + wpPost,
      class15: wpPre + wpPost,
      class16: wpPre + wpPost,
      class17: wpPre + wpPost,
      class18: wpPre + wpPost,
    };
    for (let i = 1; i < 6; i++) {
      let oneDayData = data.filter((v) => {
        return v.index === i;
      });
      let row = {};
      if (oneDayData.length > 0) {
        row = oneDayData.reduce((p, n) => Object.assign({}, p, {
          index: wk[n.index],
          [n.class]: p[n.class] === wpPre + wpPost ? n.desc : p[n.class] +
            n.desc,
        }), initObj);
      } else {
        initObj['index'] = wk[i];
        row = initObj;
      }
      newResult.push(row);
    }
    return newResult;
  }
  /**
   * 根据班级排序。
   */
  static _sortClass(a, b) {
    return parseInt(a.class) - parseInt(b.class);
  }
  /**
   * 组装宿舍数据。
   */
  static _assembleRooms(rooms) {
    return new Promise((resolve, reject) => {
      let roomsList = [];
      if (rooms.length === 0) {
        resolve(roomsList);
      }
      // 从数组第一项开始，记录班号
      let indexClass = parseInt(rooms[0].class);
      let male = [];
      let female = [];
      let teacher = '';
      for (let r in rooms) {
        let one = rooms[r];
        // 顺序检测数组里班号，如果不同说明到下一个班了，把上一个班的存储。
        if (parseInt(one.class) !== indexClass) {
          roomsList.push({
            class: indexClass,
            teacher: teacher,
            male: male,
            female: female,
          });
          male = [];
          female = [];
          teacher = '';
        }
        // 新的一项，读取班号，分宿舍，分老师。
        indexClass = parseInt(one.class);
        if (one.sex === '男生') {
          male.push(one.roomnumber + '-' + one.leader);
        } else {
          female.push(one.roomnumber + '-' + one.leader);
        }
        teacher = one.teacher;
        // 最后一项，把之前一项存储。
        if (parseInt(r) === (rooms.length - 1)) {
          roomsList.push({
            class: indexClass,
            teacher: teacher,
            male: male,
            female: female,
          });
          male = [];
          female = [];
        }
      }
      resolve(roomsList);
    });
  }
  /**
   * 获取表扬的宿舍。
   * @param  {list} allRooms     所有的宿舍。
   * @param  {list} problemRooms 有问题的宿舍。
   * @return {list}              表扬的宿舍。
   */
  static getGoodRooms(allRooms, problemRooms) {
    return new Promise((resolve, reject) => {
      let goodRooms = [];
      for (let i in allRooms) {
        // garden
        for (let j in allRooms[i].rooms) {
          // room
          let room = allRooms[i].rooms[j];
          let yorn = true;
          problemRooms.forEach((a) => {
            if ((a.leader === room.leader) &&
              (a.roomnumber === room
                .roomnumber)) {
              yorn = false;
            }
          });
          if (yorn) {
            goodRooms.push(room);
          };
        }
      }
      goodRooms.sort(this._sortClass);
      resolve(goodRooms);
    });
  }
  /**
   * 获取一个年级所有宿舍。
   */
  static getAllRooms(req) {
    return new Promise((resolve, reject) => {
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
              grade: req.query.grade,
            },
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
  /**
   * 获取一周的有问题的宿舍。
   */
  static getProblemRooms(req) {
    return new Promise((resolve, reject) => {
      let where = req.query;
      let condition = this._assembleCondition(where);
      MongoClient.connect(dbUrl, function(err, db) {
        if (err) {
          reject(err);
        } else {
          let collection = db.collection('daily');
          collection.aggregate([{
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
          }, ], function(err, result) {
            if (err) {
              reject(err);
            } else {
              let problemRooms = result;
              resolve(problemRooms);
            }
            db.close();
          });
        }
      });
    });
  }
  /**
   * 获取数据库中存在的年级。
   */
  static getGrades(req) {
    return new Promise(function(resolve, reject) {
      MongoClient.connect(dbUrl, function(err, db) {
        if (err) {
          reject(err);
        } else {
          let collection = db.collection('classes');
          collection.aggregate([{
            $project: {
              grade: 1,
            },
          }, {
            $group: {
              _id: 0,
              grades: {
                $addToSet: '$grade',
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
  /**
   * 问题的建议模块。
   * @param  {string} str 用户输入字符串
   * @return {array<string>}     返回可能的字符串列表
   */
  static suggestion() {
    return new Promise(function(resolve, reject) {
      MongoClient.connect(dbUrl, function(err, db) {
        if (err) {
          reject(err);
        } else {
          let collection = db.collection('daily');
          collection.aggregate([{
            $project: {
              desc: 1,
            },
          }, {
            $group: {
              _id: 0,
              desc: {
                $addToSet: '$desc',
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
 * 导出内务检查类。
 * @type {Daily}
 */
module.exports = Daily;

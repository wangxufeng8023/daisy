/**
 * @file 各模块均可使用的共同的功能函数
 * @author ruoshui_engr@163.com (Angela-1)
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 *
 * © 2017 Angela 版权所有。代码开源仅用于学术交流分享，商业使用请联系作者。
 */

'use strict'

let sortRoomNumber = function(a, b) {
  return parseInt(a.roomnumber) - parseInt(b.roomnumber)
}

let sortNumber = function(a, b) {
  return b - a
}

let sortGradeDailys = function(a, b) {
  return parseInt(b.grade) - parseInt(a.grade)
}

let sortClasses = function(a, b) {
  return parseInt(a.class) - parseInt(b.class)
}

let getFloor = function(room) {
  room['floor'] = room.roomnumber.substring(0, 1)
  return room
}

let sortLen = function(a, b) {
  return a.length - b.length
}

module.exports = {
  sortNumber,
  sortRoomNumber,
  sortClasses,
  getFloor,
  sortGradeDailys,
  sortLen
}

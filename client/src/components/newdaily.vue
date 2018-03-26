<!-- 
新增内务检查标签页面。
 -->
<style scoped>
.dormitory-btn {
  margin: 5px 5px 0 0;
  font-size: 16px;
  border-radius: 0;
}

.dormitory-btn:hover {
  background-color: #cdc8eb;
}

.floor-num {
  padding: 5px 20px 0 0;
  font-size: 16px;
  vertical-align: middle;
  line-height: 30px;
}

.piece {
  margin: 2px;
  padding: 0 10px;
  border: 1px dashed #cdc8eb;
  line-height: 20px;
}

.piece:hover {
  cursor: pointer;
}

.suggestion {
  margin-left: 20px;
}

.suggestion-list {
  list-style-type: decimal;
  list-style-position: inside;
}

.warning {
  border: 1px solid red;
}

.subsection {
  min-height: 200px;
}
</style>
<template>
  <div class="subsection">
    <h2 class="section-title">
      宿舍列表
      <Button @click="refresh" type="text" size="small">
        <Icon type="ios-refresh-empty" :size="14"></Icon>
        刷新
      </Button>
    </h2>
    <div>
      <div class="toolbar">
        <div class="toolbar-item">
          <label for="">年级：</label>
          <Select style="width:100px" v-model="showGrade">
            <Option v-for="(item,index) in gradeList" :value="item" :key="'g'+index">{{ item }}</Option>
          </Select>
        </div>
        <div class="toolbar-item">
          <label for="">院子：</label>
          <Select style="width:100px" v-model="showGarden">
            <Option v-for="(item,index) in gardenList" :value="item" :key="index+item">{{ item }}</Option>
          </Select>
        </div>
        <Button @click="query">
          <Icon type="ios-arrow-right"></Icon>
          查询
        </Button>
      </div>
    </div>
    <div class="layout vertical">
      <div v-for="(item,index) in roomsData" :key="index+item" v-if="item._id.garden === showGarden">
        <h3 class="section-title">{{ item._id.garden }}</h3>
        <div class="layout horizontal center" v-if="floor.length > 0" :key="floor+index" v-for="(floor,index) in item.rooms">
          <div class="floor-num">{{ floor[0].floor }} 楼</div>
          <Button v-for="r in floor" :key="r.roomnumber" @click="showRoomModal(r)" class="dormitory-btn">{{ r.roomnumber }}</Button>
        </div>
      </div>
    </div>
    <Modal v-model="newRecordModal" width="1000" :styles="{top: '20px'}">
      <h2 slot="header">{{ roomTitle }}</h2>{{this.newRecord}}
      <div class="layout horizontal">
        <div>
          <Form :label-width="60" label-position="left">
            <Form-item label="周次：">
              <Input-number :max="30" :min="1" v-on:on-change="getWeek" :class="newRecord.week === '0' ? 'warning' : ''" v-model="selectWeek"></Input-number>
            </Form-item>
            <Form-item label="日期：">
              <Date-picker readonly v-model="newRecord.date" type="date" style="width: 220px"></Date-picker>
            </Form-item>
            <Form-item>
              <Date-picker :open="true" v-model="newRecord.date" type="date">
                <div></div>
              </Date-picker>
            </Form-item>
          </Form>
        </div>
        <div>
          <Form :label-width="80">
            <Form-item label="问题描述：">
              <div class="layout vertical">
                <div class="layout horizontal">
                  <Input class="flex-1" v-model="newRecord.desc" style="min-width:220px;" type="textarea" :autosize="{minRows: 3, maxRows: 6}" placeholder="请输入..."></Input>
                  <div class="suggestion flex-1">
                    <span class="piece" v-if="suggestion.length > 0" v-for="(item, index) in suggestion" :key="index+item" @click="addDesc">{{ item }}</span>
                  </div>
                </div>
                <div class="layout horizontal center">
                  <div v-if="lastDesc !== ''">
                    上一问题
                    <span class="piece" @click="addDesc">{{ lastDesc }}</span>
                  </div>
                  <div style="width:20px;" v-if="lastDesc !== ''"></div>
                  分隔线
                  <span class="piece" @click="addDesc">|</span>
                  <div style="width:20px;"></div>
                  清空
                  <span class="piece" @click="clearDesc">
                    <Icon type="arrow-left-a"></Icon>
                  </span>
                </div>
                <dl>
                  <dt>床号</dt>
                  <dd class="layout horizontal wrap">
                    <span class="piece" v-for="b in issueDesc.bed" @click="addDesc">{{ b }}</span>
                  </dd>
                  <dt>位置</dt>
                  <dd class="layout horizontal wrap">
                    <span class="piece" v-for="p in issueDesc.pos" @click="addDesc">{{ p }}</span>
                  </dd>
                  <dt>物品</dt>
                  <dd class="layout horizontal wrap">
                    <span class="piece" v-for="g in issueDesc.good" @click="addDesc">{{ g }}</span>
                  </dd>
                  <dt>问题</dt>
                  <dd class="layout horizontal wrap">
                    <span class="piece" v-for="i in issueDesc.issue" @click="addDesc">{{ i }}</span>
                  </dd>
                </dl>
              </div>
            </Form-item>
          </Form>
        </div>
      </div>
      <div slot="footer">
        <div class="layout horizontal">
          <div class="flex"></div>
          <Button @click="cancel">取消</Button>
          <Button type="primary" @click="saveRecord">确定</Button>
        </div>
      </div>
    </Modal>
  </div>
</template>
<script>
'use strict'

import config from '../config'
import utils from '../utils'
import axios from 'axios'
import moment from 'moment'

const prefix = config.service.apiUrl

export default {
  data() {
    return {
      loading: false,
      gardenList: ['雅苑', '和苑', '馨苑'],
      issueDesc: {
        bed: ['1床', '2床', '3床', '4床', '5床', '6床', '7床', '8床', '空床'],
        pos: [
          '阳台',
          '水池',
          '卫生间',
          '洗漱台',
          '脸盆',
          '厕坑',
          '室内',
          '桌子',
          '柜子',
          '窗台',
          '地板',
          '墙面',
          '下',
          '上'
        ],
        good: ['床单', '被子', '物品', '洗漱用品', '鞋子', '毛巾'],
        issue: [
          '皱',
          '脏',
          '有灰',
          '不规范',
          '不整齐',
          '乱放',
          '垃圾未倒',
          '有油污',
          '有污渍'
        ]
      },
      gradeList: [],
      newRecordModal: false,
      currentRoom: {},
      roomsData: [],
      selectWeek: 0,
      newRecord: {
        date: moment().format('YYYY-MM-DD'),
        week: '0',
        garden: '',
        roomnumber: '',
        leader: '',
        sex: '',
        desc: '',
        class: '',
        grade: '',
        teacher: ''
      },
      lastDesc: '',
      showGrade: '',
      showGarden: '雅苑',
      allSuggestion: [],
      suggestion: []
    }
  },
  created: function() {
    this.fetch()
  },
  computed: {
    roomTitle: function() {
      const roomTitle =
        this.currentRoom.grade +
        '届' +
        this.currentRoom.class +
        '班' +
        '-' +
        this.currentRoom.roomnumber +
        '-' +
        this.currentRoom.leader +
        ' ' +
        this.currentRoom.garden +
        '-' +
        this.currentRoom.sex
      return roomTitle
    }
  },
  watch: {
    'newRecord.desc': 'showSuggestion'
  },
  methods: {
    refresh() {
      this.fetch()
    },
    clearDesc() {
      this.newRecord.desc = ''
    },
    addDesc(a) {
      let span = a.target.childNodes[0].data
      this.newRecord.desc += span
    },
    async fetch() {
      this.$Loading.start()
      await this.fetchGrades()
      await this.fetchRoomsData()

      // this.fetchGrades().then(() => {
      //   this.fetchRoomsData()
      // })
      this.fetchDesc()
      this.$Loading.finish()
    },
    fetchGrades() {
      return new Promise((resolve, reject) => {
        const url = prefix + '/classes/grades'
        axios
          .get(url)
          .then(res => {
            this.gradeList = []
            res.data[0].grades.forEach(v => {
              this.gradeList.push(v)
            })
            this.gradeList.sort(utils.sortNumber)
            this.showGrade = this.gradeList[0]
            resolve(this.showGrade)
          })
          .catch(err => {
            reject(err)
            console.log(err)
          })
      })
    },
    query() {
      this.$emit('loading')
      this.fetchRoomsData()
    },
    getDate(e) {
      this.newRecord.date = e
    },
    getWeek(e) {
      this.newRecord.week = e.toString()
      console.log(this.newRecord)
    },
    saveRecord() {
      const url = prefix + '/dailies'

      this.newRecord.garden = this.currentRoom.garden
      this.newRecord.roomnumber = this.currentRoom.roomnumber
      this.newRecord.leader = this.currentRoom.leader
      this.newRecord.class = this.currentRoom.class
      this.newRecord.teacher = this.currentRoom.teacher
      this.newRecord.grade = this.currentRoom.grade
      this.newRecord.sex = this.currentRoom.sex

      this.newRecord.week = this.newRecord.week.toString()

      console.log(this.newRecord)

      axios
        .post(url, this.newRecord)
        .then(res => {
          this.newRecordModal = false
          this.lastDesc = this.newRecord.desc
          this.newRecord.desc = ''
          this.$Message.info('新增一条检查记录。')
        })
        .catch(function(err) {
          console.log(err)
        })
    },
    cancel() {
      this.newRecordModal = false
      this.newRecord.desc = ''
    },
    showRoomModal: function(room) {
      this.newRecordModal = true
      this.currentRoom = room
    },
    fetchRoomsData: function() {
      return new Promise((resolve, reject) => {
        const url = prefix + '/dormitories?grade=' + this.showGrade

        axios
          .get(url)
          .then(res => {
            let rooms = res.data.slice()
            rooms.forEach(a => {
              let floors = {
                '1': [],
                '2': [],
                '3': [],
                '4': [],
                '5': [],
                '6': []
              }
              let tf = a.rooms.map(utils.getFloor)

              tf.forEach(dd => {
                floors[dd.floor].push(dd)
              })
              for (let ff in floors) {
                if (floors[ff].length > 0) {
                  floors[ff].sort(utils.sortRoomNumber)
                }
              }
              a.rooms = floors
            })
            this.roomsData = rooms
            resolve(rooms)
          })
          .catch(function(err) {
            reject(err)
            console.log(err)
          })
      })
    },
    fetchDesc() {
      const url = prefix + '/dailies/suggestions'
      const that = this

      axios
        .get(url)
        .then(function(res) {
          that.allSuggestion = res.data[0].desc
        })
        .catch(function(err) {
          console.log(err)
        })
    },
    unique(arr) {
      let result = []
      let hash = {}
      for (let i = 0, elem; (elem = arr[i]) != null; i++) {
        if (!hash[elem] && elem !== '') {
          result.push(elem)
          hash[elem] = true
        }
      }
      return result
    },
    showSuggestion: function() {
      let str = this.newRecord.desc
      if (str === '' || str.indexOf('|') > 0) {
        this.suggestion = []
      } else {
        let re = str.match(/^\d+床/)
        let re2 = new RegExp(str)
        if (re !== null) {
          str = str.replace(/\d+床/, '')
          re2 = new RegExp('^\\d+床' + str)
        }
        let nsug = this.allSuggestion
          .filter(v => {
            return v.match(re2)
          })
          .filter(v => {
            return v.indexOf('|') === -1
          })
          .map(v => {
            return v.replace(/\d+床/, '').replace(str, '')
          })
          .sort(utils.sortLen)
          .slice(0, 10)
        this.suggestion = this.unique(nsug)
      }
    }
  }
}
</script>

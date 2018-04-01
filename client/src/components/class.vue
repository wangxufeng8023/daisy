<!-- 
班级宿舍管理页面模块。
 -->

<template>
  <div class="page">
    <div class="spin layout horizontal center">
      <Spin class="spin-item" v-if="loading"></Spin>
      <Spin class="spin-item" size="large" v-if="loading"></Spin>
      <Spin class="spin-item" v-if="loading"></Spin>
    </div>
    <h2 class="section-title">
      班级宿舍
      <Button @click="refresh" type="text" size="small">
        <Icon type="ios-refresh-empty" :size="14"></Icon>
        刷新
      </Button>
    </h2>
    <div class="toolbar">
      <div class="toolbar-item">
        <label for="">年级：</label>
        <Select placeholder="请选择年级" v-model="showGrade" style="width:100px">
          <Option v-for="(item,index) in gradeList" :value="item" :key="item+index">{{ item }}</Option>
        </Select>
      </div>
      <Button @click="query">
        <Icon type="ios-arrow-right"></Icon>
        查询
      </Button>
      <div class="flex"></div>
      <Input placeholder="请输入班级或班主任姓名查询..." 
        style="width: 200px;" v-model="searchStr" v-on:on-change="search"></Input>
      <div class="flex"></div>
      <div class="toolbar-item">
        <Button @click="exportData">
          <Icon type="ios-download-outline"></Icon>
          导出班级宿舍数据
        </Button>
      </div>
      <div class="toolbar-item">
        <Button @click="showNewModal = true">
          <Icon type="ios-plus-empty"></Icon>
          新增班级
        </Button>
      </div>
    </div>
    <Table border ref="table" no-data-text="空" :columns="columns2" :data="classesData"></Table>
    <!-- 新增班级宿舍对话框 -->
    <div>
      <Modal v-model="showNewModal" title="新增班级宿舍">
        <div>
          <Form :label-width="80">
            <Form-item label="年级：">
              <Input v-model="newClass.grade" style="width:200px">
              <span slot="append">届</span>
              </Input>
            </Form-item>
            <Form-item label="班级：">
              <Input v-model="newClass.class" style="width:200px">
              <span slot="append">班</span>
              </Input>
            </Form-item>
            <Form-item label="班主任：">
              <Input v-model="newClass.teacher" style="width:200px"></Input>
            </Form-item>
            <Form-item label="宿舍：">
              <ul>
                <li v-for="(r,ind) in newClass.rooms" :key="r+ind">
                  <div class="layout horizontal center">
                    <Button type="text" size="small" @click="delRoom(ind)">
                      <Icon type="close-round"></Icon>
                    </Button>
                    <Select placeholder="院子" size="small" v-model="r.garden" style="width:100px">
                      <Option v-for="(item,index) in gardenList" 
                        :value="item" :key="index">{{ item }}</Option>
                    </Select>
                    <Select placeholder="性别" size="small" v-model="r.sex" style="width:100px">
                      <Option v-for="(item,index) in sexList" :value="item" :key="index">{{ item }}</Option>
                    </Select>
                    <Input style="width:100px" size="small" 
                      v-model="r.roomnumber" placeholder="房间"></Input>
                    <Input style="width:150px" size="small" v-model="r.leader" placeholder="舍长"></Input>
                  </div>
                </li>
                <li>
                  <Button size="small" type="dashed" style="width:100px;" @click="addRoom">
                    <Icon type="plus-round"></Icon>
                  </Button>
                </li>
              </ul>
            </Form-item>
          </Form>
        </div>
        <div slot="footer">
          <div class="action layout horizontal">
            <div class="flex"></div>
            <Button @click="reset">取消</Button>
            <Button type="primary" @click="createClass">添加</Button>
          </div>
        </div>
      </Modal>
      <!-- 编辑班级宿舍 -->
      <Modal v-model="showEditModal" title="编辑班级宿舍">
        <Form :label-width="80">
          <Form-item label="年级：">
            <Input v-model="newClass.grade" style="width:200px">
            <span slot="append">届</span>
            </Input>
          </Form-item>
          <Form-item label="班级：">
            <Input v-model="newClass.class" style="width:200px">
            <span slot="append">班</span>
            </Input>
          </Form-item>
          <Form-item label="班主任：">
            <Input style="width:200px" v-model="newClass.teacher"></Input>
          </Form-item>
          <Form-item label="宿舍：">
            <ul>
              <li v-for="(r,ind) in newClass.rooms" :key="r+ind">
                <div class="layout horizontal center">
                  <Button size="small" @click="delRoom(ind)">
                    <Icon type="close-round"></Icon>
                  </Button>
                  <Select placeholder="院子" size="small" v-model="r.garden" style="width:100px">
                    <Option v-for="(item,index) in gardenList" 
                      :value="item" :key="index">{{ item }}</Option>
                  </Select>
                  <Select placeholder="性别" size="small" v-model="r.sex" style="width:100px">
                    <Option v-for="(item,index) in sexList" :value="item" :key="index">{{ item }}</Option>
                  </Select>
                  <Input style="width:100px" size="small" v-model="r.roomnumber" placeholder="房间"></Input>
                  <Input style="width:150px" size="small" v-model="r.leader" placeholder="舍长"></Input>
                </div>
              </li>
              <li>
                <Button size="small" type="dashed" style="width:100px;" @click="addRoom">
                  <Icon type="plus-round"></Icon>
                </Button>
              </li>
            </ul>
          </Form-item>
        </Form>
        <div slot="footer">
          <div class="action layout horizontal">
            <div class="flex"></div>
            <Button @click="cancel">取消</Button>
            <Button type="primary" @click="saveClass">保存</Button>
          </div>
        </div>
      </Modal>
      <!-- 生成 PDF 文件时显示一个模态对话框，不可关闭 -->
      <Modal v-model="downloading" :mask-closable="false" :closable="false" width="300">
        <Spin fix class="loading-modal">
          <Icon type="load-c" size=16 class="circle-loading"></Icon>
          <div>正在生成文档... 请稍候。</div>
        </Spin>
        <div slot="footer"></div>
      </Modal>
    </div>
  </div>
</template>
<script>
'use strict'

import config from '../config'
import utils from '../utils'
import axios from 'axios'

const prefix = config.service.apiUrl

export default {
  data() {
    return {
      downloading: false,
      loading: false,
      searchStr: '',
      sourceClasses: [],
      showConfirm: true,
      showGrade: '2018',
      showNewModal: false,
      showEditModal: false,
      newRoom: {
        garden: '',
        sex: '',
        roomnumber: '',
        leader: ''
      },
      newClass: {
        grade: '',
        class: '',
        teacher: '',
        rooms: []
      },
      gardenList: [
        '和苑', '雅苑', '馨苑'
      ],
      sexList: [
        '男生', '女生'
      ],
      gradeList: [],
      columns2: [{
        title: '年级',
        key: 'grade',
        render: (h, params) => {
          return h('span', {
            style: {
              fontSize: '16px'
            }
          }, params.row.grade)
        }
      }, {
        title: '班级',
        key: 'class',
        render: (h, params) => {
          return h('span', {
            style: {
              fontSize: '32px'
            }
          }, params.row.class)
        }
      }, {
        title: '班主任',
        key: 'teacher',
        render: (h, params) => {
          return h('span', {
            style: {
              fontSize: '20px'
            }
          }, params.row.teacher)
        }
      }, {
        title: '房间',
        key: 'rooms',
        width: 300,
        render: (h, params) => {
          return h('ul', {
            style: {
              listStyleType: 'decimal',
              listStylePosition: 'inside'
            }
          }, this.roomColRender(h, params.row))
        }
      }, {
        title: '操作',
        key: 'action',
        width: 160,
        render: (h, params) => {
          return h('div', [
            h('Button', {
              props: {
                type: 'text',
                size: 'small'
              },
              style: {
                fontSize: '16px'
              },
              on: {
                click: () => {
                  this.editClass(params.row)
                }
              }
            }, '编辑'),
            this.delConfirmRender(h, params.row)
          ])
        }
      }],
      classesData: []
    }
  },
  created: function() {
    this.fetchGrade()
  },
  methods: {
    search() {
      let searchResult = []
      let src = this.sourceClasses
      let keyword = this.searchStr
      src.forEach((v) => {
        if (v.teacher.indexOf(keyword) !== -1 ||
          v.class.indexOf(keyword) !== -1) {
          searchResult.push(v)
        }
      })
      if (searchResult.length > 0) {
        this.classesData = searchResult
      } else {
        this.classesData = []
      }
    },
    refresh() {
      this.fetchGrade()
    },
    query() {
      this.loading = true
      this.fetchData()
      setTimeout(() => {
        this.loading = false
      }, 1000)
    },
    reset() {
      this.newClass = {
        // grade: '',
        // class: '',
        // teacher: '',
        rooms: []
      }
      this.showNewModal = false
    },
    prepareData() {
      let e = this.cloneObj(this.classesData)
      e.forEach((a) => {
        a = this.assembleRow(a)
      })
      return e
    },
    cloneObj(obj) {
      let newObj = {}
      if (obj instanceof Array) {
        newObj = []
      }
      for (let key in obj) {
        let val = obj[key]
        newObj[key] = typeof val === 'object' ? this.cloneObj(val) : val
      }
      return newObj
    },
    assembleRow(row) {
      let rs = ''
      row.rooms.forEach((a) => {
        let s = ''
        for (let i in a) {
          s += a[i] + '-'
        }
        s = s.substring(0, s.length - 1)
        rs += s + ';'
      })
      row.rooms = rs
      return row
    },
    exportData() {
      const url = prefix + '/documents?format=pdf&type=dormitory&grade=' + this.showGrade +
        '&week=' + 0
      this.downloading = true
      axios.get(url)
        .then((res) => {
          let fl = res.data.file_path
          let arr = fl.split('/')
          let link = config.service.host + '/archive/' + arr[arr.length - 1]
          this.downloading = false
          window.open(link)
        })
        .catch(function(err) {
          console.log(err)
        })
    },
    delConfirmRender(h, row) {
      let btn = h('Button', {
        props: {
          type: 'text',
          size: 'small'
        },
        style: {
          fontSize: '16px'
        }
      }, '删除')
      let okBtn = h('Button', {
        props: {
          type: 'warning',
          size: 'small'
        },
        style: {
          marginTop: '10px'
        },
        on: {
          click: () => {
            this.delClass(row)
          }
        }
      }, '删除')
      let btnLine = h('div', {
        class: 'layout horizontal'
      }, [h('div', {
        class: 'flex'
      }, ''), okBtn])
      let titleStr = ' ' + row.grade + '届' + row.class + '班 '
      let title = h('div', {
        slot: 'title'
      }, '确认删除？')
      let tipStr = h('div', {
        style: {
          fontSize: '14px'
        }
      }, titleStr + '的数据将会被删除。')
      let warningStr = h('div', {
        style: {
          color: '#ff0000',
          fontSize: '14px'
        }
      }, '警告：此操作不可恢复！')
      let content = h('div', {
        slot: 'content'
      }, [tipStr, warningStr, btnLine])

      let pop = h('Poptip', {
        props: {
          placement: 'top-end'
        }
      }, [btn, title, content])
      return pop
    },
    roomColRender: function(h, row) {
      let rooms = []
      let str = ''

      for (let n in row.rooms) {
        str += row.rooms[n].garden + '-' +
          row.rooms[n].sex + '-' +
          row.rooms[n].roomnumber + '-' + row.rooms[n].leader
        let cc = h('li', str)
        rooms.push(cc)
        str = ''
      }
      return rooms
    },
    delRoom: function(ind) {
      this.newClass.rooms.splice(ind, 1)
    },
    addRoom: function() {
      this.newClass.rooms.push(this.newRoom)
      this.newRoom = {
        garden: '',
        sex: '',
        roomnumber: '',
        leader: ''
      }
    },
    cancel: function() {
      this.showEditModal = false
      this.reset()
    },
    fetchGrade() {
      const url = prefix + '/classes/grades'
      axios.get(url)
        .then((res) => {
          this.gradeList = []
          res.data[0].grades.forEach(v => {
            this.gradeList.push(v)
          })
          this.gradeList.sort(utils.sortNumber)
          this.showGrade = this.gradeList[0]
          this.fetchData()
        })
        .catch(function(err) {
          console.log(err)
        })
    },
    fetchData: function() {
      const that = this
      const url = prefix + '/classes?grade=' + this.showGrade

      axios.get(url)
        .then(function(res) {
          let classes = res.data.slice()
          that.classesData = classes.sort(utils.sortClasses)
          that.sourceClasses = that.classesData.slice()
        })
        .catch(function(err) {
          console.log(err)
        })
    },
    delClass: function(row) {
      const url = prefix + '/classes/' + row._id
      const that = this
      axios.delete(url)
        .then(function(res) {
          that.$Message.info('删除了一个班级的数据。')
          that.fetchData()
        })
        .catch(function(err) {
          console.log(err)
        })
    },
    editClass: function(row) {
      this.showEditModal = true
      this.newClass = row
    },
    saveClass: function() {
      const url = prefix + '/classes/' + this.newClass._id
      const that = this
      axios.put(url, this.newClass)
        .then(function(res) {
          that.showEditModal = false
          that.fetchData()
          that.reset()
          that.$Message.info('更新了一个班级的数据。')
        })
        .catch(function(err) {
          console.log(err)
        })
    },
    createClass: function() {
      const url = prefix + '/classes'
      const that = this

      axios.post(url, this.newClass)
        .then(function(res) {
          that.showNewModal = false
          console.log('s', res)
          that.fetchData()
          that.reset()
          that.$Message.info('新增一个班级的数据。')
        })
        .catch(function(err) {
          console.log(err)
        })
    }
  }
}
</script>

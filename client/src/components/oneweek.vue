<!-- 
一周内务检查详细情况页面。
 -->
<template>
  <div class="subsection">
    <h2 class="section-title">
      内务检查详细列表
      <Button @click="refresh" type="text" size="small">
        <Icon type="ios-refresh-empty" :size="14"></Icon>
        刷新
      </Button>
    </h2>
    <div class="toolbar">
      <div class="toolbar-item">
        <label for="">年级：</label>
        <Select style="width:100px" v-model="showGrade">
          <Option v-for="(item,index) in gradeList" 
            :value="item.grade" :key="index+item.grade">{{ item.grade }}</Option>
        </Select>
      </div>
      <div class="toolbar-item">
        <label for="">周次：</label>
        <Select style="width:100px" v-model="showWeek">
          <Option v-for="(item,index) in weekList" :value="item" :key="index+item">{{ item }}</Option>
        </Select>
      </div>
      <div class="toolbar-item">
        <label for="">院子：</label>
        <Select style="width:100px" v-model="showGarden">
          <Option v-for="(item,index) in gardenList" :value="item" :key="index+item">{{ item }}</Option>
        </Select>
      </div>
      <div class="toolbar-item">
        <label for="">性别：</label>
        <Select style="width:100px" v-model="showSex">
          <Option v-for="(item,index) in sexList" :value="item" :key="index+item">{{ item }}</Option>
        </Select>
      </div>
      <Button @click="query">
        <Icon type="ios-arrow-right"></Icon>
        查询
      </Button>
    </div>
    <div class="toolbar">
      <div class="toolbar-item">
        <Button @click="exportReport">
          <Icon type="ios-download-outline"></Icon>
          导出内务卫生情况表
        </Button>
      </div>
      <div class="toolbar-item">
        <Button @click="exportNotice">
          <Icon type="ios-download-outline"></Icon>
          导出内务卫生通报批评
        </Button>
      </div>
       <div>
          <iframe v-for="nn in 3" :id="'download' + nn" :key="nn"
          style="display: none;"></iframe>
        </div>
      <div class="toolbar-item">
        <Dropdown v-on:on-click="exportAll">
        <Button type="default">
            <Icon type="ios-download-outline"></Icon>
            下载全部

            <Icon type="arrow-down-b"></Icon>
        </Button>
        <DropdownMenu slot="list">
            <DropdownItem name="pdf">PDF格式</DropdownItem>
            <DropdownItem name="docx">DOCX格式</DropdownItem>
        </DropdownMenu>
    </Dropdown>
      </div>
    </div>
    <div class="page-info">相关结果共 {{ dailysData.length }} 条。</div>
    <Table ref="table" border no-data-text="空" :columns="columns2" :data="dailysData"></Table>
    <Modal v-model="downloading" :mask-closable="false" :closable="false" width="300">
      <Spin fix class="loading-modal">
        <Icon type="load-c" size=16 class="circle-loading"></Icon>
        <div>正在生成文档... 请稍候。</div>
      </Spin>
      <div slot="footer"></div>
    </Modal>
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
      existDailys: [],
      gardenList: [
        '雅苑', '和苑', '馨苑'
      ],
      sexList: [
        '男生', '女生'
      ],
      gradeList: [],
      weekList: [],
      columns2: [{
        type: 'index',
        title: '序号',
        width: 80
      }, {
        title: '日期',
        key: 'date'
      }, {
        title: '班级',
        key: 'detail',
        render: (h, params) => {
          return h('div', [
            this.classDetail(h, params.row)
          ])
        }
      }, {
        title: '房间',
        key: 'detail2',
        render: (h, params) => {
          return h('div', [
            this.classDetail2(h, params.row)
          ])
        }
      }, {
        title: '问题描述',
        key: 'desc',
        width: 200
      }, {
        title: '操作',
        key: 'action',
        width: 80,
        render: (h, params) => {
          return h('div', [
            this.delConfirmRender(h, params.row)
          ])
        }
      }],
      dailysData: [],
      showWeek: 0,
      showGarden: '雅苑',
      showGrade: '',
      showSex: '女生'
    }
  },
  created: function() {
    this.fetch()
  },
  methods: {
    refresh() {
      this.fetch()
    },
    fetch() {
      this.$Loading.start()
      this.fetchGradeDailys()
        .then(() => {
          this.fetchDailysData()
        })
    },
    fetchGradeDailys() {
      return new Promise((resolve, reject) => {
        const url = prefix + '/dailies/grades'
        axios.get(url)
          .then((res) => {
            this.gradeList = res.data.slice().sort(utils.sortGradeDailys)
            this.showGrade = this.gradeList[0].grade
            this.changeShowWeek()
            resolve(this.showGrade)
          })
          .catch(function(err) {
            console.log(err)
            reject(err)
          })
      })
    },
    classDetail(h, row) {
      let c = h('div', `${row.grade}届-${row.class}班`)
      let t = h('div', `班主任：${row.teacher}`)
      let classStr = h('div',
        [c, t])
      return classStr
    },
    classDetail2(h, row) {
      let r = h('div', `${row.garden}-${row.roomnumber}`)
      let l = h('div', `舍长：${row.leader}`)
      let roomStr = h('div',
        [r, l])
      return roomStr
    },
    delConfirmRender(h, row) {
      let btn = h('Button', {
        props: {
          type: 'text',
          size: 'small'
        },
        style: {
          fontSize: '14px'
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
            this.delDaily(row)
          }
        }
      }, '删除')
      let btnLine = h('div', {
        class: 'layout horizontal'
      }, [h('div', {
        class: 'flex'
      }, ''), okBtn])
      let titleStr = row.garden + '-' + row.roomnumber + ' 宿舍 ' + row.date
      let title = h('div', {
        slot: 'title'
      }, '确认删除？')
      let tipStr = h('div', {
        style: {
          fontSize: '14px'
        }
      }, titleStr + '的检查记录将会被删除。')
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
    delDaily(row) {
      const url = prefix + '/dailies/' + row._id
      const that = this
      axios.delete(url)
        .then(function(res) {
          that.fetchDailysData()
          that.$Message.info('删除一条内务检查记录。')
        })
        .catch(function(err) {
          console.log(err)
        })
    },
    query() {
      this.$emit('loading')
      this.fetchDailysData()
    },
    fetchDailysData() {
      const url = prefix + '/dailies?week=' + this.showWeek +
        '&garden=' + this.showGarden +
        '&grade=' + this.showGrade + '&sex=' + this.showSex

      const that = this
      axios.get(url)
        .then(function(res) {
          let dailys = res.data.slice()
          dailys.forEach(function(a, b, c) {
            c[b].date = a.date.substring(0, 10)
          })
          that.dailysData = dailys
          that.$Loading.finish()
        })
        .catch(function(err) {
          console.log(err)
        })
    },
    exportAll(format) {
      const url = prefix + '/documents?type=all&week=' + this.showWeek +
        '&grade=' + this.showGrade + '&format=' + format
      this.downloading = true
      axios.get(url)
        .then((res) => {
          let fl = res.data.file_path
          fl.forEach((v, i) => {
            i += 1
            this.downloading = false
            const link = prefix + '/downloads?file=' + v
            // window.open(link)
            window.frames['download' + i].src = link
          })
        })
        .catch(function(err) {
          console.log(err)
        })
    },
    exportReport() {
      const url = prefix + '/documents?format=pdf&type=report&week=' +
        this.showWeek + '&grade=' + this.showGrade + '&sex=' + this.showSex
      this.downloading = true
      axios.get(url)
        .then((res) => {
          let fl = res.data.file_path
          let arr = fl.split('/')
          let link = config.service.host + '/archive/' +
            arr[arr.length - 1]
          this.downloading = false
          window.open(link, 'newwindow')
        })
        .catch(function(err) {
          console.log(err)
        })
    },
    exportNotice() {
      const url = prefix + '/documents?format=pdf&type=notice&week=' + this.showWeek +
        '&grade=' + this.showGrade
      this.downloading = true
      axios.get(url)
        .then((res) => {
          let fl = res.data.file_path
          let arr = fl.split('/')
          let link = config.service.host + '/archive/' + arr[arr.length - 1]
          this.downloading = false
          window.open(link, 'newwindow')
        })
        .catch(function(err) {
          console.log(err)
        })
    },
    changeShowSex() {
      switch (this.showGarden) {
        case '雅苑':
          this.showSex = '女生'
          break
        case '和苑':
          this.showSex = '男生'
          break
        default:
          break
      }
    },
    changeShowWeek() {
      let gradeList = this.gradeList
      for (let i in gradeList) {
        if (gradeList[i].grade === this.showGrade) {
          this.weekList = gradeList[i].weeks.sort(utils.sortNumber)
          this.showWeek = this.weekList[0]
        }
      }
    }
  },
  watch: {
    'showGarden': 'changeShowSex',
    'showGrade': 'changeShowWeek'
  }
}
</script>

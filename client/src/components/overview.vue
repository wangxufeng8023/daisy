<!-- 
内务检查概览页面。
 -->
<style lang="scss" scoped>
.timeline {
  .timeline-label {
    font-size: 14px;
  }
  .selected {
    color: black;
    font-weight: bold;
  }
}

#week-chart {
  width: 100%;
  height: 300px;
}
</style>
<template>
  <div class="subsection">
    <h2 class="section-title">
    一周内务检查概览
    <Button @click="refresh" type="text" size="small">
      <Icon type="ios-refresh-empty" :size="14"></Icon>
      刷新
    </Button>
  </h2>
    <div class="toolbar">
      <div class="toolbar-item">
        <label for="">年级：</label>
        <Select style="width:100px" v-model="showGrade">
          <Option v-for="(item,index) in gradeList" :value="item" :key="'g'+index">{{ item }}</Option>
        </Select>
      </div>
      <Button @click="query">
        <Icon type="ios-arrow-right"></Icon>
        查询
      </Button>
    </div>
    <div class="layout horizontal" v-if="existDailys.length > 0">
      <div class="flex-1">
        <Timeline class="timeline">
          <TimelineItem v-for="(w,index) in existDailys" 
            :key="'w'+index" :color="w === showWeek ? 'black' : '#cdc8eb'">
            <Icon type="arrow-right-b" slot="dot"></Icon>
            <a @click="showWeekChanged(w)" 
              :class="w === showWeek ? 'timeline-link selected' : 'timeline-link'">
              <p class="timeline-label">第 {{ w }} 周</p>
            </a>
          </TimelineItem>
        </Timeline>
      </div>
      <div class="flex-4 layout vertical">
        <div>相关结果共 {{ weekAllLength }} 条。</div>
        <div ref="ecd" id="week-chart"></div>
        <Table ref="table" border no-data-text="点击班级柱显示详情。" 
          :columns="columns" :data="dailysData"></Table>
      </div>
    </div>
    <div v-else>高 {{ showGrade }} 届还没有内务检查数据。</div>
  </div>
</template>

<script>
'use strict'

import config from '../config'
import utils from '../utils'
import axios from 'axios'
import * as echarts from 'echarts'

const prefix = config.service.apiUrl

export default {
  data() {
    return {
      loading: false,
      existDailys: [],
      weekAllLength: 0,
      gradeList: [],
      maleCount: [],
      femaleCount: [],
      dailysData: [],
      columns: [
        {
          type: 'index',
          title: '序号',
          width: 80
        },
        {
          title: '日期',
          key: 'date'
        },
        {
          title: '班级',
          key: 'detail',
          render: (h, params) => {
            return h('div', [this.classDetail(h, params.row)])
          }
        },
        {
          title: '房间',
          key: 'detail2',
          render: (h, params) => {
            return h('div', [this.classDetail2(h, params.row)])
          }
        },
        {
          title: '问题描述',
          key: 'desc',
          width: 200
        }
      ],
      showWeek: 0,
      showGrade: ''
    }
  },
  created: function() {
    this.fetch()
  },
  methods: {
    showWeekChanged(week) {
      this.showWeek = week
      this.fetchDailysData()
    },
    show() {
      echarts.dispose(this.$refs.ecd)
      let myChart = echarts.init(this.$refs.ecd)
      let option = {
        title: {
          text: `${this.showGrade} 届第 ${this.showWeek} 周内务检查情况`
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        legend: {
          data: ['男生', '女生']
        },
        color: ['#08599C', '#EF0808'],
        calculable: true,
        yAxis: [
          {
            type: 'value',
            name: '间次'
          }
        ],
        xAxis: [
          {
            name: '班级',
            type: 'category',
            data: [
              '1',
              '2',
              '3',
              '4',
              '5',
              '6',
              '7',
              '8',
              '9',
              '10',
              '11',
              '12',
              '13',
              '14',
              '15',
              '16',
              '17',
              '18'
            ]
          }
        ],
        series: [
          {
            name: '男生',
            type: 'bar',
            stack: '总量',
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  position: 'right'
                }
              }
            },
            data: this.maleCount
          },
          {
            name: '女生',
            type: 'bar',
            stack: '总量',
            barCategoryGap: '50%',
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  position: 'right'
                }
              }
            },
            data: this.femaleCount
          }
        ]
      }
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option)
      let that = this
      myChart.on('click', function(params) {
        let classnumber = params.dataIndex + 1
        that.fetchClassData(classnumber)
      })
    },
    refresh() {
      this.fetch()
    },
    getCount(data, sex) {
      let bl = []
      for (let i = 1; i < 19; i++) {
        let ol = data.filter(v => {
          return parseInt(v.class) === i && v.sex === sex
        })
        bl.push(ol.length)
      }
      return bl
    },
    fetchClassData(classnumber) {
      let url =
        prefix +
        '/dailies?week=' +
        this.showWeek +
        '&class=' +
        classnumber +
        '&grade=' +
        this.showGrade
      let that = this
      axios
        .get(url)
        .then(function(res) {
          let dailys = res.data.slice()
          dailys.forEach(function(a, b, c) {
            c[b].date = a.date.substring(0, 10)
          })
          that.dailysData = dailys
        })
        .catch(function(err) {
          console.log(err)
        })
    },
    fetchGradeDailys() {
      let that = this
      const url = prefix + '/dailies/grades?grade=' + this.showGrade
      axios
        .get(url)
        .then(function(res) {
          if (res.data.length > 0) {
            that.existDailys = res.data[0].weeks.sort((a, b) => {
              return b - a
            })
            that.showWeek = that.existDailys[0]
            that.fetchDailysData()
          } else {
            that.existDailys = []
          }
        })
        .catch(function(err) {
          console.log(err)
        })
    },
    fetch() {
      this.$Loading.start()
      this.fetchGrades().then(() => {
        this.fetchGradeDailys()
        this.$Loading.finish()
      })
    },
    fetchGrades() {
      return new Promise((resolve, reject) => {
        const that = this
        const url = prefix + '/dailies/grades'
        axios
          .get(url)
          .then(function(res) {
            that.gradeList = []
            res.data.forEach(v => {
              that.gradeList.push(v.grade)
            })
            that.gradeList.sort(utils.sortNumber)
            that.showGrade = res.data[0].grade
            resolve(that.showGrade)
          })
          .catch(function(err) {
            reject(err)
            console.log(err)
          })
      })
    },
    classDetail(h, row) {
      let c = h('div', `${row.grade}届-${row.class}班`)
      let t = h('div', `班主任：${row.teacher}`)
      let classStr = h('div', [c, t])
      return classStr
    },
    classDetail2(h, row) {
      let r = h('div', `${row.garden}-${row.roomnumber}`)
      let l = h('div', `舍长：${row.leader}`)
      let roomStr = h('div', [r, l])
      return roomStr
    },
    query() {
      this.$emit('loading')
      this.fetchDailysData()
      this.fetchGradeDailys()
    },
    fetchDailysData() {
      const url =
        prefix + '/dailies?week=' + this.showWeek + '&grade=' + this.showGrade
      const that = this
      axios
        .get(url)
        .then(function(res) {
          that.weekAllLength = res.data.length
          that.maleCount = that.getCount(res.data, '男生')
          that.femaleCount = that.getCount(res.data, '女生')
          that.show()
        })
        .catch(function(err) {
          console.log(err)
        })
    }
  }
}
</script>
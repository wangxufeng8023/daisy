<!-- 
页面设置模块。
 -->
<template>
  <div class="page">
    <h2 class="page-title">设置</h2>
    <div class="section">
      <h3 class="section-title">常规</h3>
      <Form :model="config.daterange" label-position="top">
        <FormItem label="学期：">
          <Input v-model="config.schoolterm" placeholder="请输入" style="width:187px;"></Input>
      </FormItem>
      <FormItem label="内务数据的日期范围：">
        <div class="layout horizontal center">
          <DatePicker type="date" placeholder="开始日期" v-model="config.daterange.from"></DatePicker>
          <div style="width:50px;text-align:center;">至</div>
          <DatePicker type="date" placeholder="结束日期" v-model="config.daterange.to"></DatePicker>
        </div>
      </FormItem>
      <Button size="small" @click="saveConfig">保存修改</Button>
    </Form>
  </div>
  <div class="section">
    <h3 class="section-title">备份</h3>
    <Form label-position="top">
      <FormItem label="备份数据到服务器：">
        <Button size="small" @click="backup">备份数据</Button>
      </FormItem>
    </Form>
  </div>
  </div>
</template>
<script>
'use strict'

import config from '../config'
import axios from 'axios'

const prefix = config.service.apiUrl

export default {
  data() {
    return {
      loading: false,
      config: {
        schoolterm: '',
        daterange: {}
      }
    }
  },
  created: function() {
    this.fetch()
  },
  methods: {
    fetch() {
      const url = prefix + '/config'
      const that = this
      axios.get(url)
        .then(function(res) {
          that.config = res.data
        })
        .catch(function(err) {
          console.log(err)
        })
    },
    saveConfig() {
      const url = prefix + '/config'
      const that = this
      axios.post(url, this.config)
        .then(function(res) {
          that.showTip = false
          that.$Message.info('保存成功。')
        })
        .catch(function(err) {
          console.log(err)
        })
    },
    backup() {
      const url = prefix + '/backup'
      const that = this
      axios.get(url)
        .then(function(res) {
          that.$Message.info('备份成功。')
        })
        .catch(function(err) {
          console.log(err)
        })
    }
  }
}
</script>
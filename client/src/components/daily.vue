<!-- 
内务检查父模块，下面包含标签页页面。
 -->
<style>
/*BUG 不能隐藏左右箭头。*/
.ivu-tabs-nav-scroll-disabled {
  display: none;
}
</style>
<template>
  <div class="page">
    <div class="spin layout horizontal center">
      <Spin class="spin-item" v-if="loading"></Spin>
      <Spin class="spin-item" size="large" v-if="loading"></Spin>
      <Spin class="spin-item" v-if="loading"></Spin>
    </div>
    <h2 class="page-title">内务检查</h2>
    <p class="page-info">*本页数据的日期范围为 {{ dateRange.from }} 至 {{ dateRange.to}}。</p>
    <div class="section">
      <Tabs type="card" :animated="false">
        <!-- BUG: animated="true" 在 safari 浏览器和 iOS 系统上下拉列表位置不对。取消动画正常。 -->
        <Tab-pane label="概览" name="name1">
          <d-overview v-on:loading="showLoading"></d-overview>
        </Tab-pane>
        <Tab-pane label="详情" name="name2">
          <d-oneweek v-on:loading="showLoading"></d-oneweek>
        </Tab-pane>
        <Tab-pane label="新增" name="name3">
          <d-newdaily v-on:loading="showLoading"></d-newdaily>
        </Tab-pane>
      </Tabs>
    </div>
  </div>
</template>

<script>
'use strict'

import config from '../config'
import axios from 'axios'

import OneWeek from './oneweek'
import NewDaily from './newdaily'
import Overview from './overview'

const prefix = config.service.apiUrl

export default {
  data() {
    return {
      loading: false,
      dateRange: {}
    }
  },
  components: {
    'd-oneweek': OneWeek,
    'd-newdaily': NewDaily,
    'd-overview': Overview
  },
  created: function() {
    this.fetch()
  },
  methods: {
    fetch() {
      let url = prefix + '/config'
      let that = this
      axios.get(url)
        .then(function(res) {
          that.dateRange = res.data.daterange
        })
        .catch(function(err) {
          console.log(err)
        })
    },
    showLoading() {
      this.loading = true
      setTimeout(() => {
        this.loading = false
      }, 1000)
    }
  }
}
</script>

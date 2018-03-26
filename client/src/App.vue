<!-- 
前端页面主模块。
 -->
<template>
  <div id="app">
    <div v-if="loading">
      <!-- 若无法连接数据库，停留在载入中页面。 -->
      <Spin fix>
        <Icon type="load-c" size=28 class="circle-loading"></Icon>
        <div>雏菊 正在载入中，请稍候... </div>
      </Spin>
    </div>
    <div v-else>
      <div class="hline"></div>
      <!-- 连上数据库后，显示 frame。 -->
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
'use strict'

import config from './config'
import axios from 'axios'

const prefix = config.service.apiUrl

export default {
  name: 'app',
  data() {
    return {
      loading: true,
      interval: {}
    }
  },
  created: function(argument) {
    this.interval = setInterval(this.heartBeat, 1000)
  },
  methods: {
    heartBeat() {
      this.testConnect()
      if (!this.loading) {
        clearInterval(this.interval)
      }
    },
    testConnect() {
      const url = prefix + '/connect'
      axios
        .get(url)
        .then(res => {
          this.loading = false
        })
        .catch(err => {
          console.log(err)
          this.loading = true
        })
    }
  }
}
</script>

<style lang="scss">
@import './assets/layout.css';
@import './assets/page.scss';
</style>

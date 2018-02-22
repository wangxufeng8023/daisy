/**
 * @file 前端主程序入口。
 * @author ruoshui_engr@163.com (Angela-1)
 * 本文件是雏菊-学校内务检查管理系统的一部分。
 *
 * © 2017 Angela 版权所有。代码开源仅用于学术交流分享，商业使用请联系作者。
 */

'use strict'

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import iView from 'iview'
import './assets/iview.css'
// import 'iview/dist/styles/iview.css'

Vue.use(iView)

Vue.config.productionTip = false

iView.LoadingBar.config({
  color: '#4d4199',
  failedColor: '#f0ad4e',
  height: 4
})

router.beforeEach((to, from, next) => {
  iView.LoadingBar.start()
  next()
})

router.afterEach((to, from, next) => {
  iView.LoadingBar.finish()
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})

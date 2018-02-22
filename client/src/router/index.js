import Vue from 'vue'
import Router from 'vue-router'
// import Hello from '@/components/Hello'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    meta: {
      title: ''
    },
    redirect: '/daily',
    component: (resolve) => require(['@/components/frame.vue'], resolve),
    children: [{
      path: 'daily',
      name: 'daily',
      component: (resolve) => require(['@/components/daily.vue'], resolve)
    }, {
      path: 'class',
      name: 'class',
      component: (resolve) => require(['@/components/class.vue'], resolve)
    }, {
      path: 'setting',
      name: 'setting',
      component: (resolve) => require(['@/components/setting.vue'], resolve)
    }, {
      path: 'about',
      name: 'about',
      component: (resolve) => require(['@/components/about.vue'], resolve)
    }]
  }]
})

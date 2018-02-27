<!-- 
页面框架模块，包含导航和内容。
 -->
<style lang="scss" scoped>
.brand {
  display: flex;
  flex-direction: row;
  .brand-img {
    width: 50px;
    height: 50px;
  }

  .brand-title {
    margin-left: 10px;
    font-size: 26px;
  }
}

.nav-menu {
  margin:0 auto;max-width:1024px;
}

.frame {
  border: 1px solid #d7dde4;
  background: #f5f7f9;
}

.frame-content {
  max-width: 1024px;
  margin: 20px auto;
  overflow: hidden;
  background: #fff;
  border-radius: 4px;
  padding: 20px 50px;
}

.frame-copy {
  text-align: center;
  padding: 10px 0 20px;
  color: #9ea7b4;
}

.back-top {
  padding: 5px;
  background: rgba(77, 65, 153, .6);
  color: #fff;
  text-align: center;
  border-radius: 2px;
}

.mobile-nav {
  display: none;
}

.pc-nav {
  padding: 0 10%;
}


@media only screen and (max-width: 1023px) {
  .pc-nav {
    display: none;
  }
  .mobile-nav {
    display: flex;
    background-color: white;
    padding: 0 10px;
  }
  .mobile-brand {
    width: 32px;
  }

  .frame-content {
    margin: 20px;
    padding: 10px;
    overflow: hidden;
    background: #fff;
    border-radius: 4px;
  }
}

</style>
<template>
  <div class="frame">
    <Menu mode="horizontal" theme="light" active-name="1" v-on:on-select="routeChange" class="pc-nav">
      <div class="nav-menu layout horizontal center" style="">
        <div class="frame-logo">
          <a href="/" class="brand">
            <img src="../assets/logo.png" alt="brand" class="brand-img">  
            <span class="brand-title">雏菊</span>
          </a>
        </div>
        <div class="flex"></div>
        <div>
          <Menu-item :name="nav.name" v-for="(nav,index) in navLev1" :key="index">
            <Icon :type="nav.icon" :size="16"></Icon>
            {{ nav.title }}
          </Menu-item>
        </div>
        <div class="flex"></div>
      </div>
    </Menu>
    <div class="layout horizontal center mobile-nav">
      <a href="javascript:void(0)" @click="showMenu">
        <Icon type="close" v-if="menu"></Icon>
        <Icon type="navicon" v-else></Icon>
      </a>
      <div class="flex"></div>
      <a href="/">
        <img src="../assets/logo.png" alt="brand" class="mobile-brand"></a>
      <div class="flex"></div>
    </div>
    <div>
      <transition name="slide-fade">
        <Menu v-if="menu" v-on:on-select="routeChange" style="width:100%">
          <Menu-item :name="nav.name" v-for="(nav,index) in navLev1" :key="index">
            <Icon :type="nav.icon"></Icon>
            {{ nav.title }}
          </Menu-item>
        </Menu>
      </transition>
    </div>
    <div class="frame-content">
      <router-view></router-view>
    </div>
    <Back-top>
      <div class="back-top">返回顶部</div>
    </Back-top>
    <div class="frame-copy">
      &copy; 2017 Angela 版权所有。代码开源仅用于学术交流分享，商业使用请联系作者。
    </div>
  </div>
</template>
<script>
'use strict'

export default {
  data() {
    return {
      menu: false,
      navLev1: [{
        icon: 'ios-list-outline',
        title: '内务检查',
        name: 'daily'
      }, {
        icon: 'ios-people-outline',
        title: '班级宿舍',
        name: 'class'
      }, {
        icon: 'ios-settings-strong',
        title: '设置',
        name: 'setting'
      }, {
        icon: 'ios-information-outline',
        title: '关于',
        name: 'about'
      }]
    }
  },
  methods: {
    showMenu: function() {
      this.menu = !this.menu
    },
    routeChange: function(value) {
      this.$router.push('/' + value)
      this.menu = false
    }
  }
}
</script>

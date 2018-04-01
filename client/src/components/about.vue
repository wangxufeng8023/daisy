<!-- 
关于页面模块。
 -->
<style scoped>
#about-brand {
  width: 220px;
}
.contact {
  color: black;
  padding-right: 10px;
}
.tag {
  margin-left: 5px;
}
</style>
<template>
  <div class="page">
    <h2 class="page-title">关于雏菊</h2>
    <div class="section">
      <h3>雏菊是一个学校内务检查管理系统。</h3>
      <h3>开发代号：daisy</h3>
      <h3>给我的她！</h3>
    </div>
    <div class="section">
      <img id="about-brand" src="../assets/logo.png" alt="brand">
      <p>
        <a class="contact layout horizontal center" href="https://github.com/angela-1/daisy">
          <Icon type="social-github" size="20"></Icon>
          <span class="tag">angela-1/daisy</span>
        </a>
      </p>
      <p>当前版本：v3.2.0。</p>
      <p>发布于：2018年4月1日。</p>
      <br>
      <p class="layout-copy">代码开源仅用于学习交流分享，商业使用请联系作者。</p>
      <p>
        <a class="contact layout horizontal center" href="mailto:ruoshui_engr@163.com">
          <Icon type="ios-email" size="22"></Icon>
          <span class="tag">ruoshui_engr@163.com</span>
        </a>
      </p>
    </div>
  </div>
</template>

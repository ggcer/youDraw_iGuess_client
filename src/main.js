// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueWechatTitle from 'vue-wechat-title'
import common from '@/components/common'

Vue.use(VueWechatTitle)
Vue.config.productionTip = false
Vue.prototype.common = common		//挂载到Vue实例上面

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})

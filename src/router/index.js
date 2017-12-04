import Vue from 'vue'
import Router from 'vue-router'
import roomList from '@/components/roomList'
import main from '@/components/main'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'roomList',
      component: roomList,
      meta: {
        title: '你画我猜'
      }
    },
    {
      path: '/main',
      name: 'main',
      component: main,
      meta: {
        title: '你画我猜'
      }
    },
  ]
})

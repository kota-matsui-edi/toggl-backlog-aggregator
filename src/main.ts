import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import initialize from '@/plugin/initialize'

Vue.config.productionTip = false
initialize()

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

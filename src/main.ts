import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import initialize from '@/plugin/initialize'
import VueThinModal from 'vue-thin-modal'
import 'vue-thin-modal/dist/vue-thin-modal.css'

Vue.use(VueThinModal)
Vue.config.productionTip = false
initialize()

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

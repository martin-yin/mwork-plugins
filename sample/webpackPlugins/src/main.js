import Vue from 'vue'
import App from './App.vue'
const antd = require('ant-design-vue')

Vue.config.productionTip = false

Vue.use(antd)

new Vue({
  render: h => h(App),
}).$mount('#app')

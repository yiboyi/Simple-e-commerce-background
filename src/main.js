import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 引入全局样式表
import './assets/css/global.css'
// 引入字体图标
import './assets/fonts/iconfont.css'

// 引入树型结构
import TreeTable from 'vue-table-with-tree-grid'

// 导入富文本编辑器样式require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 导入element
import './element'
// 引入axios
import axios from 'axios'

// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios请求拦截器
axios.interceptors.request.use(config => {
  // 请求发出之前进行一些信息设置
  config.headers.Authorization = window.sessionStorage.getItem('token')
  console.log(config)
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

// 富文本编辑器注册全局可用
Vue.use(VueQuillEditor /* { default global options } */)

// 时间过滤器
Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

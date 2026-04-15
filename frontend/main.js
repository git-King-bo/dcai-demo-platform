import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './assets/theme-skins.css'
import './assets/main.css'
import { createPinia } from "pinia"
import 'element-plus/dist/index.css'
import ElementPlusCommon from './plugins/element-plus-common'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.use(ElementPlusCommon)
app.use(router)
app.use(i18n)
app.mount('#app')

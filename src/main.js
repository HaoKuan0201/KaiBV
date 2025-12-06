import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js' // 確保路徑正確

// --- [ 導入 Vuetify 相關 ] ---
import 'vuetify/styles' // 導入 Vuetify 的樣式
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css' // 導入 MDI 圖示字體

// 創建 Vuetify 實例
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    // 設定預設使用 Material Design Icons
    defaultSet: 'mdi', 
  },
  // 您可以在此處新增主題、RTL 等配置
})

// 假設您的全域 CSS 檔案放在這裡
import './style.css'

// 1. 創建 Vue 應用程式實例
const app = createApp(App)

app.use(vuetify)

// 2. 創建 Pinia 實例 (應用程式狀態管理)
const pinia = createPinia()


// 3. 註冊 Pinia 到 Vue 應用程式
app.use(pinia)

// 4. 註冊 Vue Router 到 Vue 應用程式
app.use(router)

// 5. 將應用程式掛載到 DOM
app.mount('#app')

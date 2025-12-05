import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index' // 確保路徑正確

// 假設您的全域 CSS 檔案放在這裡
import './style.css' 

// 1. 創建 Vue 應用程式實例
const app = createApp(App)

// 2. 創建 Pinia 實例 (應用程式狀態管理)
const pinia = createPinia()

// 3. 註冊 Pinia 到 Vue 應用程式
app.use(pinia)

// 4. 註冊 Vue Router 到 Vue 應用程式
app.use(router)

// 5. 將應用程式掛載到 DOM
app.mount('#app')
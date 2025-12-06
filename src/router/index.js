import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import TripPlan from '../views/TripPlan.vue'
import { useAuthStore } from '../stores/useAuthStore.js'

// 使用 import.meta.env.BASE_URL 確保路由在子目錄下正確運行
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/TripPlan',
      name: 'TripPlan',
      component: TripPlan
    },
  ]
})

// 認證守衛 - 實現環境差異化
// 已將 'from' 參數替換為 '_' 以解決 TS6133 錯誤
router.beforeEach((to, _, next) => {
  const authStore = useAuthStore()
  
  // 檢查是否處於開發模式 (npm run dev)
  const isDevMode = import.meta.env.DEV
  
  if (to.meta.requiresAuth) {
    
    // 條件 1: 開發模式，直接放行 (跳過認證)
    if (isDevMode) {
      console.log("DEV Mode: Skipping authentication check for Dashboard.")
      next()
      return
    }

    // 條件 2: 生產模式 (haokuan0201.github.io)，執行認證檢查
    // 檢查登入狀態
    if (!authStore.isLoggedIn) {
      console.log("PROD Mode: Redirecting to login.")
      // 如果需要認證但未登入，導向登入頁面並加上 redirect 參數
      next({ 
        name: 'Login', 
        query: { redirect: to.fullPath } 
      })
      return
    }
  }

  // 其他情況或已登入，繼續導航
  next()
})

export default router

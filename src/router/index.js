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
      path: '/Login',
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

router.beforeEach((to, _, next) => {
  const authStore = useAuthStore()
  
  next()
})

export default router

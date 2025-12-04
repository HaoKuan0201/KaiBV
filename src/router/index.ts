import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
// 確保您已將 useAuthStore.ts 放置在正確的路徑
import { useAuthStore } from '../stores/useAuthStore'

// 匯入頁面元件
import Home from '../views/Home.vue' // 我們假設會建立一個 Home.vue
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue' // 新增的登入頁面

// 定義路由列表的型別
const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { requiresAuth: false } // 不需登入
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true } // 需要登入才能存取
    }
]

const router = createRouter({
    // 使用 history 模式，並確保 Vite base 設定與 GitHub Pages 一致
    // /KaiGO/ 是我們在 vite.config.js 中設定的 base
    history: createWebHistory('/KaiGO/'),
    routes
})

// 全域導航守衛 (Global Navigation Guard)
// 這個守衛將在每次路由切換前檢查認證狀態
router.beforeEach(async (to) => {
    const authStore = useAuthStore()

    // 1. 如果 Store 尚未完成會話檢查，先等待
    if (authStore.loading) {
        await authStore.fetchSession()
    }

    // 2. 檢查目標路由是否需要登入
    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
        // 如果需要登入但使用者尚未登入，導向登入頁面
        return {
            name: 'Login',
            // 可以儲存原先想去的路徑，登入後再導回
            query: { redirect: to.fullPath },
        }
    }

    // 3. 如果已登入，且嘗試訪問 Login 頁面，則導向 Dashboard
    if (authStore.isLoggedIn && to.name === 'Login') {
        return { name: 'Dashboard' }
    }
})

export default router
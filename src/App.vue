<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter, RouterView, RouterLink } from 'vue-router'
// 確保您已將 useAuthStore.ts 放置在正確的路徑
import { useAuthStore } from './stores/useAuthStore'

const authStore = useAuthStore()
const router = useRouter()

// 1. 在元件掛載後執行認證邏輯
onMounted(() => {
  // 檢查現有的 Supabase 會話，並設定實時監聽器
  authStore.fetchSession()
  authStore.setupAuthListener()
})

// 2. 路由保護：監控 loading 狀態，確保使用者未登入時不能停留在 /dashboard
watch(() => authStore.loading, (newLoading) => {
  // 只有當 loading 結束後，才能確定使用者狀態
  if (!newLoading) {
    // 檢查使用者是否在受保護的 /dashboard 頁面但未登入
    if (router.currentRoute.value.path === '/dashboard' && !authStore.isLoggedIn) {
      console.log("未登入，導向首頁或登入頁...")
      router.push('/login') // 導向登入頁面
    }
  }
}, { immediate: true }) // immediate: true 確保在初始化時執行一次

/**

處理登出邏輯
*/
const handleSignOut = async () => {
  try {
    await authStore.signOut()
    // 登出後導向首頁
    router.push('/')
  } catch (error: any) {
    console.error("登出失敗:", error.message)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">

    <!-- 導航列 (Navigation Bar) -->
    <header class="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">

        <!-- Logo/Title -->
        <RouterLink to="/"
          class="text-2xl font-extrabold text-indigo-600 hover:text-indigo-800 transition duration-150">
          KaiGo ✈️
        </RouterLink>

        <!-- 導航連結與認證區塊 -->
        <nav class="flex items-center space-x-4">
          <RouterLink to="/" class="text-gray-700 hover:text-indigo-600 transition duration-150 hidden sm:inline">首頁
          </RouterLink>

          <!-- 認證狀態按鈕 -->
          <div v-if="authStore.loading" class="text-gray-500 animate-pulse text-sm">
            檢查狀態...
          </div>
          <div v-else class="flex items-center space-x-3">
            <RouterLink v-if="authStore.isLoggedIn" to="/dashboard"
              class="px-3 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 shadow-md">
              儀表板
            </RouterLink>
            <button v-if="authStore.isLoggedIn" @click="handleSignOut"
              class="px-3 py-2 text-sm font-medium rounded-lg text-indigo-600 border border-indigo-600 hover:bg-indigo-50 transition duration-150">
              登出
            </button>
            <RouterLink v-else to="/login"
              class="px-3 py-2 text-sm font-medium rounded-lg text-white bg-green-500 hover:bg-green-600 transition duration-150 shadow-md">
              登入 / 註冊
            </RouterLink>
          </div>
        </nav>
      </div>
    </header>

    <!-- 頁面內容區 (Router View) -->
    <main class="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <!-- 路由匹配的元件將在此處渲染 -->
      <RouterView />
    </main>

    <!-- 底部版權 (Footer) -->
    <footer class="bg-gray-100 border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-500">
        © 2025 KaiGo Travel Planner. All rights reserved.
      </div>
    </footer>


  </div>
</template>

<style>
/* 基礎樣式重置 - 確保 App 元件內的內容可以佈局 /
#app {
display: flex;
flex-direction: column;
min-height: 100vh;
}
/ 建議將 Tailwind CSS 基礎匯入放在 style.css 或 index.css 中 */
</style>
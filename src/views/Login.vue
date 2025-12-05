<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/useAuthStore'
import { useRouter, useRoute } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const message = ref('')
const isLoading = ref(false)
const error = ref('')

/**
 * 處理電子郵件登入/註冊 (Magic Link/OTP)
 */
const handleLogin = async () => {
    isLoading.value = true
    error.value = ''
    message.value = ''

    try {
        // 呼叫 Store 方法發送 Magic Link
        const resultMessage = await authStore.signInWithOtp(email.value)
        message.value = resultMessage 
        
    } catch (err: any) {
        // 處理 Supabase 錯誤
        error.value = err.message
    } finally {
        isLoading.value = false
    }
}

// 監聽登入狀態：如果成功登入，導向到 redirect 參數或 Dashboard
watch(() => authStore.isLoggedIn, (isLoggedIn) => {
    if (isLoggedIn) {
        // 檢查是否有 redirect 查詢參數，如果沒有則預設導向 /dashboard
        const redirectTo = route.query.redirect || '/dashboard'
        router.replace(redirectTo as string)
    }
}, { immediate: true })

// 登入卡片標題圖示 (Luicde: Send)
const SendIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 mr-2 text-white"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
`;
</script>

<template>
  <div class="flex justify-center items-start min-h-[70vh] py-10 px-4">
    <div class="w-full max-w-lg bg-white p-10 rounded-2xl shadow-2xl border border-gray-100 space-y-8 transform hover:scale-[1.01] transition duration-300">
      
      <!-- Header with Icon -->
      <div class="text-center">
        <div class="w-12 h-12 bg-indigo-600 rounded-full inline-flex items-center justify-center mb-3 mx-auto shadow-lg">
            <!-- Luicde: Lock -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h1 class="text-3xl font-extrabold text-gray-900">安全登入您的旅程</h1>
        <p class="text-md text-gray-500 mt-2">輸入電子郵件，我們使用無密碼的 Magic Link / OTP 進行認證。</p>
      </div>
      
      <!-- 登入表單 -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        
        <!-- Email Input -->
        <div>
          <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">電子郵件地址</label>
          <input 
            id="email" 
            v-model="email" 
            type="email" 
            required 
            :disabled="isLoading || !!message"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm disabled:bg-gray-50"
            placeholder="example@email.com"
          >
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          :disabled="isLoading || !!message"
          class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            發送中...
          </span>
          <span v-else class="flex items-center">
             <span v-html="SendIcon" class="w-6 h-6 mr-2"></span>
             發送登入連結
          </span>
        </button>
      </form>
      
      <!-- 訊息/錯誤顯示 -->
      <div class="space-y-3">
          <div v-if="error" class="text-sm text-red-700 p-4 bg-red-100 rounded-xl border border-red-300 transition duration-300">
            <p class="font-bold">❌ 認證錯誤:</p>
            <p>{{ error }}</p>
          </div>
          <div v-if="message" class="text-sm text-green-700 p-4 bg-green-100 rounded-xl border border-green-300 transition duration-300">
            <p class="font-bold">✅ 成功發送！</p>
            <p>{{ message }}</p>
            <p class="mt-1">請立即檢查您的收件箱，並點擊 Magic Link 完成認證。</p>
          </div>
      </div>

      <p class="text-xs text-center text-gray-400 mt-6">您的資料將被安全地儲存在 Supabase 中。</p>

    </div>
  </div>
</template>
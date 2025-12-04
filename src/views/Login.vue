<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/useAuthStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const message = ref('')
const isLoading = ref(false)
const error = ref('')

/**

處理電子郵件登入/註冊 (Magic Link/OTP)
*/
const handleLogin = async () => {
    isLoading.value = true
    error.value = ''
    message.value = ''

    try {
        const resultMessage = await authStore.signInWithOtp(email.value)
        message.value = resultMessage // 顯示成功訊息

    } catch (err: any) {
        error.value = err.message
    } finally {
        isLoading.value = false
    }
}

// 如果使用者已經登入，在載入頁面時導向儀表板
if (authStore.isLoggedIn) {
    router.replace('/dashboard')
}
</script>

<template>
    <div class="flex justify-center items-start min-h-[50vh]">
        <div class="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl space-y-6">
            <h1 class="text-3xl font-bold text-center text-gray-800">登入或註冊 KaiGo</h1>
            <p class="text-center text-gray-500">輸入您的電子郵件，我們將發送一個安全登入連結給您。</p>

            <!-- 登入表單 -->
            <form @submit.prevent="handleLogin" class="space-y-4">

                <!-- Email Input -->
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-1">電子郵件地址</label>
                    <input id="email" v-model="email" type="email" required :disabled="isLoading || !!message"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        placeholder="您常用的電子郵件">
                </div>

                <!-- Submit Button -->
                <button type="submit" :disabled="isLoading || !!message"
                    class="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:opacity-50">
                    <span v-if="isLoading" class="flex items-center">
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                            fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        發送中...
                    </span>
                    <span v-else>發送登入連結</span>
                </button>
            </form>

            <!-- 訊息/錯誤顯示 -->
            <p v-if="error" class="text-sm text-red-600 p-3 bg-red-50 rounded-lg border border-red-200">
                錯誤: {{ error }}
            </p>
            <p v-if="message" class="text-sm text-green-600 p-3 bg-green-50 rounded-lg border border-green-200">
                {{ message }}
                <br>
                請檢查您的收件箱，並點擊 Magic Link 完成登入。
            </p>

        </div>


    </div>
</template>
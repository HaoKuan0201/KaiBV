<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/useAuthStore.js'
import { useRouter, useRoute } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const message = ref('')
const isLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  isLoading.value = true
  error.value = ''
  message.value = ''

  try {
    const resultMessage = await authStore.signInWithOtp(email.value)
    message.value = resultMessage

  } catch (err: any) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

watch(() => authStore.isLoggedIn, (isLoggedIn) => {
  if (isLoggedIn) {
    const redirectTo = route.query.redirect || '/dashboard'
    router.replace(redirectTo as string)
  }
}, { immediate: true })

</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row align="start" justify="center" style="min-height: 70vh;" class="pt-10">
      <v-col cols="12" sm="8" md="6" lg="5" xl="4">
        <v-card class="pa-8 pa-sm-12 rounded-xl elevation-10" :loading="isLoading" hover>

          <div class="text-center mb-8">
            <v-avatar color="indigo-darken-2" size="60" class="mb-4 elevation-5">
              <v-icon icon="mdiLock" size="30"></v-icon>
            </v-avatar>
            <h1 class="text-h4 font-weight-black text-grey-darken-3">安全登入您的旅程</h1>
            <p class="text-subtitle-1 text-medium-emphasis mt-2">輸入電子郵件，我們使用無密碼的 Magic Link / OTP 進行認證。</p>
          </div>

          <v-form @submit.prevent="handleLogin">

            <v-text-field v-model="email" label="電子郵件地址" type="email" required variant="outlined"
              :disabled="isLoading || !!message" class="mb-4"></v-text-field>

            <v-btn type="submit" color="indigo-darken-2" size="large" block :disabled="isLoading || !!message"
              :loading="isLoading" class="mt-4">
              <v-icon icon="mdiSend" start></v-icon>
              發送登入連結
            </v-btn>
          </v-form>

          <div class="mt-6">
            <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
              <p class="font-weight-bold">❌ 認證錯誤:</p>
              {{ error }}
            </v-alert>

            <v-alert v-if="message" type="success" variant="tonal">
              <p class="font-weight-bold">✅ 成功發送！</p>
              <p>{{ message }}</p>
              <p class="mt-1">請立即檢查您的收件箱，並點擊 Magic Link 完成認證。</p>
            </v-alert>
          </div>

          <p class="text-caption text-center text-medium-emphasis mt-6">您的資料將被安全地儲存在 Supabase 中。</p>

        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
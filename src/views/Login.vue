<template>
  <v-container class="py-12">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="5">
        <v-card class="login-card" elevation="4">
          <v-card-title class="text-center py-6 bg-primary text-white">
            <div class="d-flex flex-column align-center gap-2">
              <v-icon size="48">mdi-login</v-icon>
              <span class="text-h5 font-weight-bold">登入帳戶</span>
            </div>
          </v-card-title>

          <v-card-text class="py-8">
            <v-form @submit.prevent="handleLogin">
              <!-- 帳號輸入 -->
              <div class="mb-6">
                <label class="text-subtitle-2 font-weight-bold mb-2">帳號</label>
                <v-text-field
                  v-model="form.username"
                  placeholder="輸入您的帳號"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  color="primary"
                  rounded="lg"
                  density="comfortable"
                  :disabled="isLoading"
                />
              </div>

              <!-- 密碼輸入 -->
              <div class="mb-6">
                <label class="text-subtitle-2 font-weight-bold mb-2">密碼</label>
                <v-text-field
                  v-model="form.password"
                  placeholder="輸入密碼"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  :type="showPassword ? 'text' : 'password'"
                  variant="outlined"
                  color="primary"
                  rounded="lg"
                  density="comfortable"
                  :disabled="isLoading"
                  @click:append-inner="showPassword = !showPassword"
                />
              </div>

              <!-- 錯誤訊息 -->
              <v-alert v-if="errorMessage" type="error" variant="tonal" rounded="lg" class="mb-6">
                {{ errorMessage }}
              </v-alert>

              <!-- 登入按鈕 -->
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                rounded="lg"
                class="font-weight-bold"
                :loading="isLoading"
              >
                <v-icon start>mdi-login</v-icon>
                登入
              </v-btn>
            </v-form>

            <!-- 提示 -->
            <v-alert type="info" variant="tonal" rounded="lg" class="mt-6 mb-0">
              <div class="d-flex align-center">
                <span class="text-caption">若沒有密碼，請聯絡 <strong>Kai</strong></span>
              </div>
            </v-alert>
          </v-card-text>
        </v-card>

        <!-- 返回首頁連結 -->
        <div class="text-center mt-6">
          <RouterLink to="/" class="text-decoration-none">
            <v-btn variant="text" color="primary">
              <v-icon start>mdi-arrow-left</v-icon>
              返回首頁
            </v-btn>
          </RouterLink>
        </div>
      </v-col>
    </v-row>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :timeout="snackbar.timeout" color="success">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">關閉</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore.js'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: ''
})

const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const snackbar = reactive({
  show: false,
  message: '',
  timeout: 2000
})

const handleLogin = async () => {
  // 驗證輸入
  if (!form.username.trim()) {
    errorMessage.value = '請輸入帳號'
    return
  }

  if (!form.password) {
    errorMessage.value = '請輸入密碼'
    return
  }

  // 驗證密碼
  if (form.password !== '0201') {
    errorMessage.value = '密碼錯誤'
    form.password = ''
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    // 調用 useAuthStore 的 login 函數，並傳入帳號
    const username = form.username
    isLoading.value = true
    
    await authStore.login(username)
    
    snackbar.message = `歡迎回來，${username}！`
    snackbar.show = true

    // 登入成功，跳轉到首頁
    await new Promise(resolve => setTimeout(resolve, 1500))
    await router.push('/')
  } catch (error: any) {
    errorMessage.value = error.message || '登入失敗，請稍後重試'
    console.error('Login error:', error)
    isLoading.value = false
  }
}
</script>

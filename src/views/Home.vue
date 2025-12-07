<template>
  <v-container class="py-12">
    <v-row justify="center" class="mb-8">
      <v-col cols="12" md="10" lg="8">
        <div class="hero-section">
          <img src="@/assets/images/HomeImage.jfif" class="hero-img" alt="Hero" />
          <div class="hero-overlay" />
          <div class="hero-content">
            <h1 class="text-h3 font-weight-bold mb-4">
              讓您的旅程<br>從這裡開始 ✈️
            </h1>
            <p class="text-h6 mb-8 opacity-90">
              簡單、高效、協作的旅遊規劃助手
            </p>
            <div class="d-flex justify-center flex-wrap gap-3">
              <v-btn size="x-large" color="white" class="text-primary font-weight-bold" @click="goToTripPlan" elevation="2">
                <v-icon start>mdi-map-marker-path</v-icon>
                查看行程
              </v-btn>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row justify="center" class="mb-12">
      <v-col cols="12" md="10" lg="8">
        <v-alert :color="authStore.isLoggedIn ? 'success' : 'info'" variant="tonal" border="start" rounded="lg">
          <template v-slot:prepend>
            <v-icon>{{ authStore.isLoggedIn ? 'mdi-check-circle' : 'mdi-information' }}</v-icon>
          </template>
          <div class="d-flex flex-column">
            <strong class="text-body-1">{{ authStore.isLoggedIn ? `歡迎回來，${authStore.name}` : '訪客模式' }}</strong>
            <span class="text-caption mt-1">
              {{ authStore.isLoggedIn ? '您可以完整編輯所有行程資料' : '登入後即可編輯並儲存您的專屬行程' }}
            </span>
          </div>
        </v-alert>
      </v-col>
    </v-row>

    <v-row justify="center" class="mb-12">
      <v-col cols="12" sm="6" md="3">
        <div class="feature-card">
          <span class="feature-emoji">🗺️</span>
          <h3 class="text-h6 font-weight-bold mb-2">行程管理</h3>
          <p class="text-body-2 text-medium-emphasis">輕鬆管理景點、住宿和交通，建立完美的旅遊時間表。</p>
        </div>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <div class="feature-card">
          <span class="feature-emoji">👥</span>
          <h3 class="text-h6 font-weight-bold mb-2">協作分享</h3>
          <p class="text-body-2 text-medium-emphasis">與旅伴即時同步行程，無需來回發送文件。</p>
        </div>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <div class="feature-card">
          <span class="feature-emoji">💸</span>
          <h3 class="text-h6 font-weight-bold mb-2">預算追蹤</h3>
          <p class="text-body-2 text-medium-emphasis">紀錄旅途開銷，保持預算不超標。</p>
        </div>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <div class="feature-card">
          <span class="feature-emoji">📱</span>
          <h3 class="text-h6 font-weight-bold mb-2">隨處可用</h3>
          <p class="text-body-2 text-medium-emphasis">在任何設備上存取您的行程，無縫同步。</p>
        </div>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card class="quick-start-card h-100">
          <v-card-title class="d-flex align-center">
            <v-icon color="secondary" class="mr-2">mdi-rocket-launch</v-icon>
            快速開始
          </v-card-title>
          <v-list lines="two">
            <v-list-item @click="goToTripPlan" rounded="lg" class="mb-1 list-hover">
              <template v-slot:prepend>
                <v-avatar color="primary" variant="tonal">
                  <v-icon>mdi-map</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>查看行程</v-list-item-title>
              <v-list-item-subtitle>查看旅遊行程</v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item v-if="!authStore.isLoggedIn" @click="authStore.login()" rounded="lg" class="list-hover">
              <template v-slot:prepend>
                <v-avatar color="secondary" variant="tonal">
                  <v-icon>mdi-account-plus</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>註冊帳號</v-list-item-title>
              <v-list-item-subtitle>保存您的編輯紀錄</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="tips-card h-100" color="info" variant="tonal">
          <v-card-text>
            <div class="d-flex align-center mb-4">
              <v-icon color="info" class="mr-2">mdi-lightbulb-on</v-icon>
              <span class="text-h6 font-weight-bold">使用提示</span>
            </div>
            <ul class="pl-4 text-body-2" style="line-height: 2;">
              <li>未登入可瀏覽與記錄臨時花費</li>
              <li>登入後可永久保存行程修改</li>
              <li>支援深色模式保護眼睛</li>
            </ul>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :timeout="snackbar.timeout">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">關閉</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore.js'

const router = useRouter()
const authStore = useAuthStore()

const snackbar = reactive({
  show: false,
  message: '',
  timeout: 2000
})

function goToTripPlan() {
  router.push('/TripPlan')
}
</script>
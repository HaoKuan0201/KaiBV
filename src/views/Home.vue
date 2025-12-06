<template>
  <v-container class="home-container py-12">
    <!-- Hero Section -->
    <v-row justify="center" class="mb-12">
      <v-col cols="12" md="8">
        <v-card
          class="hero-card rounded-2xl overflow-hidden"
          elevation="8"
        >
          <v-img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=400&fit=crop"
            height="300"
            cover
            class="hero-image"
          />
          <v-overlay
            :model-value="true"
            contained
            scrim="rgba(0, 0, 0, 0.4)"
            class="hero-overlay"
          />
          <v-card-text class="hero-content">
            <h1 class="text-h2 font-weight-bold text-white mb-4">
              讓您的旅程<br>從這裡開始 ✈️
            </h1>
            <p class="text-h6 text-gray-100 mb-8">
              KaiGO 是一個專為您打造的旅遊規劃助手，簡單、高效、協作
            </p>
            
            <div class="d-flex flex-wrap gap-3">
              <v-btn
                size="x-large"
                color="white"
                text-color="primary"
                variant="flat"
                class="font-weight-bold"
                @click="goToTripPlan"
              >
                <v-icon left>mdi-map-marker-path</v-icon>
                查看旅遊行程
              </v-btn>
              
              <v-btn
                v-if="!authStore.isLoggedIn"
                size="x-large"
                color="success"
                variant="flat"
                class="font-weight-bold"
                to="/login"
              >
                <v-icon left>mdi-login</v-icon>
                登入
              </v-btn>
              
              <v-btn
                v-else
                size="x-large"
                color="error"
                variant="flat"
                class="font-weight-bold"
                @click="handleSignOut"
              >
                <v-icon left>mdi-logout</v-icon>
                登出
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Auth Status Banner -->
    <v-row justify="center" class="mb-8">
      <v-col cols="12" md="8">
        <v-alert
          :type="authStore.isLoggedIn ? 'success' : 'info'"
          variant="tonal"
          rounded="lg"
          class="mb-4"
        >
          <template v-slot:prepend>
            <v-icon>{{ authStore.isLoggedIn ? 'mdi-check-circle' : 'mdi-information' }}</v-icon>
          </template>
          <div class="d-flex align-center justify-space-between">
            <div>
              <strong v-if="authStore.isLoggedIn">已登入</strong>
              <strong v-else>未登入</strong>
              <p class="text-caption mt-2">
                {{ authStore.isLoggedIn 
                  ? `帳號: ${authStore.userEmail} - 可編輯旅遊行程資料` 
                  : '可查看旅遊行程，但無法進行修改。登入後可編輯您的行程。' }}
              </p>
            </div>
          </div>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Features Section -->
    <v-row justify="center" class="mb-12">
      <v-col cols="12">
        <h2 class="text-h4 font-weight-bold text-center mb-8">主要功能</h2>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card class="feature-card h-100 rounded-xl" elevation="2">
          <v-card-text class="text-center py-8">
            <div class="text-h1 text-primary mb-4">🗺️</div>
            <h3 class="text-h6 font-weight-bold mb-2">行程管理</h3>
            <p class="text-body2 text-gray-600">
              輕鬆管理景點、住宿和交通，建立完美的旅遊時間表。
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="feature-card h-100 rounded-xl" elevation="2">
          <v-card-text class="text-center py-8">
            <div class="text-h1 text-success mb-4">👥</div>
            <h3 class="text-h6 font-weight-bold mb-2">協作分享</h3>
            <p class="text-body2 text-gray-600">
              與旅伴即時同步行程，無需來回發送文件。
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="feature-card h-100 rounded-xl" elevation="2">
          <v-card-text class="text-center py-8">
            <div class="text-h1 text-warning mb-4">💸</div>
            <h3 class="text-h6 font-weight-bold mb-2">預算追蹤</h3>
            <p class="text-body2 text-gray-600">
              紀錄旅途開銷，保持預算不超標。
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="feature-card h-100 rounded-xl" elevation="2">
          <v-card-text class="text-center py-8">
            <div class="text-h1 text-info mb-4">📱</div>
            <h3 class="text-h6 font-weight-bold mb-2">隨處可用</h3>
            <p class="text-body2 text-gray-600">
              在任何設備上存取您的行程，無縫同步。
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Links Section -->
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="rounded-xl" elevation="3">
          <v-card-title class="text-h5 font-weight-bold">快速開始</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                @click="goToTripPlan"
                class="cursor-pointer hover:bg-gray-100"
              >
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-flag-checkered</v-icon>
                </template>
                <v-list-item-title>查看曼谷旅遊行程</v-list-item-title>
                <v-list-item-subtitle>
                  {{ authStore.isLoggedIn ? '已登入，可編輯行程資料' : '未登入，可查看但不可編輯' }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-divider class="my-2" />

              <template v-if="!authStore.isLoggedIn">
                <v-list-item
                  to="/login"
                  class="cursor-pointer hover:bg-gray-100"
                >
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-account-plus</v-icon>
                  </template>
                  <v-list-item-title>登入或註冊</v-list-item-title>
                  <v-list-item-subtitle>使用電子郵件進行 Magic Link 登入</v-list-item-subtitle>
                </v-list-item>
              </template>
              <template v-else>
                <v-divider class="my-2" />
                <v-list-item
                  class="cursor-pointer hover:bg-gray-100"
                  @click="handleSignOut"
                >
                  <template v-slot:prepend>
                    <v-icon color="error">mdi-logout</v-icon>
                  </template>
                  <v-list-item-title>登出</v-list-item-title>
                  <v-list-item-subtitle>{{ authStore.userEmail }}</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Info Section -->
    <v-row justify="center" class="mt-12">
      <v-col cols="12" md="8">
        <v-card class="bg-light-blue rounded-xl" elevation="1">
          <v-card-text class="py-6">
            <v-icon color="info" class="mb-2">mdi-lightbulb-on</v-icon>
            <h4 class="text-h6 font-weight-bold mb-2">💡 使用提示</h4>
            <ul class="text-body2 text-gray-700 pl-4">
              <li>未登入時可以查看和記錄旅遊行程資料</li>
              <li>登入後可以永久保存您的行程修改</li>
              <li>Super User 可以修改旅遊行程的基本資料</li>
              <li>所有用戶都可以記錄個人的實際花費</li>
            </ul>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar for logout -->
    <v-snackbar v-model="snackbar.show" :timeout="snackbar.timeout">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">
          關閉
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore.js'

const router = useRouter()
const authStore = useAuthStore()

const snackbar = reactive({
  show: false,
  message: '',
  timeout: 2000
})

onMounted(() => {
  authStore.fetchSession()
  authStore.setupAuthListener()
})

function goToTripPlan() {
  router.push('/TripPlan')
}

async function handleSignOut() {
  try {
    await authStore.signOut()
    snackbar.message = '已登出'
    snackbar.show = true
    router.push('/')
  } catch (error: any) {
    snackbar.message = '登出失敗: ' + error.message
    snackbar.show = true
  }
}
</script>

<style scoped>
.home-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.hero-card {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.hero-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
}

.hero-image {
  position: absolute !important;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  object-fit: cover;
}

.hero-overlay {
  position: absolute !important;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  text-align: center;
  padding: 3rem 2rem;
}

.hero-content h1 {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
  line-height: 1.3;
}

.hero-content p {
  color: #f0f0f0;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.3);
  max-width: 600px;
}

.feature-card {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: white;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-color: #2196F3;
}

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.bg-light-blue {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(66, 165, 245, 0.1) 100%);
  border-left: 4px solid #2196F3;
  border-radius: 8px;
}

.text-decoration-underline {
  text-decoration: underline !important;
}

.gap-3 {
  gap: 1rem !important;
}

.gap-2 {
  gap: 0.5rem !important;
}

/* Vuetify overrides */
:deep(.v-card) {
  border-radius: 12px;
  transition: all 0.3s ease;
}

:deep(.v-alert) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.v-btn) {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  text-transform: none;
}

:deep(.v-list-item) {
  border-radius: 8px;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
}

:deep(.v-list-item:hover) {
  background-color: rgba(33, 150, 243, 0.05) !important;
}

/* Animations */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-card {
  animation: slideInUp 0.6s ease-out;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content {
    min-height: 300px;
    padding: 2rem 1rem;
  }

  .hero-content h1 {
    font-size: 2rem;
  }

  .hero-content p {
    font-size: 1rem;
  }

  .feature-card {
    margin-bottom: 1rem;
  }
}

@media (max-width: 480px) {
  .hero-content h1 {
    font-size: 1.5rem;
  }

  .hero-content p {
    font-size: 0.95rem;
  }

  .hero-content {
    min-height: 250px;
    padding: 1.5rem 1rem;
  }
}
</style>
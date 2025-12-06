<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter, RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from './stores/useAuthStore.js'

const authStore = useAuthStore()
const router = useRouter()

onMounted(() => {
  authStore.fetchSession()
  authStore.setupAuthListener()
})

watch(
  () => authStore.loading,
  (newLoading) => {
    if (!newLoading) {
      if (router.currentRoute.value.path === '/dashboard' && !authStore.isLoggedIn) {
        console.log('未登入，導向首頁或登入頁...')
        router.push('/login')
      }
    }
  },
  { immediate: true }
)

const handleSignOut = async () => {
  try {
    await authStore.signOut()
    router.push('/')
  } catch (error: any) {
    console.error('登出失敗:', error.message)
  }
}
</script>

<template>
  <v-app>
    <v-app-bar color="primary" dark sticky>
      <v-app-bar-nav-icon>
        <RouterLink to="/" class="flex items-center h-full px-2">
          <span class="text-lg font-bold text-white">KaiGo ✈️</span>
        </RouterLink>
      </v-app-bar-nav-icon>

      <v-app-bar-title class="ml-4">
        <RouterLink to="/" class="text-white no-underline hover:opacity-80 transition">
          旅遊規劃助手
        </RouterLink>
      </v-app-bar-title>

      <v-spacer />

      <div class="d-flex align-center gap-3">
        <div v-if="authStore.loading" class="text-subtitle-2">
          <v-progress-circular indeterminate size="24" width="2" color="white" />
        </div>

        <div v-else class="d-flex align-center gap-2">
          <v-btn v-if="authStore.isLoggedIn" to="/dashboard" variant="outlined" color="white" size="small"
            class="text-none">
            <v-icon left>mdi-view-dashboard</v-icon>
            儀表板
          </v-btn>

          <v-btn v-if="authStore.isLoggedIn" variant="flat" color="error" size="small" @click="handleSignOut">
            <v-icon left>mdi-logout</v-icon>
            登出
          </v-btn>

          <v-btn v-else to="/login" variant="flat" color="success" size="small" class="text-none">
            <v-icon left>mdi-login</v-icon>
            登入 / 註冊
          </v-btn>
        </div>
      </div>
    </v-app-bar>

    <v-main class="bg-gradient">
      <v-container class="py-8" fluid>
        <RouterView />
      </v-container>

      <div class="mt-12 py-6 border-t border-gray-300 text-center text-caption text-gray-600">
        <p class="mb-1">© 2025 KaiGo Travel Planner. All rights reserved.</p>
        <p class="text-xs text-gray-500">
          旅遊規劃變得簡單、高效、協作
        </p>
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
/* Vuetify 3 App Layout Styles */

:deep(.v-app) {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

:deep(.v-app-bar) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.v-app-bar-nav-icon) {
  margin-right: 0;
}

:deep(.v-main) {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 64px);
}

:deep(.v-main__wrap) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

:deep(.v-container) {
  flex: 1;
}

.bg-gradient {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

footer {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top-color: rgba(0, 0, 0, 0.1);
}

footer p {
  margin: 0;
  line-height: 1.6;
}

:deep(.v-btn) {
  text-transform: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

:deep(.v-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.v-progress-circular) {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  :deep(.v-app-bar) {
    padding: 0 8px;
  }

  :deep(.v-app-bar-title) {
    font-size: 1rem;
  }

  footer {
    font-size: 0.875rem;
  }
}

a {
  text-decoration: none;
  color: inherit;
}

.no-underline {
  text-decoration: none !important;
}

.text-none {
  text-transform: none !important;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 1rem;
}
</style>
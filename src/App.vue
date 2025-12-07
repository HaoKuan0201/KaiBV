<template>
  <v-app>
    <v-app-bar elevation="0" class="px-2">

      <v-app-bar-title>
        <RouterLink to="/" class="text-white text-decoration-none d-flex align-center">
          <span class="text-h6 font-weight-bold">KaiGo ✈️</span>
        </RouterLink>
      </v-app-bar-title>

      <v-spacer />

      <div class="d-flex align-center gap-2">
        <v-btn icon @click="toggleTheme" title="切換主題">
          <v-icon>{{ isDark ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}</v-icon>
        </v-btn>

        <div v-if="authStore.loading" class="d-flex align-center mx-2">
          <v-progress-circular indeterminate size="20" width="2" color="white" />
        </div>

        <template v-else>
          <v-btn v-if="authStore.isLoggedIn" variant="flat" color="error" size="small" rounded="lg" @click="handleSignOut">
            <v-icon start>mdi-logout</v-icon>
            登出
          </v-btn>

          <v-btn v-else @click="authStore.login()" variant="flat" color="secondary" size="small" rounded="lg">
            <v-icon start>mdi-login</v-icon>
            登入
          </v-btn>
        </template>
      </div>
    </v-app-bar>

    <v-main>
      <RouterView />
      
      <footer class="py-6 text-center text-caption text-medium-emphasis">
        <p class="mb-1">© 2025 KaiGo Travel Planner</p>
        <p>簡單、高效、協作</p>
      </footer>
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter, RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from './stores/useAuthStore.js'
import { useTheme } from 'vuetify'

const authStore = useAuthStore()
const router = useRouter()
const theme = useTheme()

const isDark = computed(() => theme.global.name.value === 'dark')

const toggleTheme = () => {
  const newTheme = isDark.value ? 'light' : 'dark'
  theme.global.name.value = newTheme
  document.body.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
}

onMounted(async () => {
  const storedTheme = localStorage.getItem('theme') || 'dark'
  theme.global.name.value = storedTheme
  document.body.setAttribute('data-theme', storedTheme)

  // 先從 localStorage 恢復 session
  authStore.restoreSession()
})

const handleSignOut = async () => {
  try {
    await authStore.signOut()
    router.push('/')
  } catch (error) {
    console.error(error)
  }
}
</script>
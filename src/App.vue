<template>
  <v-app>
    <v-app-bar elevation="0" class="px-2">

      <v-app-bar-title>
        <RouterLink to="/" class="text-white text-decoration-none d-flex align-center gap-2">
          <img :src="logoUrl" alt="KaiBankVault Logo" class="logo-img mr-2" />
          <span class="text-h6 font-weight-bold">KaiBankVault</span>
        </RouterLink>
      </v-app-bar-title>

      <v-spacer />

      <div class="d-flex align-center gap-2">
        <v-tooltip text="切換主題">
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props" @click="toggleTheme" color="warning" variant="text" class="mx-2">
              <v-icon>{{ isDark ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <div v-if="authStore.loading" class="d-flex align-center mx-2">
          <v-progress-circular indeterminate size="20" width="2" color="white" />
        </div>

        <template v-else>
          <v-tooltip v-if="authStore.isLoggedIn" text="登出">
            <template v-slot:activator="{ props }">
              <v-btn icon v-bind="props" @click="handleSignOut" color="red" variant="text" class="mx-2">
                <v-icon>mdi-logout</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip v-else text="登入">
            <template v-slot:activator="{ props }">
              <v-btn icon v-bind="props" @click="authStore.login()" color="success" variant="text" class="mx-2">
                <v-icon>mdi-login</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </template>
      </div>
    </v-app-bar>

    <v-main>
      <RouterView />
      
      <footer class="py-6 text-center text-caption text-medium-emphasis">
        <p class="mb-1">© 2025 KaiBankVault Travel Planner</p>
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
import logoUrl from '../public/images/Logo.png?url'

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
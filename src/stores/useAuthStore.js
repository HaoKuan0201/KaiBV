import { defineStore } from 'pinia'
import router from '@/router'
import { supabase } from '../lib/supabaseClient.js'

const SESSION_STORAGE_KEY = 'kaigo_session'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        loading: true,
        session: null,
        userName: 'viewer',
        userRole: 'viewer',
    }),

    getters: {
        isLoggedIn: (state) => !!state.session && state.userName !== 'viewer',
        name: (state) => state.userName,
        role: (state) => state.userRole,
    },

    actions: {

        async signInDev() {
            this.loading = true
            this.userName = 'Kai'
            this.userRole = 'admin'
            this.session = {
                userName: 'Kai',
                userRole: 'admin',
                timestamp: new Date().toISOString()
            }
            // 保存到 localStorage
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.session))
            this.loading = false
        },

        async signOut() {
            this.loading = true
            this.userName = 'viewer'
            this.userRole = 'viewer'
            this.session = null
            localStorage.removeItem(SESSION_STORAGE_KEY)
            this.loading = false
        },

        // 恢復 localStorage 中的 session
        restoreSession() {
            this.loading = true
            const sessionData = localStorage.getItem(SESSION_STORAGE_KEY)

            if (sessionData) {
                try {
                    const session = JSON.parse(sessionData)
                    this.session = session
                    this.userName = session.userName || 'viewer'
                    this.userRole = session.userRole || 'viewer'
                    console.log('已從 localStorage 恢復 session:', { userName: this.userName, userRole: this.userRole })
                } catch (e) {
                    console.error('Failed to restore session from localStorage:', e)
                    this.session = null
                    this.userName = 'viewer'
                    this.userRole = 'viewer'
                    localStorage.removeItem(SESSION_STORAGE_KEY)
                }
            } else {
                this.session = null
                this.userName = 'viewer'
                this.userRole = 'viewer'
            }

            this.loading = false
        },

        async login(userName) {
            this.loading = true

            if (userName) {
                // 帳號密碼登入（來自 Login.vue）
                try {
                    this.userName = userName
                    this.userRole = 'editor'
                    this.session = {
                        userName: userName,
                        userRole: 'editor',
                        timestamp: new Date().toISOString()
                    }
                    // 保存到 localStorage
                    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.session))
                    console.log('帳號登入成功:', { userName: this.userName, userRole: this.userRole })
                    this.loading = false
                    return `帳號登入成功：${userName}`
                } catch (e) {
                    this.loading = false
                    console.error('Account login failed:', e)
                    throw new Error('帳號登入失敗')
                }
            } else {
                // 生產模式，跳轉到登入頁面
                this.loading = false
                await router.push({ name: 'Login' })
                return '生產模式：請前往登入頁面進行認證'
            }
        }
    },
})
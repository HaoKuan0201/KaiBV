import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient.js'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        session: null,
        loading: true,
        userRole: 'viewer',
    }),

    getters: {
        isLoggedIn: (state) => !!state.session,
        userEmail: (state) => state.user?.email || null,
        userUuid: (state) => state.user?.id || null,
        role: (state) => state.userRole,
    },

    actions: {
        async fetchUserRole(userId) {
            if (!userId) {
                this.userRole = 'viewer'
                return
            }

            const { data, error } = await supabase
                .from('T_KaiGO_Users')
                .select('role')
                .eq('user_uuid', userId)
                .limit(1)

            if (error) {
                this.userRole = 'viewer'
                return
            }

            if (data && data.length > 0) {
                this.userRole = data[0].role
            } else {
                this.userRole = 'viewer'
            }
        },

        async fetchSession() {
            this.loading = true

            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                console.error('Error fetching session:', error.message)
            } else {
                this.session = session
                this.user = session?.user || null
                if (this.user) {
                    await this.fetchUserRole(this.user.id)
                }
            }

            this.loading = false
        },

        async signInWithOtp(email) {
            const runtimeConfig = import.meta.env;

            const baseURL = runtimeConfig.BASE_URL.endsWith('/') ? runtimeConfig.BASE_URL : runtimeConfig.BASE_URL + '/';

            const redirectUrl = window.location.origin + baseURL;

            const { error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: redirectUrl
                }
            });

            if (error) {
                throw new Error(error.message);
            }

            return "登入連結已發送！請檢查您的信箱，點擊連結完成認證。";
        },

        async signOut() {
            this.loading = true

            const { error } = await supabase.auth.signOut()

            this.loading = false

            if (error) {
                throw new Error(`登出失敗: ${error.message}`)
            }

            this.session = null
            this.user = null
            this.userRole = 'viewer'
        },

        setupAuthListener() {
            supabase.auth.onAuthStateChange(async (_event, session) => {
                this.session = session
                this.user = session?.user || null
                if (this.user) {
                    await this.fetchUserRole(this.user.id)
                } else {
                    this.userRole = 'viewer'
                }
            })
        }
    },
})
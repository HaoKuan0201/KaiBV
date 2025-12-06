import { defineStore } from 'pinia'
import router from '@/router' // ⬅️ 導入導出的 router 實例
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
            console.log(`User Id fetched: ${this.userId}`)
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

            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                console.error('Error fetching session:', error.message)
            } else {
                debugger
                console.log('fetchSession session:' + session)
                this.session = session
                this.user = session?.user || null
                if (this.user) {
                    await this.fetchUserRole(this.user.id)
                }
            }
        },

        async signInDev(devUser) {
            this.loading = true

            const mockSession = {
                access_token: 'MOCK_DEV_TOKEN',
                user: {
                    id: devUser.id,
                    email: devUser.email,
                    raw_user_meta_data: {
                        name: devUser.name,
                    },
                },
            }
            this.session = mockSession
            this.user = mockSession.user
            this.userRole = devUser.role

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
                console.log('setupAuthListener session:' + session)
                this.session = session
                this.user = session?.user || null
                if (this.user) {
                    await this.fetchUserRole(this.user.id)
                } else {
                    this.userRole = 'viewer'
                }
                this.loading = false
            })
        },

        async login() {
            if(this.isLoggedIn){
                if (import.meta.env.DEV) {
                    try {
                        const devUser = {
                            id: '4c04c86f-eb98-41fc-a686-dc44a2c91de0',
                            name: 'Kai',
                            email: 'kai@dev.test',
                            role: 'admin'
                        }
                        await this.signInDev(devUser)
                        return '開發模式：已自動登入 (admin)'
                    } catch (e) {
                        console.error('Dev auto-login failed:', e)
                        throw new Error('Dev auto-login failed')
                    }
                } else {
                    await this.fetchSession()
                    this.setupAuthListener()
                    return '生產模式：已初始化認證'
                }
            }
            else{
                if (import.meta.env.DEV) {
                    try {
                        const devUser = {
                            id: '4c04c86f-eb98-41fc-a686-dc44a2c91de0',
                            name: 'Kai',
                            email: 'z7032541@gmail.com',
                            role: 'admin'
                        }
                        await this.signInDev(devUser)
                        return '開發模式：已自動登入 (admin)'
                    } catch (e) {
                        console.error('Dev auto-login failed:', e)
                        throw new Error('Dev auto-login failed')
                    }
                } else {
                    await router.push({ name: 'Login' })
                    return '生產模式：請前往登入頁面進行認證'
                }
            }
        }
    },
})
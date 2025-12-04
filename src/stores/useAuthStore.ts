// ./src/stores/useAuthStore.ts

import { defineStore } from 'pinia'
// 引入 Supabase 相關的型別
import type { User, Session } from '@supabase/supabase-js'
// 引入我們之前建立的 supabase client 實例
import { supabase } from '../lib/supabaseClient' 

// 1. 定義狀態的介面 (State Interface)
interface AuthState {
  // 使用 Supabase 提供的 User 和 Session 型別
  user: User | null
  session: Session | null
  loading: boolean
}

// 2. 定義 Store
export const useAuthStore = defineStore('auth', {
  // 狀態
  state: (): AuthState => ({
    user: null,
    session: null,
    loading: true, // 初始化時設為 true，表示正在檢查會話
  }),

  // Getter
  getters: {
    // 判斷使用者是否登入，回傳 boolean 型別
    isLoggedIn: (state) => !!state.session,
    
    // 取得使用者電子郵件，回傳 string 或 null 型別
    userEmail: (state): string | null => state.user?.email || null,
  },

  // Action
  actions: {
    /**
     * 檢查 Supabase 的初始會話，確保應用程式啟動時狀態正確
     */
    async fetchSession() {
      this.loading = true
      
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error fetching session:', error.message)
      } else {
        // 更新 Pinia 狀態
        this.session = session
        this.user = session?.user || null
      }
      
      this.loading = false
    },
    
    /**
     * 透過電子郵件和 OTP/Magic Link 登入
     * @param email - 使用者的電子郵件
     */
    async signInWithOtp(email: string) {
      this.loading = true
      
      // 使用 Supabase 的 signInWithOtp 函式
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          // 這是 Supabase Magic Link 郵件中會帶使用者導向的 URL
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      })
      
      this.loading = false

      if (error) {
        throw new Error(`登入失敗: ${error.message}`)
      }
      
      // 成功發送 Magic Link 後，回傳一個訊息
      return "登入連結已發送到您的電子郵件！"
    },

    /**
     * 登出使用者
     */
    async signOut() {
      this.loading = true
      
      const { error } = await supabase.auth.signOut()
      
      this.loading = false

      if (error) {
        throw new Error(`登出失敗: ${error.message}`)
      }
      
      // 登出成功後，清除 Pinia 狀態
      this.session = null
      this.user = null
    },

    /**
     * 設定 Supabase 監聽器，即時更新 Pinia 狀態
     */
    setupAuthListener() {
      // Supabase 內建的事件監聽器，用於監聽登入/登出/Token 過期等事件
      supabase.auth.onAuthStateChange((_event, session) => {
        // console.log(`Supabase Auth Event: ${event}`)
        this.session = session
        this.user = session?.user || null
        // 如果是登出事件，可以導向首頁
        // if (event === 'SIGNED_OUT') { router.push('/') }
      })
    }
  },
})

// 3. (可選) 在 App.vue 或主要入口檔案中調用 fetchSession 和 setupAuthListener
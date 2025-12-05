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
    // 在 useAuthStore 的 return object 內部找到 signInWithOtp
    async signInWithOtp(email: string): Promise<string> {
      const runtimeConfig = import.meta.env;

      // 獲取應用程式的 Base URL，確保它是完整的 http://localhost:5173/KaiGO/
      // 這裡我們需要動態構造完整的重定向 URL
      // 假設 Base URL 是 /KaiGO/
      const baseURL = runtimeConfig.BASE_URL.endsWith('/') ? runtimeConfig.BASE_URL : runtimeConfig.BASE_URL + '/';

      // 構造完整的重定向路徑：http://localhost:5173/KaiGO/
      const redirectUrl = window.location.origin + baseURL;

      // console.log("OTP Redirecting to:", redirectUrl); // 檢查輸出的路徑

      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          // *** 關鍵修正：明確指定登入完成後的回調 URL ***
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return "登入連結已發送！請檢查您的信箱，點擊連結完成認證。";
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
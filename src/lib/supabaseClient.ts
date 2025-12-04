// ./src/lib/supabaseClient.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// 1. 從環境變數中取得 URL 和 Key (Vite 預設將 env 視為字串)
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY

// 2. 檢查環境變數是否設定 (可選但推薦)
if (!supabaseUrl || !supabaseAnonKey) {
  // 使用 console.error 並拋出錯誤，確保在開發環境中能發現配置錯誤
  console.error("Supabase URL or Anon Key is missing. Check your .env.local file.")
}

// 3. 創建並匯出 Supabase Client 實例，明確指定其型別
// 這裡我們明確指定匯出的變數是 SupabaseClient 型別
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// 提示: 如果您已經開始使用 Supabase Functions，您可能需要定義資料庫結構的泛型，
// 範例： export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
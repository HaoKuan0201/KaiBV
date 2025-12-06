# KaiGO Supabase 集成指南

## 概述

KaiGO 現已完全集成 Supabase，支持：
- ✅ 安全的用戶認證（基於 OTP/Magic Link）
- ✅ 行程數據的雲端存儲
- ✅ 自動同步（本地 ↔ Supabase）
- ✅ 行級安全 (RLS) 保護用戶隱私
- ✅ 離線優先設計（優先使用本地數據）

---

## 1. 設置 Supabase 數據庫

### 步驟 1：進入 Supabase 控制台
1. 訪問 https://supabase.com/
2. 使用 Supabase 帳戶登入
3. 進入您的專案 (KaiGO)

### 步驟 2：執行 SQL 命令
1. 進入 **SQL Editor**
2. 複製並執行 `supabase_setup.sql` 中的所有 SQL 命令
3. 確認表格已成功創建

### 步驟 3：驗證表格結構
執行以下查詢來驗證表格：
```sql
SELECT * FROM public.trips;
```

應該會看到空表（如果是新設置）或現有的行程數據。

---

## 2. 環境變數配置

確認 `.env.local` 文件包含以下內容：
```env
VITE_SUPABASE_URL="https://edohxizikngetrlkrqha.supabase.co"
VITE_SUPABASE_ANON_KEY="sb_publishable_L6nx8Xu9xiRhVMi8bKyqZA_9u9iKYhi"
```

---

## 3. 核心功能說明

### 3.1 自動數據同步流程

#### 首次進入應用
1. 用戶未登入 → 從本地 Storage 加載數據
2. 用戶已登入 → 從本地 Storage 加載，然後檢查 Supabase 是否有更新

#### 編輯行程時
1. 點擊「編輯」按鈕進入編輯模式
2. 修改行程信息後點擊「儲存」
3. **自動流程**：
   - 保存到本地 Storage ✓
   - 如果用戶已登入，同步到 Supabase ✓
   - 顯示成功提示

#### 主動同步
1. 點擊菜單（三點）→ **Reload from Server**
2. 確認覆蓋本地數據
3. 從 Supabase 拉取最新數據

### 3.2 API 函數

所有 Supabase 操作都在 `src/lib/supabaseTrips.js` 中定義：

```javascript
// 獲取用戶的行程數據
fetchTripDataFromSupabase(userId)

// 保存或更新行程數據
saveTripDataToSupabase(userId, appData, tripName)

// 同步本地和遠端數據
syncTripData(userId, localAppData)

// 刪除用戶數據
deleteTripData(userId)

// 獲取用戶的所有行程列表
fetchAllTrips(userId)
```

---

## 4. TripPlan.vue 集成

### 編輯行程後的自動同步
```javascript
async function handleSaveEvent() {
  // 保存到本地
  tripStore.saveEvent(dayIndex, eventIndex, newEvent);
  
  // 如果已登入，自動同步到 Supabase
  if (authStore.isLoggedIn && authStore.user?.id) {
    await tripStore.saveLocalAndRemoteData(authStore.user.id);
    showSnackbar('已儲存至 Supabase');
  }
}
```

### 主動重新加載服務器數據
```javascript
async function handleReloadServerData() {
  // 需要登入
  if (!authStore.isLoggedIn) return;
  
  // 從 Supabase 獲取最新數據
  const remoteData = await fetchTripDataFromSupabase(userId);
}
```

---

## 5. tripStore.js 集成

### 初始化時自動加載數據
```javascript
async function initializeData(userId) {
  // 1. 先從本地加載
  loadLocalData();
  
  // 2. 如果無本地數據且提供了 userId，從 Supabase 加載
  // 3. 如果有本地數據，執行後台同步
}
```

### 保存數據時自動同步
```javascript
async function saveLocalAndRemoteData(userId) {
  // 1. 保存到本地 Storage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  
  // 2. 如果有 userId，同步到 Supabase
  if (userId) {
    await saveTripDataToSupabase(userId, appData);
  }
}
```

---

## 6. 用戶認證流程

### 登入時自動設置用戶 ID
1. 用戶訪問登入頁面
2. 輸入郵箱並點擊「發送登入連結」
3. 點擊郵件中的連結
4. 認證成功，`authStore.user.id` 被設置
5. TripPlan.vue 自動同步數據

### 登出時清理數據
```javascript
async function handleSignOut() {
  await authStore.signOut();
  // 本地數據保留用於離線訪問
  router.push('/');
}
```

---

## 7. 數據衝突解決

### 策略
- **優先本地**：首次進入應用優先使用本地 Storage
- **自動更新**：檢測到 Supabase 有更新時自動拉取
- **用戶控制**：提供手動同步按鈕讓用戶選擇何時拉取遠端數據

### 時間戳比較
```javascript
// syncTripData() 中
const remoteUpdatedAt = new Date(remoteRecord.updated_at).getTime();
if (localData !== remoteData) {
  // 保存本地版本到 Supabase
  await saveTripDataToSupabase(userId, localAppData);
}
```

---

## 8. 安全性

### RLS (Row Level Security)
- 所有用戶只能查看和修改自己的行程數據
- SQL 層面的保護，無法繞過

### 認證
- 使用 Supabase Auth 進行安全認證
- 每次請求都會驗證 `auth.uid()` 與 `user_id`

### 環境變數
- 敏感信息存儲在 `.env.local`（已添加到 `.gitignore`）
- 公開密鑰 (Anon Key) 只用於前端認證

---

## 9. 故障排除

### 問題：「無法連接到 Supabase」
```javascript
// 檢查 .env.local 是否包含正確的 URL 和密鑰
// 檢查瀏覽器控制台錯誤信息
// 確認 Supabase 服務狀態
```

### 問題：「同步失敗」
```javascript
// 檢查用戶是否已登入 (authStore.isLoggedIn)
// 檢查 trips 表是否存在
// 查看 Supabase 的日誌和錯誤信息
```

### 問題：「無法獲取用戶 ID」
```javascript
// 確保已完成登入流程
// 檢查 authStore.user 是否正確設置
// 查看認證日誌
```

---

## 10. 開發指南

### 添加新的 Supabase 操作
1. 在 `src/lib/supabaseTrips.js` 中創建新函數
2. 匯出函數
3. 在需要的組件中導入並使用

### 測試 Supabase 集成
```javascript
// 在瀏覽器控制台中測試
import { saveTripDataToSupabase } from './src/lib/supabaseTrips.js';

const result = await saveTripDataToSupabase(
  'your-user-id',
  { title: 'Test Trip', days: [] }
);
```

---

## 11. 下一步

### 功能擴展建議
- [ ] 支持多個行程（當前為單個行程模式）
- [ ] 實時協作編輯（多用戶同時編輯）
- [ ] 行程分享和邀請
- [ ] 詳細的變更歷史
- [ ] 離線同步隊列（改進的衝突解決）

### 性能優化
- [ ] 實現增量同步（只同步變更）
- [ ] 添加快取層
- [ ] 批量操作優化

---

## 12. 支持和反饋

如有任何問題或建議，請：
1. 檢查瀏覽器控制台的錯誤信息
2. 查看 Supabase 的日誌
3. 參考本文檔的故障排除部分

---

最後更新：2025 年 12 月 6 日

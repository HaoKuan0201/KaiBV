# 🚀 Supabase 集成 - 快速開始指南

## 需要做的 3 件事

### ✅ 第 1 步：執行 SQL 初始化 (2 分鐘)

1. 登入 https://app.supabase.com/
2. 進入您的 KaiGO 專案
3. 打開 **SQL Editor**
4. 複製以下文件的全部內容：`supabase_setup.sql`
5. 粘貼到 SQL Editor 並執行
6. 等待完成（應該沒有錯誤）

✨ **完成後您將擁有：**
- ✓ `trips` 表（存儲用戶行程數據）
- ✓ RLS 安全策略（保護用戶隱私）
- ✓ 自動時間戳管理
- ✓ 性能索引

---

### ✅ 第 2 步：驗證環境變數 (1 分鐘)

確認 `.env.local` 文件包含這兩行：
```env
VITE_SUPABASE_URL="https://edohxizikngetrlkrqha.supabase.co"
VITE_SUPABASE_ANON_KEY="sb_publishable_L6nx8Xu9xiRhVMi8bKyqZA_9u9iKYhi"
```

✨ **為什麼需要這些：**
- `VITE_SUPABASE_URL` - Supabase 伺服器地址
- `VITE_SUPABASE_ANON_KEY` - 前端認證密鑰

---

### ✅ 第 3 步：啟動應用並測試 (5 分鐘)

```bash
npm run dev
```

然後按以下步驟測試：

#### 測試場景 1：未登入用戶
1. 打開 http://localhost:5177/KaiGO/
2. 點擊「查看旅遊行程」進入 TripPlan
3. 編輯一個事件（例如改變時間或位置）
4. 點擊「儲存」
5. 看到提示「儲存成功 (本地)」✓

#### 測試場景 2：已登入用戶
1. 點擊首頁的「登入」按鈕
2. 輸入您的郵箱地址
3. 檢查郵件，點擊登入連結
4. 回到應用，進入 TripPlan
5. 編輯一個事件
6. 點擊「儲存」
7. 看到提示「已儲存至 Supabase」✓
8. 打開開發工具（F12）→ 控制台，確認沒有紅色錯誤

#### 測試場景 3：同步數據
1. 已登入狀態下，點擊菜單（三點）
2. 點擊「Reload from Server」
3. 確認覆蓋本地數據
4. 看到提示「已從 Supabase 同步資料」✓

---

## 🎯 核心功能已實現

### 📝 編輯時自動保存
```
編輯事件 → 點擊儲存 → 自動保存到本地 + Supabase
```

### 🔄 同步機制
```
首次進入    → 從本地加載 + 後台檢查 Supabase
編輯時      → 本地保存 + 如果已登入就同步到 Supabase
手動同步    → 點擊「Reload from Server」拉取遠端最新數據
```

### 🔐 安全性
```
✓ 每個用戶只能訪問自己的數據
✓ 使用 Supabase RLS 在數據庫層面保護
✓ 認證失敗時優雅降級到本地使用
```

---

## 📊 技術架構

```
TripPlan.vue
    ↓
handleSaveEvent() → 保存到本地 + Supabase
    ↓
tripStore.js
    ├── saveLocalAndRemoteData(userId)
    │   ├── 本地: localStorage
    │   └── 遠端: supabaseTrips.js
    └── initializeData(userId)
        ├── 本地: loadLocalData()
        └── 遠端: fetchTripDataFromSupabase()

supabaseTrips.js
    ├── saveTripDataToSupabase()
    ├── fetchTripDataFromSupabase()
    ├── syncTripData()
    ├── deleteTripData()
    └── fetchAllTrips()
```

---

## 🐛 常見問題

### Q: 我沒看到「已儲存至 Supabase」的提示
A: 檢查以下項目：
- [ ] 您是否已登入？（未登入會顯示「儲存成功 (本地)」）
- [ ] Supabase 表是否已創建？
- [ ] 環境變數是否正確？
- [ ] 瀏覽器控制台是否有紅色錯誤？

### Q: 手動同步後看不到數據
A: 可能原因：
- [ ] 未登入（需要登入才能訪問 Supabase）
- [ ] Supabase 中沒有該用戶的數據
- [ ] 檢查用戶 ID 是否正確

### Q: 編輯後數據沒有保存
A: 這是離線模式：
- [ ] 檢查本地是否保存（F12 → Application → Local Storage）
- [ ] 如果已登入，應該自動同步到 Supabase
- [ ] 如果未登入，數據只在本地保存

---

## 📚 更詳細的文檔

### 完整實現細節
查看：`SUPABASE_IMPLEMENTATION.md`

### 集成指南和故障排除
查看：`SUPABASE_INTEGRATION.md`

### SQL 表結構定義
查看：`supabase_setup.sql`

---

## 🎉 就這樣！

您的 KaiGO 應用現在完全支持 Supabase 雲端存儲了！

### 功能總結
- ✅ 用戶認證
- ✅ 數據持久化
- ✅ 自動同步
- ✅ 離線支持
- ✅ 安全隔離

### 下一步？
- 邀請朋友測試
- 在生產環境部署
- 請求新功能或報告 bug

---

有任何問題？參考上面的「常見問題」部分或查看詳細文檔。

**祝您使用愉快！** 🚀✨

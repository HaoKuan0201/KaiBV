-- Supabase SQL: Create Trips Table for KaiBankVault
-- 執行此 SQL 命令在 Supabase 的 SQL Editor 中創建所需的表

-- 1. 創建 trips table
CREATE TABLE public.T_KaiBankVault_Trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_name TEXT NOT NULL DEFAULT 'My Trip',
  trip_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id) -- 每個用戶只能有一個行程（可根據需要修改為多行程模式）
);

-- 2. 創建 RLS (Row Level Security) 政策
-- 啟用 RLS
ALTER TABLE public.T_KaiBankVault_Trips ENABLE ROW LEVEL SECURITY;

-- 3. 創建政策：用戶只能查看自己的行程數據
CREATE POLICY "Users can view their own trips"
  ON public.T_KaiBankVault_Trips
  FOR SELECT
  USING (auth.uid() = user_id);

-- 4. 創建政策：用戶只能插入自己的行程數據
CREATE POLICY "Users can insert their own trips"
  ON public.T_KaiBankVault_Trips
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. 創建政策：用戶只能更新自己的行程數據
CREATE POLICY "Users can update their own trips"
  ON public.T_KaiBankVault_Trips
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. 創建政策：用戶只能刪除自己的行程數據
CREATE POLICY "Users can delete their own trips"
  ON public.T_KaiBankVault_Trips
  FOR DELETE
  USING (auth.uid() = user_id);

-- 7. 創建索引以改進查詢效能
CREATE INDEX idx_trips_user_id ON public.T_KaiBankVault_Trips(user_id);
CREATE INDEX idx_trips_updated_at ON public.T_KaiBankVault_Trips(updated_at DESC);

-- 8. 創建自動更新 updated_at 的觸發器
CREATE OR REPLACE FUNCTION update_trips_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trips_update_timestamp
BEFORE UPDATE ON public.T_KaiBankVault_Trips
FOR EACH ROW
EXECUTE FUNCTION update_trips_timestamp();

-- 完成！現在您的應用程序可以使用這個表格來存儲和管理用戶的行程數據。

import { supabase } from './supabaseClient'
import { useAuthStore } from '../stores/useAuthStore';

const TARGET_TABLE = 'T_KaiGO_Trips'

export async function fetchAllTripTitle() {
  console.log('嘗試從 Supabase 讀取所有行程標題...');

  const { data, error } = await supabase
    .from(TARGET_TABLE)
    .select('title')
    .order('title', { ascending: true });

  if (error) {
    console.error('從 Supabase 讀取行程標題失敗:', error.message);
    return [];
  }

  if (data && data.length > 0) {
    const titles = data.map(item => item.title);
    const uniqueTitles = [...new Set(titles)];
    console.log('行程標題讀取成功！', uniqueTitles);
    return uniqueTitles;
  } else {
    console.log('未找到任何行程資料。');
    return [];
  }
}

export async function fetchTripData(targetTitle, storageKey, checkSuffix, costSuffix) {
  console.log('嘗試從 Supabase 讀取資料...');

  const { data, error } = await supabase
    .from(TARGET_TABLE)
    .select('json_data')
    .eq('title', targetTitle)
    .limit(1);

  if (error) {
    console.error('從 Supabase 讀取資料失敗:', error.message);
    return { success: false, message: `雲端資料讀取失敗: ${error.message}`, data: null };
  }

  if (data && data.length > 0) {
    console.log('資料讀取成功！');
    const tripDataFromDB = data[0].json_data;
    return { success: true, message: '已從雲端更新並載入最新行程！', data: tripDataFromDB };
    
  } else {
    console.log(`未找到標題為 "${targetTitle}" 的行程資料。`);
    return { success: false, message: '未找到最新雲端行程資料，使用本地數據。', data: null };
  }
}

export async function saveTripData(newTripJson) {
  if (!newTripJson || !newTripJson.title) {
    return { success: false, message: '儲存失敗：資料格式錯誤。' };
  }

  const authStore = useAuthStore();
  const currentTitle = newTripJson.title;
  const days = newTripJson.days || [];

  const user = authStore.user;
  const userName = authStore.name
    ? authStore.userName
    : 'anonymous';

  const dataToUpdate = {
    start_date: days.length > 0 ? days[0].fullDate : null,
    end_date: days.length > 0 ? days[days.length - 1].fullDate : null,
    json_data: newTripJson,
    insert_id: userName,
    insert_dt: new Date().toISOString(),
  };

  console.log(`嘗試將資料更新到 Supabase (Title: ${currentTitle}, User Name: ${userName})...`);

  const { data, error } = await supabase
    .from(TARGET_TABLE)
    .update(dataToUpdate)
    .eq('title', currentTitle)
    .select('insert_dt');

  if (error) {
    console.error('❌ Supabase 明確錯誤 (可能因權限不足):', error.message, error);
    return { success: false, message: `雲端更新失敗: ${error.message}` };
  }

  if (data && data.length > 0) {
    const updatedTime = data[0].insert_dt
      ? new Date(data[0].insert_dt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : '成功';
      
    const displayUserName = userName.length > 20 ? `${userName.substring(0, 8)}...` : userName;

    console.log(`✅ 資料已成功更新至 Supabase。`);
    return { success: true, message: `雲端儲存成功！最後更新時間：${updatedTime} (操作者: ${displayUserName})` };
  } else {
    console.warn(`⚠️ 儲存失敗：Supabase 回報更新了 0 行。請確認行程標題和用戶權限是否正確。`);
    return { success: false, message: '雲端更新未變動或權限不足：請檢查行程標題是否正確。' };
  }
}
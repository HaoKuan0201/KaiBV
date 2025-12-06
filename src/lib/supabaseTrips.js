// src/lib/supabaseTrip.js - 最終修正版本
import { supabase } from './supabaseClient'

const TARGET_TABLE = 'T_KaiGO_Trips'

/**
 * 從 Supabase 讀取行程資料。
 * (此函式邏輯不變)
 * @param {string} targetTitle - 行程的標題
 * @param {string} storageKey - Local Storage 儲存鍵
 * @param {string} checkSuffix - 完成狀態的後綴
 * @param {string} costSuffix - 實際花費的後綴
 * @returns {Promise<{success: boolean, message: string, data: object|null}>}
 */
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

    // 清除 Local Storage 中的狀態數據
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.endsWith(checkSuffix) || key.endsWith(costSuffix))) {
        localStorage.removeItem(key);
      }
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(tripDataFromDB));
      console.log('Local Storage 已更新，準備返回數據...');

      return { success: true, message: '已從雲端更新並載入最新行程！', data: tripDataFromDB };
    } catch (e) {
      console.error('儲存本地數據失敗:', e);
      return { success: false, message: '雲端資料獲取成功，但儲存本地數據失敗。', data: null };
    }
  } else {
    console.log(`未找到標題為 "${targetTitle}" 的行程資料。`);
    return { success: false, message: '未找到最新雲端行程資料，使用本地數據。', data: null };
  }
}

/**
 * 將行程資料儲存到 Supabase，並記錄操作者名稱和時間。
 * @param {object} newTripJson - 完整的行程數據物件
 * @returns {Promise<{success: boolean, message: string}>} 儲存結果
 */
export async function saveTripData(newTripJson) {
  if (!newTripJson || !newTripJson.title) {
    return { success: false, message: '儲存失敗：資料格式錯誤。' };
  }

  const currentTitle = newTripJson.title;
  const days = newTripJson.days || [];

  // 1. 🎯 取得當前認證使用者資訊
  const { data: { user } } = await supabase.auth.getUser();
  
  // 2. 🎯 從 raw_user_meta_data 中提取 'name' 作為 insert_id
  const userName = user 
    ? (user.raw_user_meta_data?.name || user.email || user.id) // 嘗試使用 name，其次是 email，最後是 id
    : 'anonymous';

  // 3. 準備更新數據
  const dataToUpdate = {
    start_date: days.length > 0 ? days[0].fullDate : null,
    end_date: days.length > 0 ? days[days.length - 1].fullDate : null,
    json_data: newTripJson,
    // 紀錄操作者名稱
    insert_id: userName,
    // 紀錄更新時間 (使用當前時間)
    insert_dt: new Date().toISOString(),
  };

  console.log(`嘗試將資料更新到 Supabase (Title: ${currentTitle}, User Name: ${userName})...`);

  // 4. 執行更新操作
  const { data, error } = await supabase
    .from(TARGET_TABLE)
    .update(dataToUpdate)
    .eq('title', currentTitle)
    .select('insert_dt');

  if (error) {
    console.error('❌ Supabase 明確錯誤:', error.message, error);
    return { success: false, message: `雲端更新失敗: ${error.message}` };
  }

  if (data && data.length > 0) {
    const updatedTime = data[0].insert_dt
      ? new Date(data[0].insert_dt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : '成功';
      
    // 為了美觀，如果 name 很長（如 email 或 id），只顯示開頭部分
    const displayUserName = userName.length > 20 ? `${userName.substring(0, 8)}...` : userName;

    console.log(`✅ 資料已成功更新至 Supabase。`);
    return { success: true, message: `雲端儲存成功！最後更新時間：${updatedTime} (操作者: ${displayUserName})` };
  } else {
    console.warn(`⚠️ 儲存失敗：Supabase 回報更新了 0 行。`);
    return { success: false, message: '雲端更新未變動：請檢查行程標題是否正確。' };
  }
}
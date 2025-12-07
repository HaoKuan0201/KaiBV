import { supabase } from './supabaseClient'
import { useAuthStore } from '../stores/useAuthStore';

const TARGET_TABLE = 'T_KaiGO_Trips'

export async function fetchAllTripTitle() {
  const { data, error } = await supabase
    .from(TARGET_TABLE)
    .select('id, city, title, start_date, end_date')
    .order('start_date', { ascending: false });

  if (error) {
    console.error(error.message);
    return [];
  }
  return data || [];
}

export async function fetchTripData(id) {
  if (!id) return { success: false, message: '無效的 ID', data: null };

  const { data, error } = await supabase
    .from(TARGET_TABLE)
    .select('json_data, city, title')
    .eq('id', id)
    .single();

  if (error) {
    return { success: false, message: error.message, data: null };
  }

  return { 
    success: true, 
    message: '載入成功', 
    data: {
      ...data.json_data,
      city: data.city,
      title: data.title
    }
  };
}

export async function saveTripData(tripData, city, title) {
  const authStore = useAuthStore();
  const userName = authStore.name ? authStore.userName : 'anonymous';
  const days = tripData.days || [];
  
  const startDate = days.length > 0 ? days[0].fullDate : null;
  const endDate = days.length > 0 ? days[days.length - 1].fullDate : null;

  const payload = {
    title: title,
    city: city,
    start_date: startDate,
    end_date: endDate,
    json_data: tripData,
    insert_id: userName,
    insert_dt: new Date().toISOString(),
  };

  let query = supabase.from(TARGET_TABLE);
  let result;

  if (tripData.id) {
    result = await query.update(payload).eq('id', tripData.id).select();
  } else {
    result = await query.insert(payload).select();
  }

  const { data, error } = result;

  if (error) {
    return { success: false, message: error.message };
  }

  if (data && data.length > 0) {
    return { success: true, message: '儲存成功', newId: data[0].id };
  }

  return { success: false, message: '儲存未變動' };
}

export async function deleteTrip(tripId) {
    if (!tripId) {
        return { success: false, message: '行程 ID 遺失。' };
    }

    try {
        const { error } = await supabase
            .from(TARGET_TABLE)
            .delete()
            .eq('id', tripId);

        if (error) {
            console.error('Error deleting trip:', error);
            return { success: false, message: `刪除失敗: ${error.message}` };
        }
        return { success: true, message: '行程已成功刪除' };

    } catch (e) {
        console.error('Exception during trip deletion:', e);
        return { success: false, message: `發生例外錯誤: ${e.message}` };
    }
}
<script setup lang="ts">
import { useAuthStore } from '../stores/useAuthStore'
import { ref } from 'vue';

const authStore = useAuthStore()
const tripCount = ref(0); // 假設未來會從 Supabase 取得行程數量

// 圖示 SVG (Lucide: Plane)
const PlaneIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="M17.8 19.2 20 22l-1.2-2.2C17.2 18.2 15 17 13 17H5c-.5 0-1-.5-1-1v-2c0-.5.5-1 1-1h8c2 0 4.2 1.2 5.8 2.8L20 18l-2.2-2.2C14.8 12.8 11.6 11 8 11H5c-.5 0-1-.5-1-1V8c0-.5.5-1 1-1h3.6c3.6 0 6.8-1.8 8.8-4.2L20 1 17.8 3.2C15.8 5.4 13.6 6 11.4 6H5c-.5 0-1-.5-1-1v-2c0-.5.5-1 1-1h6.4C17.6 2 21.2 5.6 22 10z"/></svg>
`;
// 圖示 SVG (Lucide: PlusCircle)
const PlusIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
`;

</script>

<template>
  <div class="space-y-10">
    
    <!-- 歡迎區塊 -->
    <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border-t-4 border-indigo-500">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 flex items-center">
            <span class="text-indigo-600 mr-3" v-html="PlaneIcon"></span>
            歡迎回來，{{ authStore.userEmail || '規劃師' }}！
        </h1>
        <p class="text-gray-500 text-lg">這裡是您所有旅程的中心，隨時準備出發。</p>
    </div>

    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 行程總覽卡片 (左側統計) -->
        <div class="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg border-l-4 border-sky-500">
            <p class="text-sm font-medium text-gray-500 mb-2">我的行程總數</p>
            <p class="text-4xl font-bold text-sky-600 mt-1">{{ tripCount }} 個</p>
            
            <p class="text-sm text-gray-400 mt-4 truncate">
                已登入 ID: {{ authStore.userEmail || 'N/A' }}
            </p>
        </div>

        <!-- 快速新增行程 (右側 CTA) -->
        <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
             <h2 class="text-xl font-semibold text-gray-700 mb-4">開始規劃您的下一段旅程</h2>
             <button class="w-full flex items-center justify-center py-3 px-6 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition duration-200 shadow-md transform hover:scale-[1.01]">
                <span v-html="PlusIcon" class="mr-2"></span>
                啟動新旅程規劃
             </button>
        </div>
    </div>
    
    <!-- 我的行程列表區塊 -->
    <section>
        <h2 class="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">所有旅程列表</h2>
        <div class="bg-gray-50 p-10 rounded-xl border-2 border-dashed border-gray-300 text-center text-gray-500 shadow-inner">
            <div class="text-4xl mb-3">🗄️</div>
            <p class="text-lg">目前還沒有任何規劃中的行程。</p>
            <p class="text-sm mt-1">點擊上方的綠色按鈕開始新增第一個行程！</p>
        </div>
    </section>

  </div>
</template>
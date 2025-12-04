<script setup lang="ts">
import { useAuthStore } from '../stores/useAuthStore'
import { ref } from 'vue';

const authStore = useAuthStore()
const tripCount = ref(0); // 假設未來會從 Supabase 取得行程數量

</script>

<template>
<div class="space-y-8">
<h1 class="text-4xl font-bold text-gray-800">
歡迎，{{ authStore.userEmail || '使用者' }}！
</h1>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- 行程總覽卡片 -->
    <div class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500">
        <p class="text-sm font-medium text-gray-500">我的行程總數</p>
        <p class="text-3xl font-bold text-indigo-600 mt-1">{{ tripCount }} 個</p>
    </div>

    <!-- 快速新增行程 -->
    <div class="bg-white p-6 rounded-xl shadow-lg col-span-1 md:col-span-2">
         <h2 class="text-xl font-semibold text-gray-700 mb-4">快速建立新行程</h2>
         <button class="w-full px-6 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition duration-150">
            + 開始規劃新旅程
         </button>
    </div>
</div>

<section>
    <h2 class="text-2xl font-semibold text-gray-700 mb-4">我的所有行程</h2>
    <div class="bg-white p-8 rounded-xl shadow-lg text-center text-gray-500">
        目前還沒有行程，快點擊 "開始規劃新旅程" 吧！
    </div>
</section>


</div>
</template>
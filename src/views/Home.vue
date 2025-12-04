<template>
    <div class="text-center py-16 bg-white shadow-lg rounded-xl">
        <h1 class="text-5xl font-extrabold text-gray-900 mb-4">KaiGo 旅遊規劃啟動！</h1>
        <p class="text-xl text-gray-600 mb-8">輕鬆規劃、管理和分享您的夢想旅程。</p>

        <div class="space-y-4">
            <router-link to="/dashboard"
                class="inline-block px-8 py-3 text-lg font-semibold rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition duration-300 shadow-xl">
                開始規劃行程
            </router-link>
            <p class="text-sm text-gray-400">點擊上方按鈕進入儀表板 (如果未登入將導向登入頁)</p>
        </div>


    </div>
</template>

<script setup lang="ts">
// 首頁無需特殊邏輯
</script>
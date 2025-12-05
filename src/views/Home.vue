<template>
  <div class="bg-gradient-to-br from-indigo-500 to-sky-600 p-16 rounded-3xl shadow-2xl text-white transform hover:shadow-indigo-500/50 transition duration-500">
    
    <!-- Hero Header -->
    <div class="text-center">
        <h1 class="text-6xl font-black mb-3 leading-tight">
            讓您的旅程<br>
            從這裡開始
        </h1>
        <p class="text-2xl font-light text-indigo-100 mb-10 mt-5">
            KaiGo 是一個專為您打造的旅遊規劃助手，簡單、高效、協作。
        </p>
        
        <!-- Call to Action -->
        <div class="space-y-4">
            <router-link to="/dashboard" class="inline-block px-10 py-4 text-xl font-bold rounded-full bg-white text-indigo-600 hover:bg-gray-100 transition duration-300 shadow-xl transform hover:scale-105">
                立即啟動您的旅程規劃 🗺️
            </router-link>
            <p class="text-sm text-indigo-200 pt-3">
                首次使用？點擊上方按鈕將引導您至登入/註冊頁面。
            </p>
        </div>
    </div>
    
    <!-- Feature Section Mockup -->
    <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div class="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
            <h3 class="text-xl font-bold mb-2">🛫 行程管理</h3>
            <p class="text-sm text-indigo-100">輕鬆拖放景點、住宿和交通，建立完美時間表。</p>
        </div>
        <div class="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
            <h3 class="text-xl font-bold mb-2">👥 協作分享</h3>
            <p class="text-sm text-indigo-100">與旅伴即時同步行程，無需來回發送文件。</p>
        </div>
        <div class="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
            <h3 class="text-xl font-bold mb-2">💸 預算追蹤</h3>
            <p class="text-sm text-indigo-100">紀錄旅途開銷，保持預算不超標。</p>
        </div>
    </div>

  </div>
</template>

<script setup lang="ts">
// 首頁無需特殊邏輯
</script>
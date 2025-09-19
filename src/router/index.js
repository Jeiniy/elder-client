// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// 選「其一」寫法，不要同檔同時用靜態 + 動態
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // ← 重點
  routes: [
    { path: '/',     name: 'login', component: () => import('@/views/LoginView.vue') },
    { path: '/home', name: 'home',  component: () => import('@/views/HomeView.vue') },
    { path: '/chat', name: 'chat',  component: () => import('@/views/ChatView.vue') },
  ],
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: LoginView },
    // 之後如果要有登入後的首頁，可以另外開一個路由
    // 例如：{ path: '/dashboard', component: DashboardView }
  ],
})

export default router

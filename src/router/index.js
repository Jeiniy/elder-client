import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'
import ChatView from '@/views/ChatView.vue'
const router = createRouter({
  history: createWebHistory('/elder/'),
  routes: [
    { path: '/', component: LoginView },
    { path: '/chat', component: ChatView },
    { path: '/home', component: HomeView},
    // 之後如果要有登入後的首頁，可以另外開一個路由
    // 例如：{ path: '/dashboard', component: DashboardView }
  ],
})

export default router

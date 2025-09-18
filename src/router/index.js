import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import ImageView from '@/views/ImageView.vue'
const router = createRouter({
  history: createWebHistory('/elder/'),
  routes: [
    { path: '/', component: LoginView },
    { path: '/image', component: ImageView},
    // 之後如果要有登入後的首頁，可以另外開一個路由
    // 例如：{ path: '/dashboard', component: DashboardView }
  ],
})

export default router

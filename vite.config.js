// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'   // ← 一定要有，否則會報 fileURLToPath 未定義

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  // 部署在 /elder/ 子路徑（開發也用同一個 base，網址用 http://<IP>:5173/elder/）
  base: '/elder/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // ← 讓 @ 指到 src
    },
  },
  server: {
    host: true,
    proxy: {
      '/video_feed': { target: 'http://100.122.39.78:5000', changeOrigin: true },
      '/events': { target: 'http://100.122.39.78:5000', changeOrigin: true },
      '/fall_status': { target: 'http://100.122.39.78:5000', changeOrigin: true },
    },
  },
}))

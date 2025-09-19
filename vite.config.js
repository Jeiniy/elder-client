// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const base = process.env.NODE_ENV === 'production' ? '/elder/' : '/'

export default defineConfig({
  plugins: [vue()],
  base,
  server: { host: true },
  build: { outDir: 'dist' },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // ← 這行一定要有
    },
  },
})

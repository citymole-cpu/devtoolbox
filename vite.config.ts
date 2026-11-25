import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // 部署在 https://zapbits.xyz/tools/ 子路径下，资源需用 /tools/ 前缀。
  // 如以后迁到独立子域名根路径（如 tools.zapbits.xyz），把 base 改回 '/' 再构建。
  base: '/tools/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },
})


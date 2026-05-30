import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Assets are served from /admin-panel/ by Express in production
  base: '/admin-panel/',

  build: {
    // Build output goes into public/admin-panel/dist (served by Express)
    outDir: '../public/admin-panel/dist',
    emptyOutDir: true,
  },

  server: {
    port: 3001,
    // During development, proxy API calls to the Express backend
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/admin/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/admin/orders': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})

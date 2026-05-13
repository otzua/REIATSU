import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/music': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/music/, ''),
      },
      '/api': {
        target: 'http://localhost:4001',
        changeOrigin: true,
      },
      '/tmdb-api': {
        target: 'https://twilight-cake-defb.hunternisha55.workers.dev/3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tmdb-api/, '')
      },
    },
  },
})

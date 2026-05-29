import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    cssTarget: ['chrome80', 'safari13', 'edge88', 'firefox78'],
    sourcemap: true,
    chunkSizeWarningLimit: 600,
  },
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
      '/toon-api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/toon-api/, '')
      },
      '/tmdb-api': {
        target: 'https://api.tmdb.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/tmdb-api/, '/3'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0');
            proxyReq.setHeader('Accept', 'application/json');
          });
        },
      },
    },
  },
})

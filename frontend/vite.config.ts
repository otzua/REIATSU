import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Do NOT use 'esnext' here — Vite's Lightning CSS with esnext target strips
    // the unprefixed `backdrop-filter`, keeping only `-webkit-backdrop-filter`.
    // Chrome 76+ requires the UNPREFIXED version; webkit-only does nothing.
    // Targeting chrome100 preserves both prefixed and unprefixed in the build output.
    target: ['chrome100', 'safari16', 'firefox100'],
    sourcemap: true,
    chunkSizeWarningLimit: 600,
    cssMinify: 'esbuild',
  },
  server: {
    proxy: {
      '/api/music': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/music/, ''),
      },
      '/api/eros': {
        target: 'https://eros-api.vercel.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/eros/, ''),
      },
      '/api': {
        target: 'https://reiatsu-anime-api.otzuaa.workers.dev',
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
            // Inject TMDB API key into the already-rewritten path (e.g. /3/trending/movie/week).
            // Must read proxyReq.path (post-rewrite), not req.url (pre-rewrite), to avoid
            // a double /3 prefix that causes 404s.
            const [pathname, querystring] = proxyReq.path.split('?');
            const params = new URLSearchParams(querystring || '');
            if (!params.has('api_key')) {
              params.set('api_key', process.env.VITE_TMDB_API_KEY || 'd131017ccc6e5462a81c9304d21476de');
              proxyReq.path = `${pathname}?${params.toString()}`;
            }
          });
        },
      },
    },
  },
})

import { defineConfig } from 'vite'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  server: {
    proxy: {
      // Local PHP dev server for api/ - run `php -S localhost:8000 router.php`
      // from inside api/, per api/router.php's own header comment.
      // VITE_API_PROXY_TARGET overrides this for docker-compose, where the
      // api container is reachable at http://api:8000 instead of localhost.
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
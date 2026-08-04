import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
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
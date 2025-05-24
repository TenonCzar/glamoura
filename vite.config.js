import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: '/',
  plugins: [vue(), tailwindcss()],
  server: {
    proxy: {
      // ▼ More explicit proxy configuration
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  assetsInclude: ['**/*.html'],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // ▼ Optional: Reduce chunking issues
    rollupOptions: {
      input: {
        main: './index.html', // Path to your entry HTML file
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://allowance-generator-client.onrender.com',
        changeOrigin: true
      }
    }
  },
  // Add this for production
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
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
    sourcemap: false,
    // Add rollupOptions to fix react-quill import issue
    rollupOptions: {
      external: ['react-quill'],
      output: {
        globals: {
          'react-quill': 'ReactQuill'
        }
      }
    }
  },
  // Add optimizeDeps for better development experience
  optimizeDeps: {
    include: ['react-quill']
  }
})
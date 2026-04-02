import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'heroui': ['@heroui/react'],
          'heroicons': ['@heroicons/react'],
          'recharts': ['recharts'],
          'helmet': ['react-helmet-async'],
        }
      }
    }
  }
})

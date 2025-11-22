import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '.certs/bookmarkhub.app+3-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '.certs/bookmarkhub.app+3.pem')),
    },
    allowedHosts: ['bookmarkhub.local', 'www.bookmarkhub.local', 'bookmarkhub.app', 'www.bookmarkhub.app'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - libraries that rarely change
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          'chakra-ui': ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
          'zustand': ['zustand'],
          'react-icons': ['react-icons/lu', 'react-icons/hi2'],

          // Feature chunks - can be lazy loaded
          'validation': ['zod'],
          'utils': ['dompurify', 'react-hot-toast'],
          'drag-drop': ['react-dnd', 'react-dnd-html5-backend'],
        },
      },
    },
    // Increase chunk size warning limit since we're splitting
    chunkSizeWarningLimit: 600,
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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

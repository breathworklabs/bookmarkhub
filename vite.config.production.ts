import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Production configuration without local certs
export default defineConfig({
  plugins: [react()],

  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production for security
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
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
        assetFileNames: 'assets/[hash][extname]',
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      },
    },
    // Increase chunk size warning limit since we're splitting
    chunkSizeWarningLimit: 600,

    // Optimize CSS
    cssCodeSplit: true,
    cssMinify: true,
  },

  // Resolve aliases for cleaner imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@store': path.resolve(__dirname, './src/store'),
      '@pages': path.resolve(__dirname, './src/pages'),
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@chakra-ui/react',
      '@emotion/react',
      '@emotion/styled',
      'zustand',
      'react-router-dom',
    ],
  },
})
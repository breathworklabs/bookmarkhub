import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'
import fs from 'fs'
import path from 'path'

// Check if certificates exist (only for local development)
const certsExist = fs.existsSync(
  path.resolve(__dirname, '.certs/bookmarkhub.app+3-key.pem')
)

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    Sitemap({
      hostname: 'https://bookmarkhub.app',
      dynamicRoutes: [
        '/welcome',
        '/help',
        '/upcoming-features',
        '/terms',
        '/privacy',
        '/cookies',
      ],
      exclude: ['/trash', '/shared', '/settings'],
      changefreq: 'monthly',
      priority: 0.8,
      generateRobotsTxt: false, // Use our custom robots.txt from public folder
    }),
  ],
  server: {
    host: true,
    port: 5173,
    ...(certsExist && {
      https: {
        key: fs.readFileSync(
          path.resolve(__dirname, '.certs/bookmarkhub.app+3-key.pem')
        ),
        cert: fs.readFileSync(
          path.resolve(__dirname, '.certs/bookmarkhub.app+3.pem')
        ),
      },
    }),
    allowedHosts: [
      'localhost',
      'bookmarkhub.local',
      'www.bookmarkhub.local',
      'bookmarkhub.app',
      'www.bookmarkhub.app',
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - libraries that rarely change
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          'chakra-ui': [
            '@chakra-ui/react',
            '@emotion/react',
            '@emotion/styled',
          ],
          zustand: ['zustand'],
          'react-icons': ['react-icons/lu', 'react-icons/hi2'],

          // Feature chunks - can be lazy loaded
          validation: ['zod'],
          utils: ['dompurify', 'react-hot-toast'],
          'drag-drop': ['react-dnd', 'react-dnd-html5-backend'],
        },
      },
    },
    // Increase chunk size warning limit since we're splitting
    chunkSizeWarningLimit: 600,
  },
})

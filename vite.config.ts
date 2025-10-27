import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Define your repo name once
const repoName = 'task-sparkle-react'

export default defineConfig({
  // 1. Set the base path
  base: `/${repoName}/`, 

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      
      // 2. Tell the plugin to include these assets in the service worker
      includeAssets: [
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-maskable-512x512.png'
      ],

      manifest: {
        name: 'Task Sparkle',
        short_name: 'TaskSparkle',
        description: 'A modern to-do and task management app.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        
        // 3. Set the scope and start_url to your repo path
        scope: `/${repoName}/`,
        start_url: `/${repoName}/`,
        
        display: 'standalone',

        // 4. Un-comment your icons (since you've confirmed they exist)
        icons: [
          {
            src: 'pwa-192x192.png', // Must be in /public/pwa-192x192.png
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png', // Must be in /public/pwa-512x512.png
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-maskable-512x512.png', // Must be in /public/pwa-maskable-512x512.png
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    })
  ],
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // 1. This is the only place your repo name should be
  base: '/task-sparkle-react/', 

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      
      // 2. This tells the service worker to cache the icons
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
        
        // 3. Set scope and start_url to be relative to your base
        // Vite will turn these into '/task-sparkle-react/'
        scope: '.',
        start_url: '.',
        
        display: 'standalone',

        // 4. Icon paths are now relative to the 'public' folder
        // Vite will turn these into '/task-sparkle-react/pwa-192x192.png'
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    })
  ],
})
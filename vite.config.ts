import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// 1. Define your repo name and base path
const repoName = 'task-sparkle-react'
const basePath = `/${repoName}/`

export default defineConfig({
  // 2. Set the base path
  base: basePath, 

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      
      // 3. Add injectRegister (from your pantrypal config)
      // This is critical for getting registerSW.js to work
      injectRegister: 'auto',

      // 4. Add the workbox config from your example
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,ttf,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }, // 1 year
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }, // 1 year
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },

      // 5. Configure the manifest just like your working example
      manifest: {
        id: basePath,
        name: 'Task Sparkle',
        short_name: 'TaskSparkle',
        description: 'A modern to-do and task management app.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: basePath,
        start_url: basePath,

        // 6. Manually add the base path to all icon 'src' URLs
        icons: [
          {
            src: `${basePath}pwa-128x128.png`,
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: `${basePath}pwa-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: `${basePath}pwa-maskable-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    })
  ],
})
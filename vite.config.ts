import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // <-- 1. Import the plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // --- 2. Add the PWA plugin ---
    VitePWA({
      registerType: 'autoUpdate', // Automatically update the app

      // --- 3. This is your app's "manifest" ---
      // It tells the device how to display your app
      manifest: {
        name: 'Task Sparkle',
        short_name: 'TaskSparkle',
        description: 'A modern to-do and task management app.',
        theme_color: '#ffffff', // Your light theme's background
        background_color: '#ffffff',
        start_url: '/',
        display: 'standalone',

        // --- 4. App Icons ---
        // You need to create these icon files
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
            src: 'pwa-maskable-512x512.png', // A "maskable" icon
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    })
  ],
})
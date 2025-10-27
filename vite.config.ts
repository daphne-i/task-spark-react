import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Task Sparkle',
        short_name: 'TaskSparkle',
        description: 'A sparkling task management app',
        theme_color: '#ffffff', // Your light theme color
        background_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png', // Create these icons in /public
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
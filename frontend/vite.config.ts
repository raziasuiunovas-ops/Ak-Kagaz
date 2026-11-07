import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA temporarily disabled due to workbox-build ESM compatibility issues in v0.19.8
    // Icons and manifest are configured manually in index.html and public/manifest.json
    // To re-enable: update vite-plugin-pwa to a version with ESM support
    // VitePWA({...})
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});

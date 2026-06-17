import { defineConfig } from 'vite';
import * as path from 'path';

import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [],
  },
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  base: '/',
  build: {
    chunkSizeWarningLimit: 3000,
    commonjsOptions: {
      include: [/node_modules/],
    },
    cssCodeSplit: true,
    assetsInlineLimit: 0,
  },
  server: {
    host: true,
    port: 3011,
    strictPort: true,
    watch: {
      ignored: ['**/src/assets/@fortawesome/**'],
    },
  },
});

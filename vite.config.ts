import { defineConfig } from 'vite';
import * as path from 'path';

import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'antd',
      '@ant-design/icons',
      'axios',
      'lodash',
      'dayjs',
      'react-redux',
      '@reduxjs/toolkit',
    ],
  },
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  base: '/',
  build: {
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      include: [/node_modules/],
    },
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-antd': ['antd', '@ant-design/icons'],
          'vendor-redux': ['react-redux', '@reduxjs/toolkit', 'redux', 'redux-persist'],
          'vendor-bootstrap': ['bootstrap', 'react-bootstrap'],
          'vendor-lodash': ['lodash'],
          'vendor-form': ['formik', 'yup'],
          'vendor-date': ['dayjs', 'moment', 'flatpickr', 'react-flatpickr'],
          'vendor-chart': ['apexcharts', 'react-apexcharts', 'chart.js', 'highcharts', 'highcharts-react-official'],
          'vendor-syncfusion': ['@syncfusion/ej2-base', '@syncfusion/ej2-buttons', '@syncfusion/ej2-dropdowns', '@syncfusion/ej2-inputs', '@syncfusion/ej2-navigations'],
          'vendor-sheet': ['handsontable', '@handsontable/react', '@handsontable/react-wrapper', 'xlsx'],
        },
      },
    },
  },
  server: {
    host: true,
    port: 3011,
    strictPort: true,
    allowedHosts: ['dmst.hanhchinhcong.net'],
    watch: {
      ignored: ['**/src/assets/@fortawesome/**'],
    },
  },
});
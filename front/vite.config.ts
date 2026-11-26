import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const target = process.env.VITE_BACKEND ?? 'http://localhost:8000';
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    proxy: {
      '/api': { target, changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, '') },
      '/storage': { target: process.env.VITE_MINIO ?? 'http://localhost:9000', changeOrigin: true },
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    // Cổng 3000 đang bận thì báo lỗi thay vì tự mở server thứ hai ở 3001
    strictPort: true,
    // Gọi API backend (Express, cổng 5000) qua cùng origin
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true, // WebSocket /api/ws (số liệu thời gian thực)
        xfwd: true,
        // Backend (cổng 5000) chưa chạy: trả 503 kèm thông báo rõ ràng thay cho 500 trống của proxy
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            const r = res as import('node:http').ServerResponse;
            if (r.headersSent || typeof r.writeHead !== 'function') return;
            r.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
            r.end(JSON.stringify({ error: { code: 'BACKEND_DOWN', message: 'Không kết nối được máy chủ. Hãy bật backend: cd backend && npx tsx watch src/app/server.ts' } }));
          });
        },
      },
    },
  },
});

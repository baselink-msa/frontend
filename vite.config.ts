import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/auth': 'http://localhost:8081',
      '/api/games': 'http://localhost:8082',
      '/api/admin': 'http://localhost:8083',
      '/api/waiting-room': 'http://localhost:8084',
      '/api/chatbot': 'http://localhost:8000',
      '/api/orders': 'http://localhost:8001',
      '/api/seats/locks': 'http://localhost:8086',
      '/api/tickets': 'http://localhost:8087',
    },
  },
  build: {
    sourcemap: true,
  },
});

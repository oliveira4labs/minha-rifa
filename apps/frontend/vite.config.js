import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Em desenvolvimento, o Vite repassa a API e as fotos para o backend (porta 3000).
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': BACKEND_URL,
      '/uploads': BACKEND_URL,
    },
  },
});

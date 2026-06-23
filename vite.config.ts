import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Ensure this matches your expected frontend port
    proxy: {
      '/api': {
        target: 'https://rad-final-project-backend.vercel.app',
        changeOrigin: true,
        secure: false,
      }
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
  },
})
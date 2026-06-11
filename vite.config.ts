import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This tells Vite how to handle the HMR connection directly
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
  },
})
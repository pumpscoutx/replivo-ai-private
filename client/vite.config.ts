import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    hmr: {
      host: 'localhost',
      clientPort: 5173,
      protocol: 'ws'
    }
  }
}) 
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: 'all' // option importante pour ngrok
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
})
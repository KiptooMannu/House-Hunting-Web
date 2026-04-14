import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Force Vite to always resolve a single copy of React and React DOM
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  // Optional: disable source maps to get accurate error line numbers (helps debugging)
  build: {
    sourcemap: false,
  },
})
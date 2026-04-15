import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // Output to dist/ inside frontend/; Dockerfile copies this to ./static in the Go stage.
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    // In dev mode (npm run dev), proxy /api calls to the Go backend on :8080
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})

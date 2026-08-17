import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
//
// Dev server runs on :5173, which xsl-backend/src/app.ts already whitelists
// in its CORS `allowedOrigins` list — no backend change needed to talk to it.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
})

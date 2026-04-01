import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- 1. Import the Tailwind v4 plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(), // <-- 2. Add it to the plugins array BEFORE react()
    react()
  ],
  server: {
    port: 5173,
    host: true
  }
})
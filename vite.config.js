import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// User site (mraz2766.github.io) is served from the domain root, so assets must
// resolve from "/" — a relative base breaks nested routes like /works/pets.
export default defineConfig({
  plugins: [react()],
  base: '/',
})

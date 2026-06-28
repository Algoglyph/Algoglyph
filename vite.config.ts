import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Web is served from the domain root, so use an absolute base — this is
  // required for client-side sub-path routes like `/workspace` to load assets
  // correctly. The packaged Electron build loads over `file://` and needs
  // relative paths, so its build sets ELECTRON_BUILD=1 (see `electron:build`).
  base: process.env.ELECTRON_BUILD ? './' : '/',
  server: { port: Number(process.env.PORT) || 5173 },
  plugins: [react(), tailwindcss()],
  define: {
    'process.env.IS_PREACT': JSON.stringify('true'),
  },
})

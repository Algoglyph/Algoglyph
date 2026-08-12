import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Web is served from the domain root, so use an absolute base — this is
  // required for client-side sub-path routes like `/workspace` to load assets
  // correctly. The packaged Electron build loads over `file://` and needs
  // relative paths, so its build sets ELECTRON_BUILD=1 (see `electron:build`).
  base: process.env.ELECTRON_BUILD ? './' : '/',
  server: {
    port: Number(process.env.PORT) || 5173,
    watch: {
      // Local agent/assistant skill folders can contain circular symlinks.
      // They are tooling-only and should never participate in Vite HMR.
      ignored: [
        '**/release/**',
        '**/dist/**',
        '**/.agents/**',
        '**/.claude/**',
        '**/.codex/**',
      ]
    }
  },
  plugins: [react(), tailwindcss()],
  define: {
    'process.env.IS_PREACT': JSON.stringify('true'),
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // /workspace and /roadmap are real built entry points (each boots the
        // full App, which routes off location.pathname). They are served as
        // static assets by Cloudflare Pages — unlike a `_redirects` rewrite to
        // /index.html, which Pages canonicalizes and bounces to `/`.
        workspace: resolve(__dirname, 'workspace.html'),
        roadmap: resolve(__dirname, 'roadmap.html'),
        about: resolve(__dirname, 'about/index.html'),
        privacy: resolve(__dirname, 'privacy/index.html'),
        terms: resolve(__dirname, 'terms/index.html'),
        blog: resolve(__dirname, 'blog.html'),
        404: resolve(__dirname, '404.html')
      }
    }
  }
})

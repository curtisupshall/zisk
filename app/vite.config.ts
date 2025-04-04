import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react(),
  ],
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'src/zisk')}/`
    }
  },
  // root: path.resolve('./src/web'),
  // build: {
  //   rollupOptions: {
  //     input: {
  //       app: './src/web/index.html',
  //     },
  //   },
  // },
  server: {
    port: 9476,
    host: '127.0.0.1',
    allowedHosts: [
      'ax0ne.me'
    ]
  }
})

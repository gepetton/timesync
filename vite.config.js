import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req.url === '/api/analyze-time' && req.method === 'POST') {
              const originalUrl = req.url
              req.url = '/services/api'
              import('./src/services/api/index.js').then(({ handleTimeAnalysis }) => {
                let body = ''
                req.on('data', chunk => {
                  body += chunk.toString()
                })
                req.on('end', async () => {
                  try {
                    const { message, userId } = JSON.parse(body)
                    const result = await handleTimeAnalysis(message, userId)
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify(result))
                  } catch (error) {
                    res.statusCode = 500
                    res.end(JSON.stringify({ error: error.message }))
                  }
                })
              })
              return true
            }
          })
        },
      },
    },
  },
})

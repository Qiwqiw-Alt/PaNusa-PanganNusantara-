import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

const usersFilePath = path.resolve(process.cwd(), 'users.json')
const historyFilePath = path.resolve(process.cwd(), 'history.json')

function localJsonApi() {
  return {
    name: 'local-json-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // --- API USERS ---
        if (req.url === '/api/users') {
          if (req.method === 'GET') {
            if (!fs.existsSync(usersFilePath)) fs.writeFileSync(usersFilePath, JSON.stringify([]))
            res.setHeader('Content-Type', 'application/json')
            res.end(fs.readFileSync(usersFilePath))
            return
          }
          if (req.method === 'POST') {
            let body = ''
            req.on('data', chunk => { body += chunk.toString() })
            req.on('end', () => {
              const newUser = JSON.parse(body)
              let users = []
              if (fs.existsSync(usersFilePath)) users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8') || '[]')
              users.push(newUser)
              fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2))
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, message: 'User added' }))
            })
            return
          }
        }
        
        // --- API HISTORY ---
        if (req.url === '/api/history') {
          if (req.method === 'GET') {
            if (!fs.existsSync(historyFilePath)) fs.writeFileSync(historyFilePath, JSON.stringify([]))
            res.setHeader('Content-Type', 'application/json')
            res.end(fs.readFileSync(historyFilePath))
            return
          }
          if (req.method === 'POST') {
            let body = ''
            req.on('data', chunk => { body += chunk.toString() })
            req.on('end', () => {
              const newHistory = JSON.parse(body)
              let history = []
              if (fs.existsSync(historyFilePath)) history = JSON.parse(fs.readFileSync(historyFilePath, 'utf-8') || '[]')
              history.push({ ...newHistory, id: Date.now(), timestamp: new Date().toISOString() })
              fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2))
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, message: 'History saved' }))
            })
            return
          }
        }
        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    localJsonApi()
  ],
  server: {
    watch: {
      ignored: ['**/users.json', '**/history.json']
    }
  }
})

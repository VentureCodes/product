import cors from 'cors'
import express from 'express'
import http from 'http'
import cookieSession from 'cookie-session'

const app = express()
const httpServer = http.createServer(app)

app.set('trust proxy', true)
app.use(cors<cors.CorsRequest>())
app.use(express.json({ limit: '50mb' }))
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hrs
  }),
)

import './routes'

app.get('/health', (_, res) => res.send('OK'))

export { app, httpServer }

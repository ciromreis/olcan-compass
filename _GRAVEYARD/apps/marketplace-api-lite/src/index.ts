import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { productsRouter } from './routes/products'
import { servicesRouter } from './routes/services'
import { bookingsRouter } from './routes/bookings'
import { vendorsRouter } from './routes/vendors'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 9000

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/store/products', productsRouter)
app.use('/store/services', servicesRouter)
app.use('/store/bookings', bookingsRouter)
app.use('/store/vendors', vendorsRouter)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Olcan Marketplace API (Lite) running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`📦 Products: http://localhost:${PORT}/store/products`)
  console.log(`🎯 Services: http://localhost:${PORT}/store/services`)
})

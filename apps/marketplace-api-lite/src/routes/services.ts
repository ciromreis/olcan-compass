import { Router } from 'express'
import { SERVICES } from '../data/services'

export const servicesRouter = Router()

// GET /store/services - List all services
servicesRouter.get('/', (req, res) => {
  const { type, vendor_id, featured, limit = '10', offset = '0' } = req.query
  
  let filtered = [...SERVICES]
  
  if (type) {
    filtered = filtered.filter(s => s.type === type)
  }
  
  if (vendor_id) {
    filtered = filtered.filter(s => s.vendor_id === vendor_id)
  }
  
  if (featured === 'true') {
    filtered = filtered.filter(s => s.is_featured)
  }
  
  const start = parseInt(offset as string)
  const end = start + parseInt(limit as string)
  const paginated = filtered.slice(start, end)
  
  res.json({
    services: paginated,
    count: filtered.length,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string)
  })
})

// GET /store/services/:slug - Get service by slug
servicesRouter.get('/:slug', (req, res) => {
  const service = SERVICES.find(s => s.slug === req.params.slug)
  
  if (!service) {
    return res.status(404).json({ error: 'Service not found' })
  }
  
  res.json(service)
})

// GET /store/services/:id/availability - Get available time slots
servicesRouter.get('/:id/availability', (req, res) => {
  const { date } = req.query
  
  if (!date) {
    return res.status(400).json({ error: 'Date parameter required' })
  }
  
  // Mock availability - generate slots from 9am to 5pm
  const slots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
  ]
  
  res.json({ slots, date })
})

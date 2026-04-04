import { Router } from 'express'

export const bookingsRouter = Router()

// In-memory bookings store (replace with database in production)
const bookings: any[] = []

// POST /store/bookings - Create a booking
bookingsRouter.post('/', (req, res) => {
  const { service_id, scheduled_date, scheduled_time, customer_notes } = req.body
  
  if (!service_id || !scheduled_date || !scheduled_time) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  
  const booking = {
    id: `booking_${Date.now()}`,
    service_id,
    customer_id: 'customer_demo',
    vendor_id: 'vendor_demo',
    scheduled_date,
    scheduled_time,
    duration_minutes: 60,
    timezone: 'America/Sao_Paulo',
    status: 'pending',
    payment_status: 'pending',
    price_paid: 19700,
    currency: 'BRL',
    meeting_link: null,
    customer_notes: customer_notes || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  bookings.push(booking)
  
  res.json(booking)
})

// GET /store/bookings/me - Get my bookings
bookingsRouter.get('/me', (req, res) => {
  res.json({ bookings })
})

// GET /store/bookings/:id - Get booking by ID
bookingsRouter.get('/:id', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id)
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' })
  }
  
  res.json(booking)
})

// POST /store/bookings/:id/cancel - Cancel a booking
bookingsRouter.post('/:id/cancel', (req, res) => {
  const { reason } = req.body
  const booking = bookings.find(b => b.id === req.params.id)
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' })
  }
  
  booking.status = 'cancelled'
  booking.cancellation_reason = reason
  booking.cancelled_at = new Date().toISOString()
  
  res.json({ success: true, booking })
})

// POST /store/bookings/:id/rate - Rate a booking
bookingsRouter.post('/:id/rate', (req, res) => {
  const { rating, review } = req.body
  const booking = bookings.find(b => b.id === req.params.id)
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' })
  }
  
  booking.rating = rating
  booking.review_text = review
  booking.reviewed_at = new Date().toISOString()
  
  res.json({ success: true, booking })
})

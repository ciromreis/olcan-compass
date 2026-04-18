import { Router } from 'express'
import { PRODUCTS } from '../data/products'

export const productsRouter = Router()

// GET /store/products - List all products
productsRouter.get('/', (req, res) => {
  const { type, featured, limit = '10', offset = '0' } = req.query
  
  let filtered = [...PRODUCTS]
  
  if (type) {
    filtered = filtered.filter(p => p.type === type)
  }
  
  if (featured === 'true') {
    filtered = filtered.filter(p => p.is_featured)
  }
  
  const start = parseInt(offset as string)
  const end = start + parseInt(limit as string)
  const paginated = filtered.slice(start, end)
  
  res.json({
    products: paginated,
    count: filtered.length,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string)
  })
})

// GET /store/products/:slug - Get product by slug
productsRouter.get('/:slug', (req, res) => {
  const product = PRODUCTS.find(p => p.slug === req.params.slug)
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }
  
  res.json(product)
})

// POST /store/products/purchase - Purchase a product
productsRouter.post('/purchase', (req, res) => {
  const { product_id, customer_type = 'b2c' } = req.body
  
  const product = PRODUCTS.find(p => p.id === product_id)
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }
  
  const price = customer_type === 'b2b' ? product.price_b2b : product.price_b2c
  
  // Mock order creation
  const order = {
    order_id: `order_${Date.now()}`,
    product_id,
    customer_type,
    price,
    currency: product.currency,
    download_url: product.download_url,
    access_expires_at: new Date(Date.now() + product.access_duration_days * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  }
  
  res.json(order)
})

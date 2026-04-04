# Olcan Marketplace API Lite

**Lightweight Express-based marketplace API - Ready in 30 seconds!**

This is a simplified version of the marketplace API that works immediately without MedusaJS dependencies. Perfect for:
- Quick prototyping
- Frontend development
- Testing the marketplace client
- Demo purposes

## Quick Start

```bash
# Navigate to this directory
cd apps/marketplace-api-lite

# Install dependencies (fast - only Express + TypeScript)
npm install

# Start development server
npm run dev
```

That's it! The API will be running at **http://localhost:9000**

## Test It

```bash
# Health check
curl http://localhost:9000/health

# List products
curl http://localhost:9000/store/products

# Get Kit Application product
curl http://localhost:9000/store/products/kit-application-guia-completo

# List services
curl http://localhost:9000/store/services

# Get featured services
curl http://localhost:9000/store/services?featured=true
```

## Available Endpoints

### Products
- `GET /store/products` - List all products
- `GET /store/products/:slug` - Get product details
- `POST /store/products/purchase` - Purchase a product

### Services
- `GET /store/services` - List all services
- `GET /store/services/:slug` - Get service details
- `GET /store/services/:id/availability` - Get available time slots

### Bookings
- `POST /store/bookings` - Create a booking
- `GET /store/bookings/me` - Get my bookings
- `GET /store/bookings/:id` - Get booking details
- `POST /store/bookings/:id/cancel` - Cancel a booking
- `POST /store/bookings/:id/rate` - Rate a booking

### Vendors
- `GET /store/vendors` - List all vendors
- `GET /store/vendors/:id` - Get vendor details

## Mock Data Included

### Products
- ✅ Kit Application - R$ 197
- ✅ E-book: Estudar no Canadá - R$ 47
- ✅ Curso: Preparação para Entrevistas - R$ 297

### Services
- ✅ Revisão de CV - R$ 197 (45 min)
- ✅ Preparação para Entrevista - R$ 397 (90 min)
- ✅ Edição de SOP - R$ 247 (60 min)
- ✅ Mentoria Mensal - R$ 997 (4 sessões)

### Vendors
- ✅ Olcan Official
- ✅ Maria Silva - Career Coach
- ✅ João Santos - Interview Coach

## Integration with V2.5 App

The marketplace client at `apps/app-compass-v2.5/src/lib/marketplace-client.ts` is already configured to work with this API.

Just set the environment variable:
```bash
# In apps/app-compass-v2.5/.env.local
NEXT_PUBLIC_MARKETPLACE_API_URL=http://localhost:9000
```

Then use it in your components:
```typescript
import { marketplaceClient } from '@/lib/marketplace-client'

const { data } = await marketplaceClient.getProducts({ featured: true })
```

## Next Steps

1. **Start this API**: `npm run dev`
2. **Update v2.5 app**: Set `NEXT_PUBLIC_MARKETPLACE_API_URL=http://localhost:9000`
3. **Test marketplace pages**: Visit `http://localhost:3000/marketplace`
4. **Add to website**: Create store pages at `/store`

## Migrate to Full MedusaJS Later

This lite version uses in-memory data. When ready for production:
1. Complete the MedusaJS setup in `apps/marketplace-api`
2. Add PostgreSQL database
3. Implement real payment processing
4. Add file storage
5. Switch the API URL to the MedusaJS backend

The API interface is identical, so no frontend changes needed!

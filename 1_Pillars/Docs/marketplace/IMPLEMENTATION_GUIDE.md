# Olcan Marketplace Implementation Guide

**Status:** Ready for Development  
**Timeline:** 8 weeks  
**Last Updated:** April 3, 2026

---

## Quick Start

### Prerequisites

```bash
# Required software
- Node.js v20+
- PostgreSQL 14+
- Redis 7+
- npm or pnpm
```

### 1. Set Up Marketplace Backend

```bash
cd apps/marketplace-api

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
# - DATABASE_URL
# - REDIS_URL
# - STRIPE_API_KEY
# - RESEND_API_KEY

# Set up database
npm run db:setup

# Run migrations
npm run migrate

# Seed initial data (Kit Application product, sample coaches)
npm run seed

# Start development server
npm run dev
```

Backend will be available at:
- API: `http://localhost:9000`
- Admin Panel: `http://localhost:7000`
- Vendor Portal: `http://localhost:7001`

### 2. Configure V2.5 App

```bash
cd apps/app-compass-v2.5

# Add marketplace API URL to .env.local
echo "NEXT_PUBLIC_MARKETPLACE_API_URL=http://localhost:9000" >> .env.local

# The marketplace client is already created at:
# src/lib/marketplace-client.ts

# Start the app
npm run dev
```

### 3. Configure Website

```bash
cd apps/site-marketing-v2.5

# Add marketplace API URL
echo "NEXT_PUBLIC_MARKETPLACE_API_URL=http://localhost:9000" >> .env.local

# Start the website
npm run dev
```

---

## Implementation Phases

### Phase 1: Backend Foundation (Week 1-2)

#### Week 1: Core Setup
- [x] Create marketplace-api directory structure
- [x] Define data models (Product, Service, Booking, Vendor)
- [ ] Install MedusaJS + Mercur dependencies
- [ ] Configure database connections
- [ ] Set up Redis for caching
- [ ] Configure Stripe for payments

#### Week 2: Core Modules
- [ ] Implement Digital Product module
  - [ ] CRUD operations
  - [ ] File upload/storage
  - [ ] Download URL generation
- [ ] Implement Bookable Service module
  - [ ] CRUD operations
  - [ ] Availability management
- [ ] Implement Booking module
  - [ ] Create booking workflow
  - [ ] Status transitions
  - [ ] Calendar integration
- [ ] Implement Vendor module
  - [ ] Registration flow
  - [ ] Verification workflow
  - [ ] Profile management

### Phase 2: Core Features (Week 3-4)

#### Week 3: Workflows
- [ ] Digital product delivery workflow
  - [ ] Order placed → Generate download link
  - [ ] Send email with access
  - [ ] Track downloads
- [ ] Service booking workflow
  - [ ] Customer books → Vendor notified
  - [ ] Vendor confirms → Meeting link sent
  - [ ] Reminders (24h, 1h before)
  - [ ] Completion → Request review
- [ ] Commission calculation workflow
  - [ ] Split revenue on order
  - [ ] Track vendor earnings
  - [ ] Calculate platform fee

#### Week 4: Payments & Payouts
- [ ] Stripe Connect integration
  - [ ] Connect vendor accounts
  - [ ] Escrow payments
  - [ ] Automatic splits
- [ ] Payout system
  - [ ] Vendor requests payout
  - [ ] Admin approves
  - [ ] Bank transfer / PIX
- [ ] Refund handling
  - [ ] Cancellation refunds
  - [ ] Dispute resolution

### Phase 3: Frontend Integration (Week 5-6)

#### Week 5: V2.5 App Pages

**Marketplace Browse** (`/marketplace`)
```typescript
// apps/app-compass-v2.5/src/app/(app)/marketplace/page.tsx
import { marketplaceClient } from '@/lib/marketplace-client'

export default async function MarketplacePage() {
  const { data: products } = await marketplaceClient.getProducts({ featured: true })
  const { data: services } = await marketplaceClient.getServices({ featured: true })
  
  return (
    <div>
      <section>
        <h2>Featured Digital Products</h2>
        <ProductGrid products={products?.products || []} />
      </section>
      
      <section>
        <h2>Featured Services</h2>
        <ServiceGrid services={services?.services || []} />
      </section>
    </div>
  )
}
```

**Product Detail** (`/marketplace/products/[slug]`)
```typescript
export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { data: product } = await marketplaceClient.getProduct(params.slug)
  
  if (!product) return <NotFound />
  
  return (
    <div>
      <ProductHero product={product} />
      <ProductDetails product={product} />
      <PurchaseButton productId={product.id} price={product.price_b2c} />
    </div>
  )
}
```

**Service Booking** (`/marketplace/services/[slug]/book`)
```typescript
'use client'

export default function ServiceBookingPage({ params }: { params: { slug: string } }) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  
  const handleBook = async () => {
    const { data } = await marketplaceClient.createBooking({
      service_id: service.id,
      scheduled_date: selectedDate.toISOString(),
      scheduled_time: selectedTime,
      customer_notes: notes
    })
    
    if (data) {
      router.push(`/marketplace/bookings/${data.id}`)
    }
  }
  
  return (
    <div>
      <Calendar onSelectDate={setSelectedDate} />
      <TimeSlots date={selectedDate} onSelectTime={setSelectedTime} />
      <BookingForm onSubmit={handleBook} />
    </div>
  )
}
```

**My Purchases** (`/marketplace/purchases`)
- List of purchased digital products
- Download buttons
- Access expiration dates
- Re-download capability

**My Bookings** (`/marketplace/bookings`)
- Upcoming bookings
- Past bookings
- Booking details
- Cancel/reschedule options
- Rate completed sessions

#### Week 6: Website Public Store

**Store Landing** (`/store`)
```typescript
// apps/site-marketing-v2.5/src/app/(public)/store/page.tsx
export default async function StorePage() {
  const { data: products } = await fetch(`${MARKETPLACE_API}/store/products`).then(r => r.json())
  
  return (
    <div>
      <Hero title="Olcan Store" subtitle="Digital products and services for your mobility journey" />
      <ProductCatalog products={products.products} />
      <CTASection />
    </div>
  )
}
```

**Product Catalog** (`/store/products`)
- Grid view of all products
- Filter by type (Kit, E-book, Course)
- Sort by price, popularity
- Search functionality

**Service Catalog** (`/store/services`)
- Grid view of all services
- Filter by type (Coaching, Mentoring, etc.)
- Filter by vendor
- Sort by price, rating

**Checkout Flow**
- Product/service in cart
- Login/register (redirect to app)
- Payment (Stripe)
- Confirmation page
- Email receipt

### Phase 4: Launch Preparation (Week 7-8)

#### Week 7: Content & Testing

**Seed Initial Products**
```typescript
// apps/marketplace-api/src/scripts/seed.ts
const kitApplication = {
  title: "Kit Application - Guia Completo",
  slug: "kit-application-guia-completo",
  type: "kit_application",
  description: "Tudo que você precisa para sua candidatura internacional",
  price_b2c: 19700, // R$ 197.00
  price_b2b: 14700, // R$ 147.00
  files: [
    { name: "CV Template.docx", url: "..." },
    { name: "Cover Letter Template.docx", url: "..." },
    { name: "SOP Guide.pdf", url: "..." },
    { name: "Video Tutorial.mp4", url: "..." }
  ],
  vendor_id: "olcan-official",
  commission_rate: 0, // 100% to Olcan
  is_featured: true
}
```

**Onboard First Vendors**
- Create vendor accounts for Olcan coaches
- Set up their services
- Configure availability calendars
- Test booking flow end-to-end

**Testing Checklist**
- [ ] Product purchase flow (B2C)
- [ ] Product purchase flow (B2B)
- [ ] Service booking flow
- [ ] Vendor confirmation flow
- [ ] Payment processing
- [ ] Payout requests
- [ ] Email notifications
- [ ] Calendar invites
- [ ] Download delivery
- [ ] Refund processing

#### Week 8: Production Deployment

**Infrastructure**
- [ ] Set up production database (PostgreSQL on Railway/Render)
- [ ] Set up production Redis
- [ ] Configure Cloudflare R2 for file storage
- [ ] Set up Stripe production keys
- [ ] Configure Resend for production emails

**Deployment**
```bash
# Deploy marketplace API
cd apps/marketplace-api
docker build -t olcan-marketplace-api .
# Deploy to Railway/Render

# Update v2.5 app environment
NEXT_PUBLIC_MARKETPLACE_API_URL=https://marketplace-api.olcan.com.br

# Update website environment
NEXT_PUBLIC_MARKETPLACE_API_URL=https://marketplace-api.olcan.com.br
```

**Go-Live Checklist**
- [ ] DNS configured
- [ ] SSL certificates
- [ ] Database backups configured
- [ ] Monitoring (Sentry, LogRocket)
- [ ] Analytics (PostHog, Mixpanel)
- [ ] Payment webhooks tested
- [ ] Email templates finalized
- [ ] Legal pages (Terms, Privacy, Refund Policy)
- [ ] Customer support ready

---

## Integration Examples

### Replace Current Marketplace Store

The current marketplace store in v2.5 uses a mock store. Replace it with the real API:

**Before** (`apps/app-compass-v2.5/src/stores/marketplace.ts`):
```typescript
// Old mock implementation
const providers = MOCK_PROVIDERS
```

**After**:
```typescript
import { marketplaceClient } from '@/lib/marketplace-client'

const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      providers: [],
      services: [],
      
      syncFromApi: async () => {
        const { data: vendors } = await marketplaceClient.getVendors()
        const { data: services } = await marketplaceClient.getServices()
        
        set({ 
          providers: vendors?.vendors || [],
          services: services?.services || []
        })
      },
      
      // ... rest of implementation
    }),
    { name: 'olcan-marketplace' }
  )
)
```

### Add Store to Website Navigation

```typescript
// apps/site-marketing-v2.5/src/components/Navigation.tsx
const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Store', href: '/store' }, // NEW
  { name: 'Blog', href: '/blog' },
  { name: 'Login', href: '/login' },
]
```

---

## Environment Variables

### Marketplace API (`.env`)
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/olcan_marketplace
REDIS_URL=redis://localhost:6379

# Server
PORT=9000
NODE_ENV=production
MEDUSA_BACKEND_URL=https://marketplace-api.olcan.com.br

# CORS
STORE_CORS=https://app.olcan.com.br,https://olcan.com.br
ADMIN_CORS=https://admin.olcan.com.br
AUTH_CORS=https://app.olcan.com.br,https://olcan.com.br

# Security
JWT_SECRET=<generate-secure-secret>
COOKIE_SECRET=<generate-secure-secret>

# Stripe
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@olcan.com.br

# File Storage
S3_BUCKET=olcan-marketplace-prod
S3_REGION=auto
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_ENDPOINT=https://...r2.cloudflarestorage.com

# Olcan
OLCAN_APP_URL=https://app.olcan.com.br
OLCAN_WEBSITE_URL=https://olcan.com.br
OLCAN_DEFAULT_COMMISSION_RATE=25
```

### V2.5 App (`.env.local`)
```bash
NEXT_PUBLIC_MARKETPLACE_API_URL=https://marketplace-api.olcan.com.br
```

### Website (`.env.local`)
```bash
NEXT_PUBLIC_MARKETPLACE_API_URL=https://marketplace-api.olcan.com.br
```

---

## Monitoring & Analytics

### Key Metrics to Track

**Business Metrics**
- GMV (Gross Merchandise Value)
- Active vendors
- Products sold
- Services booked
- Conversion rate
- Average order value
- Customer lifetime value

**Technical Metrics**
- API response time (p50, p95, p99)
- Error rate
- Uptime
- Payment success rate
- Email delivery rate
- Download success rate

**Vendor Metrics**
- Earnings per vendor
- Booking completion rate
- Average rating
- Response time
- Payout requests

### Tools
- **Sentry**: Error tracking
- **PostHog**: Product analytics
- **Stripe Dashboard**: Payment analytics
- **Resend Dashboard**: Email analytics

---

## Support & Maintenance

### Customer Support
- Email: support@olcan.com.br
- In-app chat (Intercom/Crisp)
- Help center: help.olcan.com.br

### Vendor Support
- Email: vendors@olcan.com.br
- Vendor portal help docs
- Onboarding video tutorials

### Maintenance Schedule
- **Daily**: Database backups
- **Weekly**: Performance review
- **Monthly**: Security updates
- **Quarterly**: Feature releases

---

## Next Steps

1. **Install dependencies** in `apps/marketplace-api`
2. **Set up local database** (PostgreSQL + Redis)
3. **Run migrations** to create tables
4. **Seed initial data** (Kit Application product)
5. **Test API endpoints** with Postman/Insomnia
6. **Integrate with v2.5 app** marketplace pages
7. **Create public store** pages on website
8. **Deploy to staging** for testing
9. **Launch to production** 🚀

---

## Resources

- **MedusaJS Docs**: https://docs.medusajs.com/v2
- **Mercur Docs**: https://docs.mercurjs.com
- **Stripe Connect**: https://stripe.com/docs/connect
- **Resend Docs**: https://resend.com/docs

---

**Questions?** Open an issue in the repo or contact the development team.

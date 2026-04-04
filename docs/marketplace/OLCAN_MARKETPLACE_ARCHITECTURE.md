# Olcan Marketplace Architecture
## Based on Mercur (MedusaJS v2)

**Last Updated:** April 3, 2026  
**Status:** Implementation Phase

---

## Executive Summary

Olcan Marketplace is a self-hosted, multi-vendor platform for digital products and services built on Mercur/MedusaJS. It supports:

- **Digital Products**: Kit Application, E-books, Courses
- **Services**: Coaching Sessions, Mentoring, Consulting
- **B2C & B2B**: Differentiated pricing for individuals and institutions
- **Multi-vendor**: Coaches, mentors, and partners manage their own offerings
- **Web3-Ready**: Architecture prepared for future blockchain integration

---

## Product Catalog

### 1. Digital Products (Info Products)

#### Kit Application (Flagship Product)
- **Type**: Digital Download
- **Components**: 
  - CV/Resume templates (Notion, Word, PDF)
  - Cover letter templates
  - SOP (Statement of Purpose) guides
  - Application checklists
  - Video tutorials
- **Pricing**: 
  - B2C: R$ 197
  - B2B (institutions): R$ 147/student (bulk)
- **Delivery**: Instant download + email with access links
- **License**: Single-user (B2C) or multi-user (B2B)

#### E-books & Guides
- Study abroad guides by country
- Scholarship application guides
- Immigration process guides
- **Pricing**: R$ 47 - R$ 97

#### Online Courses
- Self-paced video courses
- Application strategy masterclass
- Interview preparation course
- **Pricing**: R$ 297 - R$ 497

### 2. Services (Bookable)

#### Coaching Sessions
- **1:1 Application Review** (60 min): R$ 297
- **Interview Preparation** (90 min): R$ 397
- **CV/Resume Review** (45 min): R$ 197
- **SOP Editing** (per document): R$ 247
- **Full Application Strategy** (3 sessions): R$ 797

#### Mentoring Programs
- **Monthly Mentoring** (4 sessions): R$ 997/month
- **Application Companion** (full cycle): R$ 2,497
- **Institutional Package** (B2B): Custom pricing

#### Consulting Services
- Immigration consulting
- Financial planning for study abroad
- Academic pathway consulting

### 3. Vendor Types

#### Internal (Olcan Team)
- Olcan-created digital products
- Olcan coaches and mentors
- Official Olcan services

#### External Partners
- Verified coaches
- Subject matter experts
- Language tutors
- Immigration consultants
- Financial advisors

---

## Technical Architecture

### Backend: MedusaJS + Mercur Blocks

```
apps/marketplace-api/
├── src/
│   ├── modules/
│   │   ├── seller/           # Vendor management (Mercur block)
│   │   ├── commission/       # Commission calculation (Mercur block)
│   │   ├── payout/          # Payout management (Mercur block)
│   │   ├── olcan-products/  # Custom: Digital products module
│   │   ├── olcan-services/  # Custom: Bookable services module
│   │   └── olcan-pricing/   # Custom: B2C/B2B pricing logic
│   ├── workflows/
│   │   ├── digital-delivery/ # Instant delivery for digital products
│   │   ├── booking-flow/     # Service booking & scheduling
│   │   ├── commission-split/ # Revenue sharing (Mercur)
│   │   └── payout-request/   # Vendor payout processing (Mercur)
│   ├── api/
│   │   ├── admin/           # Admin API routes
│   │   ├── vendor/          # Vendor portal API routes
│   │   └── store/           # Public storefront API routes
│   └── subscribers/
│       ├── order-placed/    # Trigger digital delivery
│       └── booking-confirmed/ # Send calendar invites
├── medusa-config.ts
└── package.json
```

### Frontend Integration

#### 1. V2.5 App (`apps/app-compass-v2.5`)
- **Marketplace Browse**: `/marketplace` (existing, enhanced)
- **Product Detail**: `/marketplace/products/[slug]`
- **Service Booking**: `/marketplace/services/[id]/book`
- **My Purchases**: `/marketplace/purchases`
- **My Bookings**: `/marketplace/bookings`
- **Vendor Dashboard**: `/provider/*` (existing, enhanced)

#### 2. Website (`apps/site-marketing-v2.5`)
- **Public Store**: `/store` (new)
- **Product Catalog**: `/store/products`
- **Service Catalog**: `/store/services`
- **Product Detail**: `/store/products/[slug]`
- **Checkout**: `/store/checkout`
- **Login/Register**: Redirect to app for auth

---

## Data Models

### Product (Digital)
```typescript
{
  id: string
  title: string
  description: string
  type: 'digital_product' | 'course' | 'ebook'
  price_b2c: number
  price_b2b: number
  currency: 'BRL'
  files: DownloadableFile[]
  vendor_id: string
  commission_rate: number // 0-100%
  is_active: boolean
  metadata: {
    access_duration: number // days
    license_type: 'single' | 'multi'
    delivery_method: 'instant' | 'email'
  }
}
```

### Service (Bookable)
```typescript
{
  id: string
  title: string
  description: string
  type: 'coaching' | 'mentoring' | 'consulting'
  duration_minutes: number
  price: number
  currency: 'BRL'
  vendor_id: string
  availability: CalendarSlot[]
  booking_buffer: number // minutes between sessions
  max_bookings_per_day: number
  commission_rate: number
  metadata: {
    meeting_platform: 'zoom' | 'google_meet' | 'teams'
    preparation_required: boolean
    cancellation_policy: string
  }
}
```

### Vendor
```typescript
{
  id: string
  user_id: string
  business_name: string
  type: 'individual' | 'company'
  status: 'pending' | 'approved' | 'suspended'
  commission_rate: number // default rate
  payout_method: 'bank_transfer' | 'pix'
  payout_schedule: 'weekly' | 'monthly'
  verification: {
    identity_verified: boolean
    tax_id: string
    bank_account_verified: boolean
  }
  stats: {
    total_sales: number
    total_earnings: number
    pending_payout: number
    rating: number
    review_count: number
  }
}
```

### Order
```typescript
{
  id: string
  customer_id: string
  items: OrderItem[]
  subtotal: number
  commission_total: number
  vendor_earnings: number
  payment_status: 'pending' | 'paid' | 'refunded'
  fulfillment_status: 'pending' | 'delivered' | 'cancelled'
  metadata: {
    customer_type: 'b2c' | 'b2b'
    institution_id?: string
  }
}
```

### Booking
```typescript
{
  id: string
  service_id: string
  customer_id: string
  vendor_id: string
  scheduled_date: string
  scheduled_time: string
  duration_minutes: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  payment_status: 'pending' | 'held' | 'released' | 'refunded'
  meeting_link?: string
  notes: string
  rating?: number
  review?: string
}
```

---

## Revenue Model

### Commission Structure

#### Digital Products
- **Olcan Products**: 100% to Olcan
- **Partner Products**: 70% to vendor, 30% to Olcan

#### Services
- **Olcan Coaches**: 100% to Olcan
- **Partner Coaches**: 75% to vendor, 25% to Olcan
- **Premium Partners**: 80% to vendor, 20% to Olcan (negotiated)

### Payout Flow
1. Customer pays → Funds held in escrow
2. Service delivered / Product downloaded → Escrow released
3. Commission calculated and split
4. Vendor earnings accumulated
5. Payout requested by vendor (min R$ 100)
6. Admin approves payout
7. Bank transfer / PIX processed

---

## Integration Points

### V2.5 App Integration
```typescript
// apps/app-compass-v2.5/src/lib/marketplace-client.ts
import { createClient } from '@mercurjs/client'

export const marketplaceClient = createClient({
  baseUrl: process.env.NEXT_PUBLIC_MARKETPLACE_API_URL,
  apiKey: process.env.MARKETPLACE_API_KEY
})

// Usage in components
const products = await marketplaceClient.products.list()
const booking = await marketplaceClient.bookings.create(bookingData)
```

### Website Integration
```typescript
// apps/site-marketing-v2.5/src/lib/store-api.ts
// Public-facing store API (no auth required for browsing)
export async function getProducts() {
  return fetch(`${MARKETPLACE_API}/store/products`)
}

export async function getProduct(slug: string) {
  return fetch(`${MARKETPLACE_API}/store/products/${slug}`)
}
```

---

## Security & Compliance

### Payment Processing
- **Stripe Connect**: For vendor payouts
- **PIX Integration**: Brazilian instant payment
- **PCI Compliance**: No card data stored locally

### Data Protection
- **LGPD Compliance**: Brazilian data protection law
- **User Consent**: Explicit consent for data processing
- **Data Retention**: Configurable retention policies

### Vendor Verification
- **Identity Verification**: CPF/CNPJ validation
- **Background Check**: For coaches/mentors
- **Service Quality**: Rating system + admin review

---

## Deployment Strategy

### Phase 1: Foundation (Week 1-2)
- [ ] Set up MedusaJS backend
- [ ] Install Mercur core blocks (seller, commission, payout)
- [ ] Create custom product modules
- [ ] Database schema migration

### Phase 2: Core Features (Week 3-4)
- [ ] Digital product delivery workflow
- [ ] Service booking system
- [ ] Payment integration (Stripe)
- [ ] Vendor portal basics

### Phase 3: Integration (Week 5-6)
- [ ] V2.5 app marketplace pages
- [ ] Website public store
- [ ] Admin dashboard enhancements
- [ ] Testing & QA

### Phase 4: Launch (Week 7-8)
- [ ] Seed initial products (Kit Application)
- [ ] Onboard first vendors
- [ ] Marketing pages
- [ ] Production deployment

---

## Success Metrics

### Business KPIs
- **GMV (Gross Merchandise Value)**: Total sales volume
- **Active Vendors**: Number of selling vendors
- **Conversion Rate**: Visitors → Buyers
- **Average Order Value**: Per transaction
- **Vendor Retention**: Monthly active vendors

### Technical KPIs
- **API Response Time**: < 200ms p95
- **Uptime**: 99.9%
- **Payment Success Rate**: > 98%
- **Digital Delivery Time**: < 30 seconds

---

## Future Enhancements

### Web3 Integration (Phase 2)
- NFT-based certificates for courses
- Crypto payment options
- Decentralized identity verification
- Smart contract escrow

### Advanced Features
- Subscription products (recurring revenue)
- Bundle deals (Kit + Coaching)
- Affiliate program
- Marketplace analytics dashboard
- AI-powered product recommendations

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Backend Framework | MedusaJS v2 |
| Marketplace Platform | Mercur |
| Database | PostgreSQL |
| Cache | Redis |
| File Storage | S3-compatible (Cloudflare R2) |
| Payments | Stripe Connect |
| Email | Resend |
| Frontend (App) | Next.js 14 + React |
| Frontend (Website) | Next.js 14 + React |
| API Client | @mercurjs/client |
| Deployment | Docker + Railway/Render |

---

## Repository Structure

```
olcan-compass/
├── apps/
│   ├── marketplace-api/        # NEW: MedusaJS backend
│   ├── app-compass-v2.5/       # Enhanced with marketplace
│   └── site-marketing-v2.5/    # Enhanced with public store
├── packages/
│   └── marketplace-types/      # NEW: Shared types
├── mercur/                     # Reference implementation
└── docs/
    └── marketplace/            # This documentation
```

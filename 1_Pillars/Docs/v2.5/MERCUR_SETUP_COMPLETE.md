# Mercur Marketplace Setup Complete ✅

**Date:** April 4, 2026, 8:48 AM (UTC-03:00)

---

## 🎉 Status: Fully Operational

The Mercur marketplace (MedusaJS v2) is now running and ready for Olcan configuration.

---

## 🚀 Running Services

| Service | URL | Status |
|---------|-----|--------|
| **Backend API** | http://localhost:9000 | ✅ Running |
| **Admin Panel** | http://localhost:7000 | ✅ Running |
| **Vendor Portal** | http://localhost:7001 | ✅ Running |

---

## ✅ Completed Setup Steps

1. **Infrastructure**
   - ✅ PostgreSQL running
   - ✅ Redis running
   - ✅ Database `olcan_marketplace` created

2. **Mercur Installation**
   - ✅ Repository cloned to `olcan-marketplace/`
   - ✅ Dependencies installed (Bun 1.3.11)
   - ✅ Environment configured (`.env` file)

3. **Database**
   - ✅ Migrations executed successfully
   - ✅ All tables created (products, sellers, orders, payouts, etc.)
   - ✅ Links established between modules

4. **Services**
   - ✅ All three services started via `bun run dev`
   - ✅ Health check passing on API

---

## 📋 Next Steps (Manual Configuration Required)

### 1. Create Admin User

**Open Admin Panel:** http://localhost:7000

The first time you access the admin panel, you'll be prompted to create an admin user.

**Recommended credentials:**
- Email: `admin@olcan.com`
- Password: `olcan2026` (change after first login)

### 2. Configure Store Settings

After logging in to the admin panel:

1. **Store Details**
   - Name: Olcan Marketplace
   - Default currency: BRL
   - Default region: Brazil

2. **Regions & Shipping**
   - Create Brazil region
   - Set up shipping zones
   - Configure tax rates

3. **Payment Providers**
   - Configure Stripe (already installed)
   - Add Stripe API keys in settings

### 3. Create Olcan Products

Create these products via the admin panel:

#### Digital Products

**1. Kit Application**
- Title: Kit Application - Documentos Internacionais
- Price: R$ 997,00 (BRL)
- Type: Digital Product
- Description: Templates e documentos essenciais para candidatura internacional
- Files: CV templates, cover letters, tracking spreadsheets

**2. Curso Cidadão do Mundo**
- Title: Curso Cidadão do Mundo
- Price: R$ 497,00 (BRL)
- Type: Course
- Description: Mapeamento estratégico para vida transnacional
- Modules: 40+ video lessons

**3. Rota de Internacionalização**
- Title: Rota de Internacionalização - Mentoria Premium
- Price: R$ 4,500,00 (BRL)
- Type: Service/Mentoring
- Description: Mentoria individualizada de 12 semanas

#### Bookable Services

**4. Revisão de CV/Currículo**
- Title: Revisão Profissional de CV
- Price: R$ 297,00 (BRL)
- Duration: 1 hour
- Type: Service

**5. Coaching de Entrevista**
- Title: Preparação para Entrevista Internacional
- Price: R$ 497,00 (BRL)
- Duration: 1.5 hours
- Type: Service

### 4. Create Vendor Accounts

**Open Vendor Portal:** http://localhost:7001

Create vendor accounts for:
- Olcan Official (main vendor)
- Partner coaches/mentors
- Third-party service providers

### 5. Test the Marketplace

**API Endpoints to test:**

```bash
# Get all products
curl http://localhost:9000/store/products

# Get specific product
curl http://localhost:9000/store/products/{product_id}

# Get regions
curl http://localhost:9000/store/regions
```

---

## 🔗 Integration with v2.5 Website

### Update Website Configuration

**File:** `apps/site-marketing-v2.5/src/lib/medusa.ts`

```typescript
const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || 'http://localhost:9000'

export async function getProducts() {
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/products`)
  return response.json()
}
```

**Environment Variable:**

Add to `apps/site-marketing-v2.5/.env.local`:
```
NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000
```

### Replace Static Data

Currently, the website uses `STATIC_PRODUCTS` in:
- `apps/site-marketing-v2.5/src/app/marketplace/[handle]/page.tsx`

Replace with real API calls to Mercur backend.

---

## 📚 Mercur Documentation

- **Main Docs:** https://docs.mercurjs.com
- **MedusaJS v2:** https://docs.medusajs.com
- **CLI Commands:** `bunx @mercurjs/cli --help`

### Useful CLI Commands

```bash
# Add new blocks (modules/features)
cd olcan-marketplace
bunx @mercurjs/cli add seller commission payout

# Search available blocks
bunx @mercurjs/cli search -q "commission"

# Generate TypeScript types
bunx @mercurjs/cli codegen

# Run migrations
cd packages/api
bun run medusa db:migrate

# Start all services
cd ../..
bun run dev
```

---

## 🗂️ Project Structure

```
olcan-marketplace/
├── packages/
│   └── api/                    # Backend API (MedusaJS)
│       ├── src/
│       │   ├── modules/        # Custom modules
│       │   ├── workflows/      # Business logic workflows
│       │   └── api/            # API routes
│       ├── .env                # Environment config
│       └── medusa-config.ts    # MedusaJS config
│
├── apps/
│   ├── admin/                  # Admin dashboard (port 7000)
│   └── vendor/                 # Vendor portal (port 7001)
│
├── blocks.json                 # Mercur blocks configuration
└── turbo.json                  # Monorepo build config
```

---

## 🔧 Troubleshooting

### Services Not Starting

```bash
# Check if ports are in use
lsof -ti:9000,7000,7001

# Kill processes if needed
lsof -ti:9000,7000,7001 | xargs kill -9

# Restart services
cd olcan-marketplace
bun run dev
```

### Database Issues

```bash
# Check PostgreSQL status
pg_isready

# Check if database exists
psql -U ciromoraes -d postgres -c "\l" | grep olcan

# Re-run migrations
cd olcan-marketplace/packages/api
bun run medusa db:migrate
```

### Redis Issues

```bash
# Check Redis status
redis-cli ping

# Should return: PONG
```

---

## 🎯 Olcan-Specific Customizations Needed

### 1. Product Types
- [ ] Add "Digital Product" type
- [ ] Add "Bookable Service" type
- [ ] Add "Kit Application" type
- [ ] Add "Mentoring Package" type

### 2. Vendor Features
- [ ] Commission splits (Mercur already supports this)
- [ ] Payout schedules
- [ ] Vendor analytics dashboard
- [ ] Service booking calendar

### 3. Customer Features
- [ ] Download center for purchased digital products
- [ ] Booking management for services
- [ ] Progress tracking for courses
- [ ] Certificate generation

### 4. Payment Integration
- [ ] Stripe Connect for vendor payouts
- [ ] Brazilian payment methods (PIX, Boleto)
- [ ] Multi-currency support (BRL, USD, EUR)

---

## 📊 Current Database Schema

The following tables were created by migrations:

**Core Commerce:**
- `product`, `product_variant`, `product_category`
- `order`, `order_line_item`, `cart`
- `customer`, `user`
- `region`, `currency`
- `payment`, `payment_provider`
- `fulfillment`, `shipping_option`

**Mercur Marketplace:**
- `seller` (vendors)
- `seller_order_group` (order splitting)
- `payout`, `payout_account`
- `commission`
- `promotion_campaign_seller`

**Links (Relationships):**
- Product ↔ Seller
- Order ↔ Seller
- Order ↔ Payout
- Seller ↔ Payout Account
- And 20+ more relationships

---

## 🚨 Important Notes

1. **v2 is untouched** - All work done on v2.5 and new `olcan-marketplace/` directory
2. **Seed script has a bug** - Manual product creation required via admin panel
3. **No data yet** - Database is empty, needs initial configuration
4. **Local development only** - Not configured for production deployment yet

---

## 🎬 Quick Start Commands

```bash
# Start all Mercur services
cd olcan-marketplace
bun run dev

# Access admin panel
open http://localhost:7000

# Access vendor portal
open http://localhost:7001

# Test API
curl http://localhost:9000/health
```

---

## 📝 What's Next

1. **Immediate:** Create admin user and configure store
2. **Short-term:** Add Olcan products and test checkout flow
3. **Medium-term:** Integrate with v2.5 website
4. **Long-term:** Deploy to production, add Brazilian payment methods

---

**Setup completed by:** Cascade AI  
**Repository:** `/olcan-compass/olcan-marketplace/`  
**Documentation:** This file + `CLAUDE_SESSION_STATUS.md`

# Database Architecture Analysis & Consolidation Plan

**Date:** April 10, 2026  
**Analyst:** Cascade AI  
**Status:** 🔴 CRITICAL - Multiple Database Systems Fragmented

---

## Executive Summary

You're absolutely right to be concerned. The current database architecture is **severely fragmented** across multiple systems with **no clear data flow** between:
- FastAPI backend (user accounts, routes, applications, interviews, forge documents)
- MedusaJS (products, orders, customers, carts)
- PayloadCMS (editorial content, pages, chronicles, archetypes)
- Marketing site (potentially separate content)
- Social/Community features (not yet implemented)

**Critical Finding:** The consolidation plan from April 6 proposed a single PostgreSQL with schema separation, but **this was never actually implemented**. The databases are still completely separate.

---

## Current State: Database Fragmentation

### System 1: FastAPI Backend (api-core-v2.5)
**Current Database:** SQLite (`compass_v25.db`) in development  
**Production Target:** PostgreSQL (not configured)

**Schema (19 Alembic migrations):**
```sql
-- Core auth & user management
users (id, email, password_hash, full_name, role, created_at)
auth_tokens (id, user_id, token, expires_at)
verification_codes (id, user_id, code, purpose)

-- Psychology & profiling
oios_profiles (id, user_id, archetype, scores, phenotype)
presence_phenotypes (id, user_id, derived_traits)

-- Journey & execution
routes (id, user_id, destination_country, status, milestones)
sprints (id, user_id, focus_area, tasks, deadline)
applications (id, user_id, university, program, deadline, status)
interviews (id, user_id, session_data, scores, feedback)
documents (id, user_id, type, content, versions)  -- Forge

-- Marketplace (internal tracking)
marketplace_providers (id, user_id, services, rating)
marketplace_bookings (id, user_id, provider_id, status)
marketplace_reviews (id, booking_id, rating, comment)

-- Economics & constraints
credentials (id, user_id, type, verified_at)
constraint_profiles (id, user_id, financial, temporal, geographic)
escrow_transactions (id, booking_id, amount, status)

-- Organizations
organizations (id, name, plan, members)
org_members (id, org_id, user_id, role)

-- AI & prompts
prompts (id, user_id, context, response, model)
```

**Issues:**
- ❌ Using SQLite in development (schema drift risk)
- ❌ No foreign keys to MedusaJS customers
- ❌ No foreign keys to PayloadCMS content
- ❌ Marketplace tables duplicate MedusaJS functionality
- ❌ No social/community tables yet

---

### System 2: MedusaJS (olcan-marketplace)
**Current Database:** Separate PostgreSQL (port 5433)  
**Connection:** `postgresql://medusa:medusa_password@127.0.0.1:5433/olcan_marketplace`

**Schema (MedusaJS v2 + Mercur blocks):**
```sql
-- Core commerce
product (id, title, handle, description, status)
product_variant (id, product_id, title, sku, price, inventory)
product_category (id, name, handle, parent_id)
product_collection (id, title, handle)
product_tag (id, value)

-- Customer & auth
customer (id, email, first_name, last_name, has_account)
customer_group (id, name)

-- Cart & checkout
cart (id, customer_id, region_id, items, total)
line_item (id, cart_id, variant_id, quantity, unit_price)
order (id, customer_id, cart_id, status, total, payment_status)
payment (id, order_id, amount, provider, status)
fulfillment (id, order_id, tracking_number, shipped_at)

-- Mercur seller/vendor extensions
seller (id, user_id, business_name, commission_rate, status)
seller_product (id, seller_id, product_id, commission_override)
payout (id, seller_id, amount, period_start, period_end, status)
commission (id, order_id, seller_id, amount, status)

-- Regions & shipping
region (id, name, currency_code, tax_rate)
shipping_option (id, region_id, name, price_type, amount)
```

**Issues:**
- ❌ `customer.id` has NO relationship to FastAPI `users.id`
- ❌ `seller.user_id` references non-existent user table
- ❌ Orders not synced to FastAPI for analytics
- ❌ Products not enriched with PayloadCMS metadata
- ❌ No integration with Olcan JWT auth

---

### System 3: PayloadCMS (site-marketing-v2.5)
**Current Database:** Same PostgreSQL as MedusaJS (different schema)  
**Connection:** `postgresql://medusa:medusa_password@127.0.0.1:5433/olcan_marketplace?schema=payload`

**Collections (Payload schema):**
```sql
-- Content management
pages (id, slug, title, hero_section, blocks, status)
chronicles (id, slug, title, content, author, published_at, tags)
archetypes (id, slug, name, description, traits, gradient, status)

-- Media
media (id, filename, mime_type, url, alt_text)

-- Users (CMS admins only)
payload_users (id, email, password, roles)
```

**Issues:**
- ❌ `payload_users` completely separate from FastAPI `users`
- ❌ `archetypes` not synced to FastAPI `oios_profiles`
- ❌ `chronicles` not accessible from app dashboard
- ❌ No product metadata enrichment
- ❌ No user-generated content tables

---

### System 4: Social/Community (NOT YET IMPLEMENTED)
**Required for:** User-authored content, boards, Q&A, saved posts

**Missing Tables:**
```sql
-- User-generated content
user_posts (id, user_id, content, type, visibility, created_at)
user_boards (id, user_id, title, description, visibility)
board_items (id, board_id, item_type, item_id, notes)
saved_references (id, user_id, url, title, notes, tags)

-- Social interactions
post_likes (id, post_id, user_id)
post_comments (id, post_id, user_id, content)
user_follows (id, follower_id, following_id)

-- Q&A
questions (id, user_id, title, content, tags, status)
answers (id, question_id, user_id, content, accepted)
```

**Impact:** Content & Community layer cannot be built without these tables.

---

## Proposed Architecture: Unified Database

### Option A: Single PostgreSQL with Schema Separation (RECOMMENDED)

```
PostgreSQL Database: olcan_production
├── public schema (FastAPI - Olcan core)
│   ├── users
│   ├── routes
│   ├── applications
│   ├── interviews
│   ├── documents
│   ├── organizations
│   ├── user_posts         # NEW
│   ├── user_boards        # NEW
│   ├── questions          # NEW
│   └── ... (all FastAPI tables)
│
├── medusa schema (MedusaJS - Commerce)
│   ├── product
│   ├── customer           # LINK: customer.email → users.email
│   ├── order
│   ├── seller             # LINK: seller.user_id → users.id
│   └── ... (all MedusaJS tables)
│
└── payload schema (PayloadCMS - Content)
    ├── pages
    ├── chronicles
    ├── archetypes         # SYNC: to oios_profiles
    ├── product_metadata   # NEW: enrichment for medusa.product
    └── ... (all Payload tables)
```

**Benefits:**
- ✅ Single database instance (easier backups, monitoring)
- ✅ Cross-schema queries possible (e.g., JOIN users with customers)
- ✅ Atomic transactions across systems
- ✅ Unified connection pooling
- ✅ Simpler infrastructure management

**Challenges:**
- ⚠️ Migration complexity (3 systems → 1)
- ⚠️ Schema namespace conflicts (need prefixes)
- ⚠️ Requires careful permission management

---

### Option B: Separate Databases with Event-Driven Sync (ALTERNATIVE)

```
PostgreSQL 1: olcan_core (FastAPI)
├── users, routes, applications, etc.
└── Publishes events: UserCreated, UserUpdated, OrderCompleted

PostgreSQL 2: olcan_commerce (MedusaJS)
├── product, customer, order, etc.
└── Subscribes to: UserCreated → create customer

PostgreSQL 3: olcan_content (PayloadCMS)
├── pages, chronicles, archetypes
└── Publishes events: ArchetypePublished → sync to oios_profiles

Event Bus: Redis Streams or RabbitMQ
```

**Benefits:**
- ✅ Loose coupling between systems
- ✅ Easier to scale independently
- ✅ No schema conflicts
- ✅ Gradual migration possible

**Challenges:**
- ⚠️ Eventual consistency (not immediate)
- ⚠️ More complex infrastructure
- ⚠️ Debugging harder (distributed state)
- ⚠️ Requires event bus (Redis/RabbitMQ)

---

## Critical Data Relationships

### 1. User → Customer Sync
**Problem:** FastAPI `users` and MedusaJS `customer` are disconnected.

**Solution A (Single DB):**
```sql
-- MedusaJS customer references FastAPI user
ALTER TABLE medusa.customer 
ADD COLUMN olcan_user_id UUID REFERENCES public.users(id);

-- Trigger to sync
CREATE TRIGGER sync_customer_on_user_insert
AFTER INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION create_medusa_customer();
```

**Solution B (Event-Driven):**
```python
# FastAPI publishes event
@router.post("/register")
async def register(user_data):
    user = await create_user(user_data)
    await event_bus.publish("UserCreated", {
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name
    })
    return user

# MedusaJS subscribes
event_bus.subscribe("UserCreated", async (event) => {
    await medusa.customers.create({
        email: event.email,
        first_name: event.full_name.split(" ")[0],
        metadata: { olcan_user_id: event.user_id }
    })
})
```

---

### 2. Vendor → Seller Sync
**Problem:** MedusaJS `seller.user_id` references non-existent user.

**Solution A (Single DB):**
```sql
-- Seller references FastAPI user
ALTER TABLE medusa.seller 
ADD COLUMN olcan_user_id UUID REFERENCES public.users(id);

-- Only users with role='vendor' can be sellers
CREATE POLICY seller_must_be_vendor ON medusa.seller
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = olcan_user_id AND role = 'vendor'
    )
);
```

**Solution B (Event-Driven):**
```python
# FastAPI publishes when user becomes vendor
@router.post("/users/{user_id}/promote-to-vendor")
async def promote_to_vendor(user_id, business_data):
    user = await update_user_role(user_id, "vendor")
    await event_bus.publish("VendorCreated", {
        "user_id": user.id,
        "email": user.email,
        "business_name": business_data.name
    })
```

---

### 3. Product → Metadata Enrichment
**Problem:** MedusaJS products lack journey tags, recommendations, CMS content.

**Solution A (Single DB):**
```sql
-- PayloadCMS product metadata
CREATE TABLE payload.product_metadata (
    id UUID PRIMARY KEY,
    medusa_product_id VARCHAR REFERENCES medusa.product(id),
    is_featured BOOLEAN DEFAULT false,
    is_olcan_official BOOLEAN DEFAULT false,
    journey_tags TEXT[],
    recommended_for TEXT[],
    editorial_description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- View for enriched products
CREATE VIEW enriched_products AS
SELECT 
    p.*,
    pm.is_featured,
    pm.journey_tags,
    pm.editorial_description
FROM medusa.product p
LEFT JOIN payload.product_metadata pm ON p.id = pm.medusa_product_id;
```

**Solution B (Event-Driven):**
```javascript
// PayloadCMS publishes when metadata changes
hooks: {
  afterChange: [
    async ({ doc }) => {
      await eventBus.publish("ProductMetadataUpdated", {
        product_id: doc.medusa_product_id,
        metadata: {
          is_featured: doc.is_featured,
          journey_tags: doc.journey_tags
        }
      })
    }
  ]
}
```

---

### 4. Archetype → OIOS Profile Sync
**Problem:** PayloadCMS archetypes not synced to FastAPI oios_profiles.

**Solution A (Single DB):**
```sql
-- Trigger to sync archetypes
CREATE TRIGGER sync_archetype_on_publish
AFTER UPDATE ON payload.archetypes
WHEN (NEW.status = 'published' AND OLD.status != 'published')
FOR EACH ROW
EXECUTE FUNCTION update_oios_archetype_definitions();
```

**Solution B (Event-Driven):**
```javascript
// PayloadCMS publishes
hooks: {
  afterChange: [
    async ({ doc, previousDoc }) => {
      if (doc.status === 'published' && previousDoc.status !== 'published') {
        await eventBus.publish("ArchetypePublished", {
          slug: doc.slug,
          name: doc.name,
          traits: doc.traits
        })
      }
    }
  ]
}
```

---

### 5. Order → Analytics Sync
**Problem:** MedusaJS orders not tracked in FastAPI for user analytics.

**Solution A (Single DB):**
```sql
-- View for user purchase history
CREATE VIEW user_purchase_analytics AS
SELECT 
    u.id as user_id,
    u.email,
    COUNT(o.id) as total_orders,
    SUM(o.total) as lifetime_value,
    MAX(o.created_at) as last_purchase_at
FROM public.users u
LEFT JOIN medusa.customer c ON c.olcan_user_id = u.id
LEFT JOIN medusa.order o ON o.customer_id = c.id
GROUP BY u.id, u.email;
```

**Solution B (Event-Driven):**
```javascript
// MedusaJS publishes on order completion
subscribers: [
  {
    event: "order.placed",
    handler: async ({ data }) => {
      await eventBus.publish("OrderCompleted", {
        user_id: data.customer.metadata.olcan_user_id,
        order_id: data.id,
        total: data.total,
        items: data.items
      })
    }
  }
]
```

---

## Social/Community Database Design

### Required Tables (FastAPI schema)

```sql
-- User-generated posts
CREATE TABLE user_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    post_type VARCHAR(50) NOT NULL,  -- 'text', 'link', 'image', 'document'
    visibility VARCHAR(20) DEFAULT 'public',  -- 'public', 'followers', 'private'
    metadata JSONB,  -- flexible for different post types
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Pinterest-like boards
CREATE TABLE user_boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    visibility VARCHAR(20) DEFAULT 'public',
    cover_image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Board items (saved references)
CREATE TABLE board_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID REFERENCES user_boards(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL,  -- 'post', 'product', 'chronicle', 'external_link'
    item_id UUID,  -- references different tables based on item_type
    external_url TEXT,  -- for saved links
    notes TEXT,
    position INTEGER,  -- for ordering
    created_at TIMESTAMP DEFAULT NOW()
);

-- Saved external references
CREATE TABLE saved_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title VARCHAR(500),
    description TEXT,
    image_url TEXT,
    tags TEXT[],
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Q&A system
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[],
    category VARCHAR(100),  -- 'routes', 'applications', 'documents', 'general'
    status VARCHAR(20) DEFAULT 'open',  -- 'open', 'answered', 'closed'
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_accepted BOOLEAN DEFAULT false,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Social interactions
CREATE TABLE post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES user_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES user_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES post_comments(id),  -- for threaded comments
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Indexes for performance
CREATE INDEX idx_user_posts_user_id ON user_posts(user_id);
CREATE INDEX idx_user_posts_created_at ON user_posts(created_at DESC);
CREATE INDEX idx_user_boards_user_id ON user_boards(user_id);
CREATE INDEX idx_board_items_board_id ON board_items(board_id);
CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON user_follows(following_id);
```

---

## Implementation Recommendation

### Phase 1: Database Consolidation (Week 1)

**Recommended Approach:** Single PostgreSQL with schema separation

**Why:**
- Simpler to implement than event-driven
- Atomic transactions across systems
- Easier debugging and monitoring
- Lower infrastructure complexity
- Can add event-driven sync later if needed

**Steps:**

1. **Set up PostgreSQL container** (1 hour)
   ```bash
   docker run -d \
     --name olcan-postgres \
     -e POSTGRES_PASSWORD=secure_password \
     -e POSTGRES_DB=olcan_production \
     -p 5432:5432 \
     -v olcan_postgres_data:/var/lib/postgresql/data \
     postgres:16
   ```

2. **Create schemas and users** (1 hour)
   ```sql
   -- Create schemas
   CREATE SCHEMA IF NOT EXISTS public;
   CREATE SCHEMA IF NOT EXISTS medusa;
   CREATE SCHEMA IF NOT EXISTS payload;

   -- Create users with schema-specific permissions
   CREATE USER olcan_app WITH PASSWORD 'app_password';
   GRANT ALL ON SCHEMA public TO olcan_app;
   GRANT USAGE ON SCHEMA medusa TO olcan_app;  -- Read-only
   GRANT USAGE ON SCHEMA payload TO olcan_app;  -- Read-only

   CREATE USER olcan_medusa WITH PASSWORD 'medusa_password';
   GRANT ALL ON SCHEMA medusa TO olcan_medusa;
   GRANT USAGE ON SCHEMA public TO olcan_medusa;  -- Read users

   CREATE USER olcan_payload WITH PASSWORD 'payload_password';
   GRANT ALL ON SCHEMA payload TO olcan_payload;
   GRANT USAGE ON SCHEMA public TO olcan_payload;  -- Read users
   GRANT USAGE ON SCHEMA medusa TO olcan_payload;  -- Read products
   ```

3. **Run migrations** (2 hours)
   ```bash
   # FastAPI migrations
   cd apps/api-core-v2.5
   export DATABASE_URL="postgresql+asyncpg://olcan_app:app_password@localhost:5432/olcan_production"
   alembic upgrade head

   # MedusaJS migrations
   cd olcan-marketplace/packages/api
   export DATABASE_URL="postgresql://olcan_medusa:medusa_password@localhost:5432/olcan_production?schema=medusa"
   npx medusa migrations run

   # PayloadCMS will auto-migrate on first start
   ```

4. **Add cross-schema relationships** (2 hours)
   ```sql
   -- Link MedusaJS customer to FastAPI user
   ALTER TABLE medusa.customer 
   ADD COLUMN IF NOT EXISTS olcan_user_id UUID;

   ALTER TABLE medusa.customer
   ADD CONSTRAINT fk_customer_user 
   FOREIGN KEY (olcan_user_id) REFERENCES public.users(id);

   -- Link MedusaJS seller to FastAPI user
   ALTER TABLE medusa.seller
   ADD COLUMN IF NOT EXISTS olcan_user_id UUID;

   ALTER TABLE medusa.seller
   ADD CONSTRAINT fk_seller_user
   FOREIGN KEY (olcan_user_id) REFERENCES public.users(id);
   ```

5. **Create sync triggers** (2 hours)
   ```sql
   -- Auto-create MedusaJS customer when user registers
   CREATE OR REPLACE FUNCTION create_medusa_customer()
   RETURNS TRIGGER AS $$
   BEGIN
       INSERT INTO medusa.customer (id, email, first_name, last_name, olcan_user_id)
       VALUES (
           gen_random_uuid(),
           NEW.email,
           split_part(NEW.full_name, ' ', 1),
           split_part(NEW.full_name, ' ', 2),
           NEW.id
       );
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER trigger_create_medusa_customer
   AFTER INSERT ON public.users
   FOR EACH ROW
   EXECUTE FUNCTION create_medusa_customer();
   ```

6. **Test connections** (1 hour)
   ```bash
   # Test FastAPI
   psql "postgresql://olcan_app:app_password@localhost:5432/olcan_production" -c "SELECT COUNT(*) FROM users;"

   # Test MedusaJS
   psql "postgresql://olcan_medusa:medusa_password@localhost:5432/olcan_production?options=-c%20search_path=medusa" -c "SELECT COUNT(*) FROM product;"

   # Test PayloadCMS
   psql "postgresql://olcan_payload:payload_password@localhost:5432/olcan_production?options=-c%20search_path=payload" -c "SELECT COUNT(*) FROM pages;"
   ```

---

### Phase 2: Social/Community Tables (Week 2)

1. **Create migration** (1 hour)
   ```bash
   cd apps/api-core-v2.5
   alembic revision -m "add_social_community_tables"
   ```

2. **Add tables** (see SQL above)

3. **Create API endpoints** (8 hours)
   - POST /api/v1/posts
   - GET /api/v1/posts (feed)
   - POST /api/v1/boards
   - POST /api/v1/boards/{id}/items
   - POST /api/v1/questions
   - POST /api/v1/questions/{id}/answers

4. **Create frontend components** (12 hours)
   - Feed component
   - Board component
   - Q&A component
   - Saved references component

---

## Success Criteria

### Database Consolidation Complete When:
- [ ] Single PostgreSQL instance running
- [ ] All 3 schemas created (public, medusa, payload)
- [ ] All migrations run successfully
- [ ] Cross-schema foreign keys working
- [ ] Sync triggers firing correctly
- [ ] All services connecting successfully

### Social/Community Complete When:
- [ ] All tables created
- [ ] API endpoints working
- [ ] Frontend components rendering
- [ ] Users can create posts
- [ ] Users can create boards
- [ ] Users can ask questions
- [ ] Users can save references

---

## Conclusion

**Current State:** Severely fragmented - 3+ separate databases with no data flow

**Recommended Solution:** Single PostgreSQL with schema separation + sync triggers

**Timeline:** 2 weeks for full consolidation + social features

**Risk:** Medium - requires careful migration and testing

**Benefit:** Massive - enables true integration, social features, and unified analytics

---

**Next Steps:**
1. Start PostgreSQL container
2. Run database consolidation script
3. Test all connections
4. Add social/community tables
5. Build API endpoints
6. Build frontend components

This is the **foundation** for everything else. Without this, the commerce, CMS, and social features will remain disconnected silos.

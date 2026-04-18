-- SCALABILITY HARDENING — Medusa Commerce Schema
-- Adds missing tables for a real marketplace to function at scale

-- 1. Product categories (taxonomy/filtering)
CREATE TABLE IF NOT EXISTS medusa.product_category (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    handle VARCHAR(255) UNIQUE,
    description TEXT,
    parent_category_id UUID REFERENCES medusa.product_category(id) ON DELETE SET NULL,
    rank INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pc_handle ON medusa.product_category(handle);
CREATE INDEX IF NOT EXISTS idx_pc_parent ON medusa.product_category(parent_category_id);

-- 2. Product ↔ Category M2M
CREATE TABLE IF NOT EXISTS medusa.product_category_product (
    product_id UUID NOT NULL REFERENCES medusa.product(id) ON DELETE CASCADE,
    product_category_id UUID NOT NULL REFERENCES medusa.product_category(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, product_category_id)
);

-- 3. Product collections (curated groups)
CREATE TABLE IF NOT EXISTS medusa.product_collection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    handle VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Product images
CREATE TABLE IF NOT EXISTS medusa.product_image (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES medusa.product(id) ON DELETE CASCADE,
    url VARCHAR(1000) NOT NULL,
    rank INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pi_product ON medusa.product_image(product_id);

-- 5. Product tags
CREATE TABLE IF NOT EXISTS medusa.product_tag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS medusa.product_tag_product (
    product_id UUID NOT NULL REFERENCES medusa.product(id) ON DELETE CASCADE,
    product_tag_id UUID NOT NULL REFERENCES medusa.product_tag(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, product_tag_id)
);

-- 6. Line items (cart/order items)
CREATE TABLE IF NOT EXISTS medusa.line_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES medusa.cart(id) ON DELETE CASCADE,
    order_id UUID REFERENCES medusa."order"(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES medusa.product_variant(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_li_cart ON medusa.line_item(cart_id);
CREATE INDEX IF NOT EXISTS idx_li_order ON medusa.line_item(order_id);

-- 7. Payments
CREATE TABLE IF NOT EXISTS medusa.payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES medusa."order"(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'BRL',
    provider_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pay_order ON medusa.payment(order_id);
CREATE INDEX IF NOT EXISTS idx_pay_status ON medusa.payment(status);

-- 8. Seller (Mercur marketplace vendor)
CREATE TABLE IF NOT EXISTS medusa.seller (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    olcan_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    business_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    photo VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_seller_olcan ON medusa.seller(olcan_user_id);
CREATE INDEX IF NOT EXISTS idx_seller_status ON medusa.seller(status);

-- 9. Seller ↔ Product
CREATE TABLE IF NOT EXISTS medusa.seller_product (
    seller_id UUID NOT NULL REFERENCES medusa.seller(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES medusa.product(id) ON DELETE CASCADE,
    PRIMARY KEY (seller_id, product_id)
);

-- 10. Commissions
CREATE TABLE IF NOT EXISTS medusa.commission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES medusa."order"(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES medusa.seller(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    rate NUMERIC(5,4) NOT NULL DEFAULT 0.15,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comm_seller ON medusa.commission(seller_id);
CREATE INDEX IF NOT EXISTS idx_comm_status ON medusa.commission(status);

-- 11. Payouts
CREATE TABLE IF NOT EXISTS medusa.payout (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES medusa.seller(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_po_seller ON medusa.payout(seller_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON medusa.payout(status);

-- 12. Extend existing tables
ALTER TABLE medusa.product ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES medusa.product_collection(id) ON DELETE SET NULL;
ALTER TABLE medusa.product ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE medusa.product ADD COLUMN IF NOT EXISTS external_id VARCHAR(255);
ALTER TABLE medusa.product ADD COLUMN IF NOT EXISTS discountable BOOLEAN DEFAULT true;
ALTER TABLE medusa.product_variant ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE medusa.customer ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE medusa.customer ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE medusa."order" ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'not_paid';
ALTER TABLE medusa."order" ADD COLUMN IF NOT EXISTS fulfillment_status VARCHAR(50) DEFAULT 'not_fulfilled';
ALTER TABLE medusa."order" ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE medusa."order" ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES medusa.seller(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_prod_collection ON medusa.product(collection_id);
CREATE INDEX IF NOT EXISTS idx_order_seller ON medusa."order"(seller_id);

-- Permissions
GRANT ALL ON ALL TABLES IN SCHEMA medusa TO olcan_medusa;
GRANT ALL ON ALL SEQUENCES IN SCHEMA medusa TO olcan_medusa;
GRANT SELECT ON ALL TABLES IN SCHEMA medusa TO olcan_app;
GRANT SELECT ON ALL TABLES IN SCHEMA medusa TO olcan_payload;

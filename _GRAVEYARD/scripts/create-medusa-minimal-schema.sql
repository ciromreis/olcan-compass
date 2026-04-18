-- Minimal MedusaJS Schema for Cross-Schema Sync
-- Creates just the essential tables needed for user/customer sync

SET search_path TO medusa;

-- Customer table (minimal version)
CREATE TABLE IF NOT EXISTS customer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    has_account BOOLEAN DEFAULT false,
    olcan_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_customer_olcan_user FOREIGN KEY (olcan_user_id) 
        REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_customer_email ON customer(email);
CREATE INDEX IF NOT EXISTS idx_customer_olcan_user ON customer(olcan_user_id);

-- Product table (minimal version for commerce proxy)
CREATE TABLE IF NOT EXISTS product (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    handle VARCHAR(255) UNIQUE,
    is_giftcard BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'draft',
    thumbnail VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_handle ON product(handle);
CREATE INDEX IF NOT EXISTS idx_product_status ON product(status);

-- Product variant (for pricing)
CREATE TABLE IF NOT EXISTS product_variant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    sku VARCHAR(255),
    barcode VARCHAR(255),
    inventory_quantity INTEGER DEFAULT 0,
    allow_backorder BOOLEAN DEFAULT false,
    manage_inventory BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_variant_product FOREIGN KEY (product_id) 
        REFERENCES product(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_variant_product ON product_variant(product_id);
CREATE INDEX IF NOT EXISTS idx_variant_sku ON product_variant(sku);

-- Money amount (for pricing)
CREATE TABLE IF NOT EXISTS money_amount (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID,
    currency_code VARCHAR(3) NOT NULL,
    amount INTEGER NOT NULL,
    min_quantity INTEGER,
    max_quantity INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_money_amount_variant FOREIGN KEY (variant_id) 
        REFERENCES product_variant(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_money_amount_variant ON money_amount(variant_id);
CREATE INDEX IF NOT EXISTS idx_money_amount_currency ON money_amount(currency_code);

-- Cart (for checkout)
CREATE TABLE IF NOT EXISTS cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID,
    email VARCHAR(255),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_cart_customer FOREIGN KEY (customer_id) 
        REFERENCES customer(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_cart_customer ON cart(customer_id);

-- Order (for purchase history)
CREATE TABLE IF NOT EXISTS "order" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    total INTEGER NOT NULL DEFAULT 0,
    currency_code VARCHAR(3) DEFAULT 'BRL',
    cart_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) 
        REFERENCES customer(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_order_customer ON "order"(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_status ON "order"(status);
CREATE INDEX IF NOT EXISTS idx_order_created ON "order"(created_at);

-- Verification
SELECT 'Medusa minimal schema created successfully' AS status;
SELECT COUNT(*) as customer_count FROM customer;
SELECT COUNT(*) as product_count FROM product;

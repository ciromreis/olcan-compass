-- Cross-Schema Links and Sync Triggers
-- Run this AFTER all migrations have been executed

-- ============================================================
-- 1. Add Foreign Key Columns to MedusaJS Tables
-- ============================================================

-- Link customer to Olcan user
ALTER TABLE medusa.customer 
ADD COLUMN IF NOT EXISTS olcan_user_id UUID;

-- Link seller to Olcan user (if Mercur seller table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'medusa' AND table_name = 'seller'
    ) THEN
        ALTER TABLE medusa.seller
        ADD COLUMN IF NOT EXISTS olcan_user_id UUID;
    END IF;
END
$$;

-- ============================================================
-- 2. Add Foreign Key Constraints
-- ============================================================

-- Customer -> User
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_customer_olcan_user'
    ) THEN
        ALTER TABLE medusa.customer
        ADD CONSTRAINT fk_customer_olcan_user
        FOREIGN KEY (olcan_user_id) REFERENCES public.users(id)
        ON DELETE SET NULL;
    END IF;
END
$$;

-- Seller -> User (if table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'medusa' AND table_name = 'seller'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_seller_olcan_user'
        ) THEN
            ALTER TABLE medusa.seller
            ADD CONSTRAINT fk_seller_olcan_user
            FOREIGN KEY (olcan_user_id) REFERENCES public.users(id)
            ON DELETE SET NULL;
        END IF;
    END IF;
END
$$;

-- ============================================================
-- 3. Create Sync Functions
-- ============================================================

-- Function: Create MedusaJS customer when Olcan user is created
CREATE OR REPLACE FUNCTION sync_create_medusa_customer()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create customer if email doesn't already exist
    IF NOT EXISTS (SELECT 1 FROM medusa.customer WHERE email = NEW.email) THEN
        INSERT INTO medusa.customer (
            id,
            email,
            first_name,
            last_name,
            has_account,
            olcan_user_id,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            NEW.email,
            COALESCE(split_part(NEW.full_name, ' ', 1), ''),
            COALESCE(split_part(NEW.full_name, ' ', 2), ''),
            true,
            NEW.id,
            NOW(),
            NOW()
        );
    ELSE
        -- Update existing customer with olcan_user_id
        UPDATE medusa.customer
        SET olcan_user_id = NEW.id,
            updated_at = NOW()
        WHERE email = NEW.email AND olcan_user_id IS NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update MedusaJS customer when Olcan user is updated
CREATE OR REPLACE FUNCTION sync_update_medusa_customer()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE medusa.customer
    SET 
        email = NEW.email,
        first_name = COALESCE(split_part(NEW.full_name, ' ', 1), first_name),
        last_name = COALESCE(split_part(NEW.full_name, ' ', 2), last_name),
        updated_at = NOW()
    WHERE olcan_user_id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Create MedusaJS seller when user becomes vendor
CREATE OR REPLACE FUNCTION sync_create_medusa_seller()
RETURNS TRIGGER AS $$
BEGIN
    -- Only if seller table exists and user role is vendor
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'medusa' AND table_name = 'seller'
    ) AND NEW.role = 'vendor' AND (OLD.role IS NULL OR OLD.role != 'vendor') THEN
        
        -- Check if seller doesn't already exist
        IF NOT EXISTS (SELECT 1 FROM medusa.seller WHERE olcan_user_id = NEW.id) THEN
            INSERT INTO medusa.seller (
                id,
                olcan_user_id,
                business_name,
                status,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                NEW.id,
                COALESCE(NEW.full_name, NEW.email),
                'pending',
                NOW(),
                NOW()
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 4. Create Triggers
-- ============================================================

-- Trigger: Create customer on user insert
DROP TRIGGER IF EXISTS trigger_sync_create_medusa_customer ON public.users;
CREATE TRIGGER trigger_sync_create_medusa_customer
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_create_medusa_customer();

-- Trigger: Update customer on user update
DROP TRIGGER IF EXISTS trigger_sync_update_medusa_customer ON public.users;
CREATE TRIGGER trigger_sync_update_medusa_customer
    AFTER UPDATE ON public.users
    FOR EACH ROW
    WHEN (OLD.email IS DISTINCT FROM NEW.email OR OLD.full_name IS DISTINCT FROM NEW.full_name)
    EXECUTE FUNCTION sync_update_medusa_customer();

-- Trigger: Create seller when user becomes vendor
DROP TRIGGER IF EXISTS trigger_sync_create_medusa_seller ON public.users;
CREATE TRIGGER trigger_sync_create_medusa_seller
    AFTER UPDATE ON public.users
    FOR EACH ROW
    WHEN (NEW.role = 'vendor')
    EXECUTE FUNCTION sync_create_medusa_seller();

-- ============================================================
-- 5. Create Useful Views
-- ============================================================

-- View: Enriched products with PayloadCMS metadata
CREATE OR REPLACE VIEW enriched_products AS
SELECT 
    p.*,
    pm.is_featured,
    pm.is_olcan_official,
    pm.journey_tags,
    pm.recommended_for,
    pm.editorial_description
FROM medusa.product p
LEFT JOIN payload.product_metadata pm ON p.id = pm.medusa_product_id;

-- View: User purchase analytics
CREATE OR REPLACE VIEW user_purchase_analytics AS
SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.total), 0) as lifetime_value,
    MAX(o.created_at) as last_purchase_at,
    COUNT(DISTINCT o.id) FILTER (WHERE o.created_at > NOW() - INTERVAL '30 days') as orders_last_30_days
FROM public.users u
LEFT JOIN medusa.customer c ON c.olcan_user_id = u.id
LEFT JOIN medusa.order o ON o.customer_id = c.id
GROUP BY u.id, u.email, u.full_name;

-- View: Vendor performance
CREATE OR REPLACE VIEW vendor_performance AS
SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    s.business_name,
    s.status as seller_status,
    COUNT(DISTINCT sp.product_id) as total_products,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(c.amount), 0) as total_commissions,
    COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'paid'), 0) as total_payouts
FROM public.users u
INNER JOIN medusa.seller s ON s.olcan_user_id = u.id
LEFT JOIN medusa.seller_product sp ON sp.seller_id = s.id
LEFT JOIN medusa.order o ON o.id IN (
    SELECT order_id FROM medusa.commission WHERE seller_id = s.id
)
LEFT JOIN medusa.commission c ON c.seller_id = s.id
LEFT JOIN medusa.payout p ON p.seller_id = s.id
WHERE u.role = 'vendor'
GROUP BY u.id, u.email, u.full_name, s.business_name, s.status;

-- ============================================================
-- 6. Grant View Permissions
-- ============================================================

GRANT SELECT ON enriched_products TO olcan_app;
GRANT SELECT ON user_purchase_analytics TO olcan_app;
GRANT SELECT ON vendor_performance TO olcan_app;

-- ============================================================
-- 7. Verification
-- ============================================================

-- Check foreign keys
SELECT 
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.constraint_name LIKE 'fk_%olcan%';

-- Check triggers
SELECT 
    trigger_schema,
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%sync%';

-- Check views
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_type = 'VIEW'
AND table_schema IN ('public', 'medusa', 'payload');

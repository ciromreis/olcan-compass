-- SCALABILITY HARDENING — Public Schema
-- Full-text search, notifications, activity feed

-- 1. Full-text search on user_posts
ALTER TABLE public.user_posts ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_posts_fts ON public.user_posts USING gin(search_vector);

-- 2. Full-text search on questions
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_questions_fts ON public.questions USING gin(search_vector);

-- 3. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON public.notifications(user_id, is_read, created_at DESC);

-- 4. Activity feed
CREATE TABLE IF NOT EXISTS public.activity_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_af_user ON public.activity_feed(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_af_target ON public.activity_feed(target_type, target_id);

-- 5. Search triggers
CREATE OR REPLACE FUNCTION update_posts_search()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('portuguese', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('portuguese', COALESCE(NEW.excerpt, '')), 'B') ||
        setweight(to_tsvector('portuguese', COALESCE(NEW.content, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tg_posts_search ON public.user_posts;
CREATE TRIGGER tg_posts_search
    BEFORE INSERT OR UPDATE OF title, excerpt, content ON public.user_posts
    FOR EACH ROW EXECUTE FUNCTION update_posts_search();

CREATE OR REPLACE FUNCTION update_questions_search()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('portuguese', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('portuguese', COALESCE(NEW.content, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tg_questions_search ON public.questions;
CREATE TRIGGER tg_questions_search
    BEFORE INSERT OR UPDATE OF title, content ON public.questions
    FOR EACH ROW EXECUTE FUNCTION update_questions_search();

-- 6. Permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO olcan_app;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO olcan_app;

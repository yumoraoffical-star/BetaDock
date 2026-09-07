-- ============================================================================
-- BETADOCK SUPABASE DATABASE SCHEMA
-- Project: https://fszgqexkqbifqthuvkzw.supabase.co
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fszgqexkqbifqthuvkzw/sql
-- ============================================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    icon TEXT DEFAULT '🚀',
    icon_bg TEXT DEFAULT '#F5BA27',
    pricing TEXT DEFAULT 'Freemium',
    upvotes INTEGER DEFAULT 1,
    featured BOOLEAN DEFAULT FALSE,
    tier TEXT DEFAULT 'free', -- 'free', 'fast-track', 'pro'
    promoted BOOLEAN DEFAULT FALSE, -- TRUE if broadcasted on @BetaDockHQ
    deal_has BOOLEAN DEFAULT FALSE,
    deal_text TEXT,
    deal_code TEXT,
    testers_wanted BOOLEAN DEFAULT FALSE,
    tester_spots INTEGER DEFAULT 10,
    tester_claimed INTEGER DEFAULT 0,
    tester_reward TEXT,
    founder TEXT DEFAULT 'Anonymous Maker',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    stats JSONB DEFAULT '{"views": 1, "clicks": 0}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Beta Tester Feedbacks Table
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id BIGSERIAL PRIMARY KEY,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    "user" TEXT NOT NULL,
    email TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    good TEXT NOT NULL,
    bad TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- 4. Create Public Access Policies (Allow Everyone to Read and Submit)
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert products" ON public.products;
CREATE POLICY "Public can insert products" ON public.products
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update products" ON public.products;
CREATE POLICY "Public can update products" ON public.products
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public can view feedbacks" ON public.feedbacks;
CREATE POLICY "Public can view feedbacks" ON public.feedbacks
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert feedbacks" ON public.feedbacks;
CREATE POLICY "Public can insert feedbacks" ON public.feedbacks
    FOR INSERT WITH CHECK (true);

-- 5. Realtime Publication (Enables instant real-time sync across connected clients)
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedbacks;

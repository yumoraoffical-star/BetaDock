-- ============================================================================
-- BETADOCK SUPABASE DATABASE SCHEMA (2-PILLAR DISCOVER + LAUNCH ARCHITECTURE)
-- Project: https://fszgqexkqbifqthuvkzw.supabase.co
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fszgqexkqbifqthuvkzw/sql
-- ============================================================================

-- 1. Create Products Table (Moderated Lifecycle & Rich Metadata)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    problem_solved TEXT,
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    screenshots TEXT[] DEFAULT ARRAY[]::TEXT[],
    url TEXT NOT NULL,
    icon TEXT DEFAULT '🚀',
    icon_bg TEXT DEFAULT '#F5BA27',
    pricing TEXT DEFAULT 'Freemium',
    upvotes INTEGER DEFAULT 1,
    featured BOOLEAN DEFAULT FALSE,
    tier TEXT DEFAULT 'free', -- 'free', 'fast-track', 'pro'
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'needs_changes'
    origin TEXT DEFAULT 'Global', -- 'India', 'Global'
    origin_location TEXT, -- e.g. 'Maharashtra, India'
    builder_type TEXT DEFAULT 'indie', -- 'student', 'indie', 'startup', 'opensource'
    promoted BOOLEAN DEFAULT FALSE,
    deal_has BOOLEAN DEFAULT FALSE,
    deal_text TEXT,
    deal_code TEXT,
    testers_wanted BOOLEAN DEFAULT FALSE,
    tester_spots INTEGER DEFAULT 10,
    tester_claimed INTEGER DEFAULT 0,
    tester_reward TEXT,
    founder TEXT DEFAULT 'Anonymous Maker',
    founder_id TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    stats JSONB DEFAULT '{"views": 1, "clicks": 0}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Unique Upvotes Table (Prevents Client-Side Spoofing / Double Voting)
CREATE TABLE IF NOT EXISTS public.product_votes (
    id BIGSERIAL PRIMARY KEY,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_product_user_vote UNIQUE (product_id, user_id)
);

-- 3. Create Community Comments Table (With Founder Replies & Moderation)
CREATE TABLE IF NOT EXISTS public.comments (
    id BIGSERIAL PRIMARY KEY,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    comment TEXT NOT NULL,
    is_founder_reply BOOLEAN DEFAULT FALSE,
    parent_id BIGINT REFERENCES public.comments(id) ON DELETE CASCADE,
    is_flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Founder Profiles Table
CREATE TABLE IF NOT EXISTS public.founder_profiles (
    id TEXT PRIMARY KEY, -- matches founder username/id
    user_id TEXT UNIQUE,
    name TEXT NOT NULL,
    avatar TEXT,
    bio TEXT,
    location TEXT,
    is_india BOOLEAN DEFAULT FALSE,
    website TEXT,
    twitter TEXT,
    github TEXT,
    linkedin TEXT,
    launches_count INTEGER DEFAULT 1,
    upvotes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Beta Tester Feedbacks Table
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

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- 7. Public Read & Guarded Write Policies
DROP POLICY IF EXISTS "Public can view approved products" ON public.products;
CREATE POLICY "Public can view approved products" ON public.products
    FOR SELECT USING (status = 'approved' OR status = 'pending');

DROP POLICY IF EXISTS "Public can insert products" ON public.products;
CREATE POLICY "Public can insert products" ON public.products
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view votes" ON public.product_votes;
CREATE POLICY "Public can view votes" ON public.product_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can vote" ON public.product_votes;
CREATE POLICY "Authenticated can vote" ON public.product_votes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view comments" ON public.comments;
CREATE POLICY "Public can view comments" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can comment" ON public.comments;
CREATE POLICY "Authenticated can comment" ON public.comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view founders" ON public.founder_profiles;
CREATE POLICY "Public can view founders" ON public.founder_profiles FOR SELECT USING (true);

-- 8. Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

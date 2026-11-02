-- ==============================================================================
-- ROYALCLUBBD - 1-CLICK SUPABASE ROW LEVEL SECURITY (RLS) FIX SCRIPT
-- ==============================================================================
-- Run this in your Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/cmpdfidmaplzumazurpa/sql
--
-- This unlocks full read & write permissions for your users, games,
-- transactions, and admin controls directly from the frontend web app.
-- ==============================================================================

-- 1. Ensure all 4 core tables exist with matching schema:
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    uid VARCHAR(20) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(30) DEFAULT NULL,
    password TEXT NOT NULL,
    balance NUMERIC(14, 2) NOT NULL DEFAULT 100.00,
    custom_win_rate NUMERIC(5, 2) DEFAULT 95.00,
    vip_level INT DEFAULT 1,
    is_online BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.game_settings (
    id BIGSERIAL PRIMARY KEY,
    game_id VARCHAR(50) UNIQUE NOT NULL,
    game_name VARCHAR(100) NOT NULL,
    rtp_percentage NUMERIC(5, 2) NOT NULL DEFAULT 96.00,
    max_multiplier NUMERIC(8, 2) DEFAULT 100.00,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.game_logs (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    username VARCHAR(50) NOT NULL,
    game_name VARCHAR(100) NOT NULL,
    bet_amount NUMERIC(14, 2) NOT NULL,
    win_amount NUMERIC(14, 2) NOT NULL,
    result TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    username VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    type VARCHAR(20) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    method VARCHAR(50) DEFAULT 'bKash',
    trx_id VARCHAR(100) DEFAULT NULL,
    account_number VARCHAR(100) DEFAULT NULL
);

-- 2. DISABLE ROW LEVEL SECURITY (Recommended for direct client access):
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;

-- 3. Alternative: If RLS is enabled, grant full access to anon and authenticated roles:
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Full Access Users" ON public.users;
    DROP POLICY IF EXISTS "Public Full Access Settings" ON public.game_settings;
    DROP POLICY IF EXISTS "Public Full Access Logs" ON public.game_logs;
    DROP POLICY IF EXISTS "Public Full Access Transactions" ON public.transactions;
END $$;

CREATE POLICY "Public Full Access Users" ON public.users FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access Settings" ON public.game_settings FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access Logs" ON public.game_logs FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access Transactions" ON public.transactions FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. Seed default game settings:
INSERT INTO public.game_settings (game_id, game_name, rtp_percentage, max_multiplier)
VALUES
    ('aviator', 'Aviator Spribe', 97.00, 100.00),
    ('fortunegems2', 'Fortune Gems 2 JILI', 97.00, 200.00),
    ('superace', 'Super Ace JILI', 97.00, 250.00),
    ('wingo', 'WinGo 91 Club', 98.00, 9.00),
    ('k3', 'K3 3D Lottery', 97.80, 207.36),
    ('gatesofolympus', 'Gates of Olympus Pragmatic', 96.50, 500.00),
    ('mines', 'Mines Gold Spribe', 97.00, 100.00)
ON CONFLICT (game_id) DO UPDATE SET 
    rtp_percentage = EXCLUDED.rtp_percentage,
    max_multiplier = EXCLUDED.max_multiplier,
    updated_at = timezone('utc'::text, now());

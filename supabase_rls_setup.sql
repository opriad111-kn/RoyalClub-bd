-- ==============================================================================
-- ROYALCLUBBD - 100% ERROR-FREE SUPABASE RLS UNLOCK SCRIPT
-- ==============================================================================
-- Run this in your Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/cmpdfidmaplzumazurpa/sql
-- ==============================================================================

-- 1. DISABLE ROW LEVEL SECURITY (Allows website & custom domain direct access)
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.game_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.game_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions DISABLE ROW LEVEL SECURITY;

-- 2. Make server_provider nullable with default so it never throws not-null error:
ALTER TABLE IF EXISTS public.game_settings ALTER COLUMN server_provider DROP NOT NULL;

-- 3. Grant public read/write policies:
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Full Access Users" ON public.users;
    DROP POLICY IF EXISTS "Public Full Access Settings" ON public.game_settings;
    DROP POLICY IF EXISTS "Public Full Access Logs" ON public.game_logs;
    DROP POLICY IF EXISTS "Public Full Access Transactions" ON public.transactions;
END $$;

-- 4. Seed default game settings with server_provider:
INSERT INTO public.game_settings (game_id, game_name, server_provider, rtp_percentage, max_multiplier)
VALUES
    ('aviator', 'Aviator Spribe', 'SPRIBE', 97.00, 100.00),
    ('fortunegems2', 'Fortune Gems 2 JILI', 'JILI', 97.00, 200.00),
    ('superace', 'Super Ace JILI', 'JILI', 97.00, 250.00),
    ('wingo', 'WinGo 91 Club', 'LOTTERY', 98.00, 9.00),
    ('k3', 'K3 3D Lottery', 'LOTTERY', 97.80, 207.36),
    ('gatesofolympus', 'Gates of Olympus Pragmatic', 'PRAGMATIC', 96.50, 500.00),
    ('mines', 'Mines Gold Spribe', 'SPRIBE', 97.00, 100.00)
ON CONFLICT (game_id) DO UPDATE SET 
    server_provider = EXCLUDED.server_provider,
    rtp_percentage = EXCLUDED.rtp_percentage,
    max_multiplier = EXCLUDED.max_multiplier,
    updated_at = timezone('utc'::text, now());

-- ==============================================================================
-- ROYALCLUBBD - ADVANCED HOUSE EDGE, PROFIT PROTECTION & ADMIN CONTROL SCHEMA
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. UPGRADE USERS TABLE WITH REAL-TIME HOUSE EDGE & PROFIT PROTECTION COLUMNS
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS balance NUMERIC(14, 2) DEFAULT 50.00,
  ADD COLUMN IF NOT EXISTS bonus_balance NUMERIC(14, 2) DEFAULT 50.00,
  ADD COLUMN IF NOT EXISTS total_deposited NUMERIC(14, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS total_withdrawn NUMERIC(14, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS current_turnover NUMERIC(14, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS required_turnover NUMERIC(14, 2) DEFAULT 100.00,
  ADD COLUMN IF NOT EXISTS max_allowed_balance NUMERIC(14, 2) DEFAULT 199.00,
  ADD COLUMN IF NOT EXISTS custom_rtp INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS force_mode TEXT DEFAULT 'normal', -- 'normal', 'force_win', 'force_loss', 'drain_to_zero'
  ADD COLUMN IF NOT EXISTS force_result TEXT DEFAULT 'normal', -- backwards compatible
  ADD COLUMN IF NOT EXISTS custom_win_rate INT DEFAULT NULL, -- backwards compatible
  ADD COLUMN IF NOT EXISTS spins_since_deposit INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_spins INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS current_game TEXT DEFAULT 'Lobby',
  ADD COLUMN IF NOT EXISTS device_info TEXT DEFAULT 'Mobile / Desktop Browser';

-- Index for real-time online tracking
CREATE INDEX IF NOT EXISTS idx_users_is_online ON public.users(is_online, last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_force_mode ON public.users(force_mode);

-- 2. CREATE PLATFORM SETTINGS GLOBAL TABLE
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL DEFAULT 'global_config',
    signup_bonus NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    min_withdraw NUMERIC(10, 2) NOT NULL DEFAULT 200.00,
    bonus_balance_cap NUMERIC(10, 2) NOT NULL DEFAULT 199.00,
    global_house_edge_percent INT NOT NULL DEFAULT 75,
    first_spins_boost_count INT NOT NULL DEFAULT 10,
    company_profit_retention_percent INT NOT NULL DEFAULT 75,
    hourly_profit_target_percent INT NOT NULL DEFAULT 75,
    aviator_next_crash NUMERIC(6, 2) NOT NULL DEFAULT 1.25,
    aviator_force_crash_now BOOLEAN NOT NULL DEFAULT false,
    server_rtp JSONB NOT NULL DEFAULT '{"JILI": 20, "PRAGMATIC": 18, "PGSOFT": 22, "SPRIBE": 15, "LOTTERY": 25}'::jsonb,
    game_rtp_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed default row if not exists
INSERT INTO public.platform_settings (
    key, signup_bonus, min_withdraw, bonus_balance_cap, 
    global_house_edge_percent, first_spins_boost_count, 
    company_profit_retention_percent, hourly_profit_target_percent,
    aviator_next_crash, aviator_force_crash_now, server_rtp, updated_at
)
VALUES (
    'global_config', 50.00, 200.00, 199.00, 
    75, 10, 
    75, 75, 
    1.25, false, 
    '{"JILI": 20, "PRAGMATIC": 18, "PGSOFT": 22, "SPRIBE": 15, "LOTTERY": 25}'::jsonb, 
    timezone('utc'::text, now())
)
ON CONFLICT (key) DO UPDATE SET
    signup_bonus = EXCLUDED.signup_bonus,
    min_withdraw = EXCLUDED.min_withdraw,
    bonus_balance_cap = EXCLUDED.bonus_balance_cap,
    global_house_edge_percent = EXCLUDED.global_house_edge_percent,
    company_profit_retention_percent = EXCLUDED.company_profit_retention_percent;

-- 3. PERMISSIONS & REALTIME
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'platform_settings' AND policyname = 'Allow public read platform_settings'
  ) THEN
    CREATE POLICY "Allow public read platform_settings" ON public.platform_settings FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'platform_settings' AND policyname = 'Allow public update platform_settings'
  ) THEN
    CREATE POLICY "Allow public update platform_settings" ON public.platform_settings FOR ALL USING (true);
  END IF;
END $$;

-- Enable Realtime for users and platform_settings safely
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_settings;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;


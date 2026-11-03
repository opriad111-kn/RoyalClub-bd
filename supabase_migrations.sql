-- ==============================================================================
-- ROYALCLUBBD / TRXWINGO - SUPABASE DATABASE MIGRATIONS & SCHEMA
-- ==============================================================================

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uid VARCHAR(12) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    balance NUMERIC(14, 2) NOT NULL DEFAULT 1000.00,
    total_won NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_wagered NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    last_faucet_claim TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_users_uid ON public.users(uid);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- 2. TRXWINGO ROUNDS TABLE (Provably Fair & History)
CREATE TABLE IF NOT EXISTS public.rounds (
    id BIGSERIAL PRIMARY KEY,
    period VARCHAR(30) UNIQUE NOT NULL,
    winning_number INT NOT NULL CHECK (winning_number BETWEEN 0 AND 9),
    winning_color VARCHAR(15) NOT NULL, -- 'green', 'red', 'violet', 'green-violet', 'red-violet'
    is_big BOOLEAN NOT NULL,             -- true if 5-9, false if 0-4
    server_seed_hash VARCHAR(100) NOT NULL,
    server_seed VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rounds_period ON public.rounds(period DESC);

-- 3. BETS LEDGER TABLE
CREATE TABLE IF NOT EXISTS public.bets (
    id BIGSERIAL PRIMARY KEY,
    uid VARCHAR(12) NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
    period VARCHAR(30) NOT NULL,
    bet_type VARCHAR(20) NOT NULL,       -- 'color', 'number', 'size'
    selection VARCHAR(20) NOT NULL,      -- 'green', 'red', 'violet', '0'-'9', 'big', 'small'
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    multiplier NUMERIC(5, 2) NOT NULL,   -- 2.00, 4.50, 9.00, etc.
    payout NUMERIC(14, 2) DEFAULT 0.00,
    status VARCHAR(15) NOT NULL DEFAULT 'pending', -- 'pending', 'won', 'lost'
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bets_uid ON public.bets(uid);
CREATE INDEX IF NOT EXISTS idx_bets_period ON public.bets(period);

-- 4. FINANCIAL & COIN LEDGER TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
    id BIGSERIAL PRIMARY KEY,
    uid VARCHAR(12) NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,           -- 'deposit', 'withdrawal', 'bet_placed', 'bet_won', 'bonus', 'faucet'
    amount NUMERIC(14, 2) NOT NULL,
    fee NUMERIC(14, 2) DEFAULT 0.00,
    method VARCHAR(50) DEFAULT 'USDT-TRC20', -- 'USDT-TRC20', 'bKash', 'Nagad', 'Faucet'
    tx_hash VARCHAR(100) DEFAULT NULL,
    account_number VARCHAR(100) DEFAULT NULL,
    proof_url TEXT DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'completed'
    admin_note TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_uid ON public.transactions(uid);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

-- 5. APP SETTINGS & FEATURE FLAGS TABLE
CREATE TABLE IF NOT EXISTS public.app_settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed default settings
INSERT INTO public.app_settings (key, value)
VALUES 
    ('ENABLE_PAID_MODE', 'false'::jsonb),
    ('ROUND_DURATION_SECONDS', '60'::jsonb),
    ('SIGNUP_BONUS_AMOUNT', '1000'::jsonb),
    ('FAUCET_AMOUNT', '250'::jsonb),
    ('FAUCET_COOLDOWN_HOURS', '4'::jsonb),
    ('MIN_WITHDRAWAL_AMOUNT', '500'::jsonb),
    ('WITHDRAWAL_FEE_PERCENT', '2'::jsonb),
    ('USDT_DEPOSIT_ADDRESS', '"TQxxxxxxxxxxxxxxxxxxxxxxxxxxxx"'::jsonb),
    ('BKASH_NUMBER', '"01700-000000 (Personal)"'::jsonb),
    ('NAGAD_NUMBER', '"01800-000000 (Personal)"'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 6. REALTIME REPLICATION ENABLEMENT
ALTER PUBLICATION supabase_realtime ADD TABLE public.rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- 7. ADVANCED HOUSE EDGE, DYNAMIC PROFIT PROTECTION & REAL-TIME ADMIN CONTROL
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
  ADD COLUMN IF NOT EXISTS spins_since_deposit INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_spins INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS current_game TEXT DEFAULT 'Lobby',
  ADD COLUMN IF NOT EXISTS device_info TEXT DEFAULT 'Mobile / Desktop Browser';

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



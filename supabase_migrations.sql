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


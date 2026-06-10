-- ============================================================
-- PaisaLog — Supabase SQL Migration
-- Run this ONCE in the Supabase SQL Editor (Dashboard > SQL)
-- ============================================================

-- 1. CREATE ALL TABLES FIRST
CREATE TABLE IF NOT EXISTS households (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(100) NOT NULL,
  invite_code  VARCHAR(6) UNIQUE NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id  UUID REFERENCES households(id) ON DELETE SET NULL,
  display_name  VARCHAR(50) NOT NULL,
  role          VARCHAR(10) CHECK (role IN ('dad', 'mom')) DEFAULT 'dad',
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  logged_by     UUID NOT NULL REFERENCES profiles(id),
  giver_id      UUID NOT NULL REFERENCES profiles(id),
  receiver_id   UUID NOT NULL REFERENCES profiles(id),
  amount        NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  category      VARCHAR(30) NOT NULL CHECK (
    category IN ('home_expenses', 'grocery', 'utility', 'personal', 'other')
  ),
  txn_date      DATE NOT NULL,
  note          TEXT CHECK (char_length(note) <= 200),
  logged_at     TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. CREATE ALL INDEXES
CREATE UNIQUE INDEX IF NOT EXISTS idx_households_invite_code ON households(invite_code);
CREATE INDEX IF NOT EXISTS idx_profiles_household_id ON profiles(household_id);
CREATE INDEX IF NOT EXISTS idx_transactions_household_id ON transactions(household_id);
CREATE INDEX IF NOT EXISTS idx_transactions_txn_date ON transactions(txn_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_logged_at ON transactions(logged_at DESC);

-- 3. ENABLE RLS
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 4. CREATE ALL POLICIES
-- Households Policy
CREATE POLICY "select_own_household_record" ON households
  FOR SELECT USING (
    id = (SELECT household_id FROM profiles WHERE id = auth.uid())
  );

-- Profiles Policies
CREATE POLICY "select_same_household_profiles" ON profiles
  FOR SELECT USING (
    household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
    OR id = auth.uid()
  );

CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Transactions Policies
CREATE POLICY "select_own_household_transactions" ON transactions
  FOR SELECT USING (
    household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "insert_own_household_transactions" ON transactions
  FOR INSERT WITH CHECK (
    household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "update_own_transactions" ON transactions
  FOR UPDATE USING (logged_by = auth.uid());

CREATE POLICY "delete_own_transactions" ON transactions
  FOR DELETE USING (logged_by = auth.uid());

-- 5. TRIGGER: auto-create profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'dad')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

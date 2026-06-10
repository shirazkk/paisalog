# PaisaLog — Full SQL Migrations

Run these in order in the Supabase SQL editor.

---

## Migration 001 — Create Tables

```sql
-- Households
CREATE TABLE households (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         varchar(100) NOT NULL,
  invite_code  varchar(6) NOT NULL UNIQUE,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Profiles (linked to Supabase auth.users)
CREATE TABLE profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id  uuid REFERENCES households(id),
  display_name  varchar(50) NOT NULL,
  role          varchar(10) CHECK (role IN ('dad', 'mom', 'member')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Transactions
CREATE TABLE transactions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  uuid NOT NULL REFERENCES households(id),
  logged_by     uuid NOT NULL REFERENCES profiles(id),
  giver_id      uuid NOT NULL REFERENCES profiles(id),
  receiver_id   uuid NOT NULL REFERENCES profiles(id),
  amount        numeric(10,2) NOT NULL CHECK (amount > 0),
  category      varchar(30) NOT NULL CHECK (category IN ('home_expenses','grocery','utility','personal','other')),
  txn_date      date NOT NULL DEFAULT CURRENT_DATE,
  note          text CHECK (char_length(note) <= 200),
  logged_at     timestamptz NOT NULL DEFAULT now()
);
```

---

## Migration 002 — Indexes

```sql
CREATE INDEX idx_profiles_household ON profiles(household_id);
CREATE INDEX idx_transactions_household ON transactions(household_id);
CREATE INDEX idx_transactions_date ON transactions(txn_date DESC);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_households_invite ON households(invite_code);
```

---

## Migration 003 — Enable RLS + Policies

```sql
-- households
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_household_record" ON households
  FOR SELECT USING (id = (SELECT household_id FROM profiles WHERE id = auth.uid()));

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_same_household_profiles" ON profiles
  FOR SELECT USING (household_id = (SELECT household_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_household" ON transactions
  FOR SELECT USING (household_id = (SELECT household_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "insert_own_household" ON transactions
  FOR INSERT WITH CHECK (household_id = (SELECT household_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "update_own_rows" ON transactions
  FOR UPDATE USING (logged_by = auth.uid());
CREATE POLICY "delete_own_rows" ON transactions
  FOR DELETE USING (logged_by = auth.uid());
```

---

## Migration 004 — Auto-create Profile on Signup

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Member'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

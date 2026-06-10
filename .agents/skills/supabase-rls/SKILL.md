---
name: supabase-rls
description: >
  Use this skill whenever creating, modifying, or reviewing any Supabase table in the
  PaisaLog app. Triggers on: creating tables, writing migrations, setting up policies,
  any mention of "RLS", "row level security", "Supabase table", "database security",
  or "who can access what". Must be used before writing ANY table SQL — never skip this.
---

# Supabase RLS Skill — PaisaLog

Every table in PaisaLog stores family-private data. A user must NEVER be able to
read or write another family's data. This skill ensures that at the database level.

---

## Step 1 — Always Enable RLS First

For every table you create, the FIRST thing you do after CREATE TABLE is:

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

Never leave a table without RLS enabled. No exceptions.

---

## Step 2 — Standard Policy Set Per Table

Apply all 4 policies to every table that has a `household_id` column:

```sql
-- SELECT: user can only read their own household's rows
CREATE POLICY "select_own_household" ON table_name
  FOR SELECT USING (
    household_id = (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- INSERT: user can only insert into their own household
CREATE POLICY "insert_own_household" ON table_name
  FOR INSERT WITH CHECK (
    household_id = (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- UPDATE: user can only update rows they personally created
CREATE POLICY "update_own_rows" ON table_name
  FOR UPDATE USING (logged_by = auth.uid());

-- DELETE: user can only delete rows they personally created
CREATE POLICY "delete_own_rows" ON table_name
  FOR DELETE USING (logged_by = auth.uid());
```

---

## Step 3 — Profiles Table Special Policy

The `profiles` table uses `id` not `household_id` for self-access:

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- User can read their own profile AND their partner's (same household)
CREATE POLICY "select_same_household_profiles" ON profiles
  FOR SELECT USING (
    household_id = (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- User can only update their own profile
CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE USING (id = auth.uid());
```

---

## Step 4 — Households Table Policy

```sql
ALTER TABLE households ENABLE ROW LEVEL SECURITY;

-- User can only read their own household
CREATE POLICY "select_own_household_record" ON households
  FOR SELECT USING (
    id = (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );
```

No INSERT/UPDATE/DELETE from client — households are created via server API route only
using the `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS.

---

## Step 5 — Never Expose Service Role Key

- `SUPABASE_SERVICE_ROLE_KEY` → server-side only (`/app/api/` routes)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → client-side (safe, RLS enforces security)
- Never import `SUPABASE_SERVICE_ROLE_KEY` in any file under `/app/(dashboard)` or `/components`

---

## Step 6 — Verify After Writing

After writing all policies, mentally test:
1. Can User A (Dad) read User B's (from different family) transactions? → Must be NO
2. Can Dad update Mom's logged transaction? → Must be NO (only own rows)
3. Can Dad read Mom's profile? → Must be YES (same household)

See `references/migrations.md` for the full ready-to-run SQL migration.

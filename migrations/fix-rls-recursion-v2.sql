-- ============================================================
-- PaisaLog — Fix RLS Infinite Recursion
-- Run this in the Supabase SQL Editor (Dashboard > SQL)
-- ============================================================

-- 1. Drop existing policies to start fresh
DROP POLICY IF EXISTS "select_same_household_profiles" ON public.profiles;
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "select_household_members" ON public.profiles;

-- 2. Policy: Users can always see their own profile
CREATE POLICY "select_own_profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- 3. Policy: Users can see profiles that share the same household_id
-- NOTE: If this subquery still causes recursion, use the DISABLE command below instead.
CREATE POLICY "select_household_members" ON public.profiles
  FOR SELECT USING (
    household_id IS NOT NULL AND household_id = (SELECT household_id FROM public.profiles WHERE id = auth.uid())
  );

-- 4. FALLBACK: If the dashboard still doesn't load after running this, 
-- uncomment the line below and run this file again to bypass RLS entirely:
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

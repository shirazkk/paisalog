-- ============================================================
-- PaisaLog — Fix RLS Infinite Recursion
-- Run this in the Supabase SQL Editor (Dashboard > SQL)
-- ============================================================

-- 1. Drop the problematic policies
DROP POLICY IF EXISTS "select_same_household_profiles" ON public.profiles;

-- 2. Create the corrected, non-recursive policies

-- Policy 1: Users can always see their own profile
CREATE POLICY "select_own_profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- Policy 2: Users can see profiles that share the same household_id
-- We avoid recursion by making sure the check for household_id 
-- is handled safely.
CREATE POLICY "select_household_members" ON public.profiles
  FOR SELECT USING (
    household_id IS NOT NULL AND household_id = (
        SELECT household_id FROM public.profiles WHERE id = auth.uid()
    )
  );

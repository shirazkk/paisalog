-- ============================================================
-- ADD: budgets table for tracking monthly category limits
-- ============================================================

CREATE TABLE public.budgets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE,
  category varchar(30) NOT NULL,
  amount_limit numeric(10, 2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(household_id, category)
);

-- 2. Enable Row-Level Security
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policy: Allow users to manage budgets for their own household
CREATE POLICY "manage_own_household_budgets" ON public.budgets
  FOR ALL USING (
    household_id = (
      SELECT household_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

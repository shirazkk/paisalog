# Document 06 — Implementation Plan

---

## Phase 1: Project Setup
- Init Next.js 14 project with TypeScript: `npx create-next-app@latest paisa-log --typescript --tailwind --app`
- Install dependencies: `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`,
  `next-pwa`, `react-hook-form`, `zod`, `date-fns`, `lucide-react`, `clsx`, `tailwind-merge`
- Create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`
- Set up Supabase project (free tier) — copy keys to env file
- Configure `next-pwa` in `next.config.js` — service worker + manifest
- Create `public/manifest.json` with app name, icons, theme color, display: standalone
- Set up folder structure: `/app`, `/components`, `/lib`, `/types`, `/hooks`
- Create Supabase client helper: `/lib/supabase/client.ts` and `/lib/supabase/server.ts`

**Done when:** App runs on localhost:3000, PWA manifest loads, Supabase connection verified in console.

---

## Phase 2: Database & Schema
- Open Supabase SQL editor — run migrations to create tables:
  - `households` (id, name, invite_code, created_at)
  - `profiles` (id, household_id, display_name, role, created_at)
  - `transactions` (id, household_id, logged_by, giver_id, receiver_id, amount, category,
    txn_date, note, logged_at)
- Add all indexes (household_id on transactions and profiles, txn_date, category, invite_code)
- Enable Row Level Security on all 3 tables
- Write and apply all RLS policies (see Schema doc)
- Create Supabase trigger: auto-insert into `profiles` when new auth user signs up
- Seed test data: 2 users, 1 household, 10 sample transactions

**Done when:** All tables exist with correct columns, RLS verified (user can't read other household's data), test data queryable.

---

## Phase 3: Authentication
- Build `/app/(auth)/login/page.tsx` — email + password form, Supabase signInWithPassword
- Build `/app/(auth)/signup/page.tsx` — name, email, password form, Supabase signUp
- Build `/app/(auth)/join-household/page.tsx` — create new household OR enter invite code
- Create `/app/api/households/create/route.ts` — generates random 6-digit code, inserts household, updates profile
- Create `/app/api/households/join/route.ts` — looks up invite code, links profile to household
- Set up middleware (`/middleware.ts`) — redirect unauthenticated users to /login
- Handle session persistence with `@supabase/auth-helpers-nextjs` cookies

**Done when:** User can sign up → join household → land on dashboard. Returning user can log in directly. Protected routes redirect correctly. Logout works.

---

## Phase 4: Dashboard Screen
- Build `/app/dashboard/page.tsx` — server component, fetches summary data
- Create `/app/api/dashboard/summary/route.ts` — returns: total this month, total all time,
  last transaction, per-category breakdown for current month
- Build `<SummaryCard>` component — shows amount + label, large and readable
- Build `<RecentTransactions>` component — last 5 transactions, each as a card
- Build `<TransactionCard>` component — direction (D→M or M→D with colored initials),
  amount bold, category badge pill, date, note snippet
- Add Supabase Realtime subscription — listen for new transactions on household channel,
  update recent list live

**Done when:** Dashboard shows real data, summary cards are accurate, recent transactions list updates in real time when partner logs something.

---

## Phase 5: Log Transaction Screen
- Build `<LogTransactionSheet>` — bottom sheet component (slides up from bottom)
- Form fields: Amount (number input, large), Direction (toggle: Dad→Mom / Mom→Dad),
  Category (button grid: Home, Grocery, Utility, Personal, Other), Date (date picker,
  defaults to today), Note (optional textarea, 200 char max)
- Wire up `react-hook-form` + `zod` validation schema
- Create `/app/api/transactions/route.ts` POST handler — validate, insert to DB
- On success: close sheet, show success toast, dashboard refreshes

**Done when:** User can fill form and save a transaction in under 10 seconds. Validation prevents bad data. Partner sees it within 2 seconds via Realtime.

---

## Phase 6: History Screen
- Build `/app/history/page.tsx` — client component with filter state
- Fetch all transactions for household, newest first
- Build `<CategoryFilter>` — horizontal scrollable pill buttons (All, Home, Grocery, Utility, Personal, Other)
- Build `<MonthFilter>` — dropdown or swipe to select month
- Render filtered list of `<TransactionCard>` components
- Build `/app/history/[id]/page.tsx` — transaction detail view, all fields expanded,
  shows "Logged by [name] on [date]"
- Create `/app/api/transactions/route.ts` GET handler — accept query params for category, month

**Done when:** History shows all transactions. Filtering by category and month works correctly. Detail view shows complete info.

---

## Phase 7: Settings Screen
- Build `/app/settings/page.tsx`
- Show: user's display name (editable), household invite code (with copy button),
  partner's name (read-only)
- Logout button → calls Supabase signOut → redirects to Login
- Edit display name → PATCH to profiles table

**Done when:** User can see household code to share with partner, edit their name, and log out.

---

## Phase 8: UI Polish
- Apply full color palette, Inter font, border radius, shadows from Design Brief
- Implement bottom tab navigation with active state styling
- Ensure all tap targets are minimum 48px
- Add loading skeletons for dashboard and history (while data fetches)
- Add empty states for dashboard and history (friendly messages + simple illustration)
- Add all error states (inline form errors, toast for server errors)
- Test on Android Chrome (primary) and Safari iOS (secondary)
- Verify PWA install prompt appears on Android
- Verify app works offline (shows cached data, shows "offline" banner for new actions)

**Done when:** App looks polished on mobile, all states handled, PWA installs correctly on Android.

---

## Phase 9: Testing
- Log in as Dad, log 5 transactions across different categories
- Log in as Mom on a different device, verify all 5 transactions are visible
- Test real-time: Dad logs while Mom's app is open — does Mom see it live?
- Test filters: filter by each category, verify correct results
- Test validation: try submitting with empty amount, letters in amount, no category
- Test invite code: create new household, copy code, join from second account
- Test offline: disable wifi, open app, verify recent history loads from cache
- Test PWA: install on Android home screen, open from icon, verify it opens standalone

**Done when:** All journeys work end-to-end. No console errors. Both users can use it independently.

---

## Phase 10: Deployment
- Push to GitHub repository
- Connect GitHub repo to Vercel — auto deploy on push to main
- Add all environment variables to Vercel project settings
- Set Supabase Auth `Site URL` to production Vercel URL
- Set Supabase Auth `Redirect URLs` to include production URL
- Run full smoke test on production URL
- Send production link to parents — walk Mom through one transaction together

**Done when:** App is live on Vercel URL, both parents successfully log in and use it on their phones.

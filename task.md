# PaisaLog — Build Task Tracker

## Phase 1: Project Setup
- `[x]` Init Next.js 14 project with TypeScript + Tailwind CSS
- `[x]` Install all dependencies (supabase-js, auth-helpers, next-pwa, react-hook-form, zod, date-fns, lucide-react, clsx, tailwind-merge)
- `[x]` Create `.env.local` with Supabase env vars (placeholder)
- `[x]` Configure next-pwa + manifest.json
- `[x]` Set up folder structure: /app, /components, /lib, /types, /hooks
- `[x]` Create Supabase client helpers: /lib/supabase/client.ts + /lib/supabase/server.ts
- `[x]` Set up Tailwind config with DESIGN.md tokens
- `[x]` Set up global CSS + Inter font in layout.tsx
- `[x]` Create Toast component + lib/toast.ts (error-handling skill)

## Phase 2: Database & Schema
- `[x]` Write full SQL migration (households, profiles, transactions tables)
- `[x]` Enable RLS on all 3 tables
- `[x]` Write and apply all RLS policies (supabase-rls skill)
- `[x]` Create auto-insert trigger for profiles on signup
- `[x]` Add all indexes

## Phase 3: Authentication
- `[x]` Build /app/(auth)/login/page.tsx
- `[x]` Build /app/(auth)/signup/page.tsx
- `[x]` Build /app/(auth)/join-household/page.tsx
- `[x]` Create /app/api/households/create/route.ts
- `[x]` Create /app/api/households/join/route.ts
- `[x]` Set up middleware.ts for protected routes

## Phase 4: Dashboard Screen
- `[x]` Build /app/dashboard/page.tsx
- `[x]` Create /app/api/dashboard/summary/route.ts
- `[x]` Build <SummaryCard> component
- `[x]` Build <RecentTransactions> component
- `[x]` Build <TransactionCard> component
- `[x]` Add Supabase Realtime subscription

## Phase 5: Log Transaction Screen
- `[x]` Build <LogTransactionSheet> bottom sheet
- `[x]` Form: Amount, Direction toggle, Category grid, Date picker, Note
- `[x]` Wire react-hook-form + zod validation (form-validation skill)
- `[x]` Create /app/api/transactions/route.ts POST handler
- `[x]` Success toast + dashboard refresh

## Phase 6: History Screen
- `[x]` Build /app/history/page.tsx with filter state
- `[x]` Build <CategoryFilter> horizontal pill buttons
- `[x]` Build <MonthFilter> dropdown
- `[x]` Build /app/history/[id]/page.tsx transaction detail view
- `[x]` Create GET handler in /app/api/transactions/route.ts

## Phase 7: Settings Screen
- `[x]` Build /app/settings/page.tsx
- `[x]` Display name editing + household invite code copy
- `[x]` Logout button

## Phase 8: UI Polish
- `[x]` Bottom tab navigation with FAB
- `[x]` Loading skeletons
- `[x]` Empty states
- `[x]` PWA testing

## Phase 9: Testing
- `[ ]` End-to-end user journeys
- `[ ]` Realtime sync verification

## Phase 10: Deployment
- `[ ]` Deploy to Vercel

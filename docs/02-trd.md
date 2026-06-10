# Document 02 — TRD (Technical Requirements Document)

Frontend:        Next.js 14 (App Router) + TypeScript + Tailwind CSS
PWA:             next-pwa (service worker, manifest, offline support, installable)
Backend:         Supabase (BaaS — handles DB, Auth, Realtime, and API out of the box)
Database:        PostgreSQL via Supabase (hosted, free tier sufficient for family use)
Auth:            Supabase Auth — email + password (simple, no OAuth needed for family app)
Realtime:        Supabase Realtime — both users see new transactions instantly without refresh
Hosting:         Vercel (frontend + Next.js API routes) — free tier
DB Hosting:      Supabase — free tier (500MB, plenty for a family log)

---

## Third-Party APIs

- Supabase          → Database + Auth + Realtime — FREE tier
- Vercel            → Hosting + deployment — FREE tier
- (No payment APIs, no SMS, no external services needed for v1)

---

## Key Libraries

- next-pwa                  → PWA manifest, service worker, offline caching
- @supabase/supabase-js     → Supabase client for DB queries, auth, realtime subscriptions
- @supabase/auth-helpers-nextjs → Server-side session handling in Next.js App Router
- date-fns                  → Date formatting for transaction timestamps
- react-hook-form           → Simple form handling for transaction logging
- zod                       → Input validation (amount must be number, category required, etc.)
- lucide-react              → Clean icon set for categories and UI elements
- tailwind-merge + clsx     → Conditional Tailwind class management

---

## Environment Variables

- NEXT_PUBLIC_SUPABASE_URL         → Supabase project URL (public, safe to expose)
- NEXT_PUBLIC_SUPABASE_ANON_KEY    → Supabase anon/public key (public, safe to expose)
- SUPABASE_SERVICE_ROLE_KEY        → Server-only admin key (NEVER expose to client)

---

## Architecture Overview

```
[Browser / PWA]
      |
      ↓
[Next.js 14 — App Router]
  - /app/(auth)/login         → Login page
  - /app/(auth)/signup        → Signup page
  - /app/dashboard            → Main dashboard (protected)
  - /app/log                  → Log new transaction (protected)
  - /app/history              → Full transaction history (protected)
  - /app/api/...              → Server-side API routes if needed
      |
      ↓
[Supabase]
  - Auth (JWT session management)
  - PostgreSQL DB (transactions, households, users)
  - Realtime (live updates when partner logs a transaction)
```

---

## PWA Configuration

- manifest.json:  name, short_name, icons, theme_color (#1a56db), display: standalone
- Service Worker: cache static assets, offline fallback page
- Install prompt:  shown on first visit on mobile (Android Chrome auto-prompts)
- Icons:          192x192 and 512x512 PNG (simple rupee/wallet icon)

---

## Constraints

- Must work on mobile browsers (Android Chrome primary, Safari iOS secondary)
- Must stay 100% within free tiers (no monthly cost for family use)
- Must be usable with one hand on a phone
- No complex onboarding — Mom should be able to use it after a 2-minute walkthrough
- Realtime sync required — both users must see updates without manual refresh
- Must work offline for viewing recent history (PWA service worker cache)

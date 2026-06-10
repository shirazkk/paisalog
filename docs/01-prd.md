# Document 01 — PRD (Product Requirements Document)

App Name:        PaisaLog (or "Family Wallet")
Tagline:         Never fight about money again — every rupee logged, shared, and remembered.

Problem:         Couples and family members frequently give money to each other for different
                 purposes (home expenses, groceries, utility bills, personal use) but forget
                 the reason or whether it was given at all. This leads to repeated arguments
                 and mistrust. There is no shared, simple record both parties can check.

Target User:     A married couple (40s–60s), one more tech-comfortable than the other.
                 They share household finances but manage money informally with no record-keeping.
                 They need something dead simple — open app, log money, see history. Nothing more.

---

## Core Features (Must Have — v1)

- **Log a transaction** — Record money given with: amount, category (home expenses, grocery,
  utility, personal, other), date, and an optional short note
- **Shared ledger** — Both husband and wife see the same transaction history in real time
- **Who gave to whom** — Each entry shows direction: "Dad → Mom" or "Mom → Dad"
- **Category filter** — Filter history by category (e.g. show only "Home Expenses")
- **Simple dashboard** — Total given this month, last transaction, quick summary per category
- **PWA install** — Works offline, installable on Android/iOS home screen, no app store needed
- **Two-user family account** — One shared family "household" — Dad and Mom each have their
  own login but see the same data

---

## Nice to Have (v2)

- Monthly summary report (shareable as image or PDF)
- Push notifications: "Dad logged a transaction — tap to view"
- Recurring transaction reminder (e.g. "Monthly rent — remind me to log this")
- Balance tracker — who owes whom overall
- Photo attachment — snap a receipt as proof
- Urdu/regional language support

---

## Out of Scope (v1)

- No payments or bank integration — this is a LOG only, not a payment app
- No more than 2 users per household (no extended family multi-user setup)
- No budgeting, forecasting, or charts (v2 only)
- No SMS or email notifications (v2)
- No admin panel or multi-household management

---

## User Stories

- As Dad, I want to log "I gave 5000 rupees for home expenses" so that Mom can see the
  record and we stop arguing about it later.
- As Mom, I want to see all transactions Dad logged this month filtered by category so that
  I can confirm what was given for what purpose.
- As either parent, I want to open the app on my phone browser and see the latest transaction
  immediately so that I don't need to ask the other person.
- As either parent, I want the app to be so simple that I can log a transaction in under
  10 seconds without any confusion.

---

## Success Metrics

- Both parents can log and view a transaction independently within their first session
- Transaction logging takes under 10 seconds from open to saved
- Zero confusion — no support calls from Mom asking "how do I use this"
- Transaction history is visible to both users within 2 seconds of logging
- App installs successfully as PWA on both Android phones

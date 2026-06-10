# Document 05 — Backend Schema

---

## Tables

### Table: households
Represents a family unit. Dad and Mom both belong to the same household.

| Column        | Type        | Notes                                      |
|---------------|-------------|--------------------------------------------|
| id            | uuid        | Primary key, auto-generated                |
| name          | varchar(100)| e.g. "Ali Family"                          |
| invite_code   | varchar(6)  | 6-digit code to invite partner — UNIQUE    |
| created_at    | timestamptz | Auto set on insert                         |

---

### Table: profiles
Extended user info linked to Supabase Auth user. One row per user.

| Column        | Type        | Notes                                          |
|---------------|-------------|------------------------------------------------|
| id            | uuid        | Primary key = Supabase auth.users.id (FK)      |
| household_id  | uuid        | FK → households.id (nullable until joined)     |
| display_name  | varchar(50) | "Dad" / "Mom" / real name                      |
| role          | varchar(10) | "dad" or "mom" (used for color tagging in UI)  |
| created_at    | timestamptz | Auto set on insert                             |

---

### Table: transactions
The core data. Every money exchange is one row.

| Column        | Type          | Notes                                                  |
|---------------|---------------|--------------------------------------------------------|
| id            | uuid          | Primary key, auto-generated                            |
| household_id  | uuid          | FK → households.id — scopes all queries to family      |
| logged_by     | uuid          | FK → profiles.id — who entered this record             |
| giver_id      | uuid          | FK → profiles.id — who gave the money                  |
| receiver_id   | uuid          | FK → profiles.id — who received the money              |
| amount        | numeric(10,2) | Amount in PKR — always positive                        |
| category      | varchar(30)   | ENUM: home_expenses, grocery, utility, personal, other |
| txn_date      | date          | The date money was given (can differ from logged_at)   |
| note          | text          | Optional short note (max 200 chars)                    |
| logged_at     | timestamptz   | When the record was created — auto set                 |

---

## Relationships

```
households  ──< profiles        (one household → many profiles, max 2 for v1)
households  ──< transactions    (one household → many transactions)
profiles    ──< transactions    (logged_by, giver_id, receiver_id all FK to profiles)
```

---

## Indexes

| Table          | Column        | Reason                                          |
|----------------|---------------|-------------------------------------------------|
| profiles       | household_id  | Fetch both members of a household quickly       |
| transactions   | household_id  | All queries filter by household — must be fast  |
| transactions   | txn_date      | Sorting and filtering by date/month             |
| transactions   | category      | Filtering by category                           |
| households     | invite_code   | Lookup by 6-digit code on join                  |

---

## Auth

Provider:        Supabase Auth (email + password)
Session:         JWT stored in httpOnly cookie (handled by @supabase/auth-helpers-nextjs)
Password reset:  Supabase built-in email reset flow

---

## Row-Level Security (RLS) Rules

All tables have RLS enabled. Policies:

**households:**
- SELECT: user's profile.household_id = households.id
- No direct INSERT from client (created via server API route on signup)

**profiles:**
- SELECT: own row OR same household_id
- UPDATE: own row only

**transactions:**
- SELECT: household_id matches user's household_id
- INSERT: household_id matches user's household_id (user can only log for their family)
- UPDATE: logged_by = current user (can only edit own entries)
- DELETE: logged_by = current user

---

## User Roles

| Role   | Permissions                                                         |
|--------|---------------------------------------------------------------------|
| member | Log transactions, view all household transactions, edit own entries |

(No admin role needed for v1 — it's a 2-person family app)

---

## File Storage

Not required for v1. No receipts or images.

---

## Sensitive Fields

- Passwords: handled entirely by Supabase Auth — never stored in our DB
- No payment data, no bank info — this is a log-only app

---

## API Endpoints (Next.js API Routes)

| Method | Path                          | Description                                    |
|--------|-------------------------------|------------------------------------------------|
| POST   | /api/households/create        | Create household + generate invite code        |
| POST   | /api/households/join          | Join household via invite code                 |
| GET    | /api/transactions             | Fetch all transactions for user's household    |
| POST   | /api/transactions             | Log a new transaction                          |
| PATCH  | /api/transactions/[id]        | Edit a transaction (own only)                  |
| DELETE | /api/transactions/[id]        | Delete a transaction (own only)                |
| GET    | /api/dashboard/summary        | Monthly totals + last transaction (aggregated) |

All endpoints are protected — valid Supabase session required.

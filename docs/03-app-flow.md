# Document 03 — App Flow

---

## All Screens

1. **Login Screen**         → Email + password login. Link to signup.
2. **Signup Screen**        → Name, email, password. Creates user + joins/creates household.
3. **Join Household Screen**→ Enter a 6-digit household code to link with partner's account.
4. **Dashboard**            → Summary cards (this month total, last transaction), quick log button,
                              last 5 transactions preview.
5. **Log Transaction Screen**→ Form: amount, direction (who gave whom), category, date, note.
6. **History Screen**       → Full scrollable list of all transactions. Filter by category/month.
7. **Transaction Detail**   → Single transaction expanded view — all fields, who logged it, when.
8. **Profile / Settings**   → User name, household code display, logout button.

---

## Navigation Type

Bottom tab navigation (mobile-first PWA):
- Tab 1: 🏠 Dashboard
- Tab 2: ➕ Log (center, prominent)
- Tab 3: 📋 History
- Tab 4: ⚙️ Settings

---

## First Screen (New Visitor)

→ Login Screen (with "Don't have an account? Sign up" link at bottom)

---

## Auth Flow

```
New User:
  Signup → [Enter name, email, password] → Account created
         → Join Household Screen
         → Option A: "Create new household" → generates 6-digit code to share with partner
         → Option B: "Enter household code" → links to existing household
         → Dashboard

Returning User:
  Login → [Enter email, password] → Dashboard (direct, no re-onboarding)

Forgot Password:
  Login → "Forgot password?" → Enter email → Reset link sent → Reset page → Login
```

---

## Core User Journey 1 — Dad logs a money transaction

1. Dad opens app (PWA on home screen)
2. App opens directly to Dashboard (already logged in)
3. Dad taps the big ➕ "Log Money" button
4. Log Transaction screen appears
5. Dad enters: Amount = 5000, Direction = "Dad → Mom", Category = "Home Expenses",
   Date = today (pre-filled), Note = "monthly home budget"
6. Dad taps "Save"
7. System saves to DB, Supabase Realtime pushes update
8. Dad sees confirmation toast: "Transaction saved ✓"
9. Dad is redirected back to Dashboard
10. Dashboard now shows the new transaction at the top of "Recent" list

---

## Core User Journey 2 — Mom checks what was given

1. Mom opens app on her phone
2. Goes to History tab
3. Sees full list of all transactions — newest first
4. Taps category filter → selects "Home Expenses"
5. List filters to show only home expense entries
6. Mom taps on a transaction to see full detail
7. Detail screen shows: amount, date, who gave, category, note, who logged it
8. Mom is satisfied — no argument needed 😄

---

## Core User Journey 3 — Real-time sync (both phones open)

1. Both Dad and Mom have app open on their phones
2. Dad logs a new transaction on his phone
3. Mom's History screen automatically updates within 2 seconds (Supabase Realtime)
4. Mom sees a subtle "New transaction added" banner at the top without refreshing
5. Mom taps it → sees the new entry

---

## Empty States

- Dashboard (no transactions yet): Friendly message — "No transactions yet. Tap ➕ to log
  your first one!" with a simple illustration.
- History (no transactions): "Your transaction history will appear here."
- History (filter returns nothing): "No transactions found for this category/month."

---

## Error States

- Login fails (wrong password): Inline error under password field — "Incorrect email or password."
- Save transaction fails (network): Toast — "Couldn't save. Check your connection and try again."
- Invalid amount entered (letters, zero): Inline validation — "Please enter a valid amount."
- Household code wrong: "That code doesn't match any household. Please check with your partner."
- Session expired: Redirect to Login with message — "Your session expired. Please log in again."

---

## Redirects

- After successful login → Dashboard
- After signup + household join → Dashboard
- After saving a transaction → Dashboard (with success toast)
- After logout → Login screen
- Visiting protected route while logged out → Login screen
- After password reset → Login screen with "Password updated" message

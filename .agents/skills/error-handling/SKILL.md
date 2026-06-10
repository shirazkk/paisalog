---
name: error-handling
description: >
  Use this skill whenever writing any API call, async function, form submission,
  or database operation in PaisaLog. Triggers on: "try catch", "API route", "save
  transaction", "fetch data", "async", "await", "error", "toast", "network fail",
  or any operation that could fail. Never write an async function without following
  this skill — unhandled errors break the app for Mom and Dad.
---

# Error Handling Skill — PaisaLog

Every error in PaisaLog must be caught and shown as a friendly, human-readable
message. Mom and Dad must never see a raw error, a blank screen, or a crashed app.

---

## Toast System

First, create the toast utility at `/lib/toast.ts`:

```typescript
// Simple toast using a custom event — no extra library needed
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const event = new CustomEvent('show-toast', { detail: { message, type } })
  window.dispatchEvent(event)
}
```

Create the Toast component at `/components/Toast.tsx`:

```tsx
'use client'
import { useState, useEffect } from 'react'

export function Toast() {
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null)

  useEffect(() => {
    const handler = (e: any) => {
      setToast(e.detail)
      setTimeout(() => setToast(null), 3000)
    }
    window.addEventListener('show-toast', handler)
    return () => window.removeEventListener('show-toast', handler)
  }, [])

  if (!toast) return null

  const colors = {
    success: 'bg-green-600 text-white',
    error:   'bg-red-600 text-white',
    info:    'bg-gray-800 text-white'
  }

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 px-4 py-3 rounded-xl
                     text-[15px] font-medium shadow-lg ${colors[toast.type]}
                     animate-fade-in`}>
      {toast.message}
    </div>
  )
}
```

Add `<Toast />` to `/app/layout.tsx` once — it works everywhere.

---

## Standard API Route Pattern

Every `/app/api/` route must follow this pattern:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // 1. Validate auth
    const supabase = createServerComponentClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse and validate body
    const body = await request.json()
    // validate with zod here...

    // 3. Do the database operation
    const { data, error } = await supabase.from('transactions').insert(...)
    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })

  } catch (err: any) {
    console.error('[API Error]', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
```

---

## Standard Client-Side Fetch Pattern

```typescript
const saveTransaction = async (data: TransactionFormValues) => {
  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!res.ok) {
      const json = await res.json()
      throw new Error(json.error || 'Request failed')
    }

    showToast('Transaction saved ✓', 'success')
    return await res.json()

  } catch (err: any) {
    if (!navigator.onLine) {
      showToast('No internet connection. Please try again.', 'error')
    } else {
      showToast("Couldn't save. Please try again.", 'error')
    }
    throw err // re-throw so form knows to stop loading state
  }
}
```

---

## Error Message Dictionary

Never show raw errors to the user. Map them to friendly messages:

| Scenario                    | Message to Show                                    |
|-----------------------------|----------------------------------------------------|
| Saved successfully          | "Transaction saved ✓"                             |
| Network/offline             | "No internet connection. Please try again."       |
| Server error (5xx)          | "Couldn't save. Please try again."                |
| Wrong password on login     | "Incorrect email or password."                    |
| Wrong household invite code | "That code doesn't match. Check with your partner."|
| Session expired (401)       | Redirect to /login — no toast needed               |
| Amount invalid              | "Please enter a valid amount." (inline)            |
| Category not selected       | "Please select a category." (inline)               |
| Future date selected        | "Date cannot be in the future." (inline)           |

---

## Session Expiry Handling

In `/lib/supabase/client.ts`, add an auth state listener:

```typescript
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
    if (event === 'SIGNED_OUT') {
      window.location.href = '/login'
    }
  }
})
```

---

## Rules

1. Every `async` function must have a `try/catch`
2. Every API route returns `{ error: string }` on failure — never raw exceptions
3. Toasts auto-dismiss after 3 seconds — never require user to close them
4. Inline errors on form fields (from form-validation skill) + toasts for server errors
5. Log errors to console with `[API Error]` prefix for debugging — never log to user
6. Check `navigator.onLine` before showing generic error — offline gets specific message

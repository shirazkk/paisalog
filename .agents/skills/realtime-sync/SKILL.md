---
name: realtime-sync
description: >
  Use this skill whenever implementing live data updates in PaisaLog. Triggers on:
  "realtime", "live update", "auto refresh", "partner sees transaction", "Supabase
  subscribe", dashboard live data, history screen updates, or any feature where one
  user's action should appear on the other user's screen without a page refresh.
  Always read this before adding any Supabase subscription.
---

# Realtime Sync Skill — PaisaLog

When Dad logs a transaction, Mom's screen must update within 2 seconds automatically.
This skill implements that using Supabase Realtime channels.

---

## Setup — Enable Realtime on Table

In Supabase dashboard → Database → Replication → enable `transactions` table for INSERT events.

Or via SQL:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
```

---

## The Realtime Hook

Create this reusable hook at `/hooks/useRealtimeTransactions.ts`:

```typescript
import { useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface UseRealtimeTransactionsProps {
  householdId: string
  onNewTransaction: (transaction: any) => void
}

export function useRealtimeTransactions({
  householdId,
  onNewTransaction
}: UseRealtimeTransactionsProps) {
  const supabase = createClientComponentClient()
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!householdId) return

    // Create channel scoped to this household only
    channelRef.current = supabase
      .channel(`transactions:${householdId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',           // Only new transactions — not edits or deletes
          schema: 'public',
          table: 'transactions',
          filter: `household_id=eq.${householdId}`
        },
        (payload) => {
          onNewTransaction(payload.new)
        }
      )
      .subscribe()

    // Cleanup on unmount — critical, prevents memory leaks
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [householdId]) // Only re-subscribe if householdId changes
}
```

---

## Using the Hook in Dashboard

```typescript
'use client'
import { useState } from 'react'
import { useRealtimeTransactions } from '@/hooks/useRealtimeTransactions'

export function RecentTransactions({ initialData, householdId }) {
  const [transactions, setTransactions] = useState(initialData)
  const [showBanner, setShowBanner] = useState(false)

  useRealtimeTransactions({
    householdId,
    onNewTransaction: (newTxn) => {
      // Prepend to top of list
      setTransactions(prev => [newTxn, ...prev].slice(0, 5))

      // Show subtle banner for 3 seconds
      setShowBanner(true)
      setTimeout(() => setShowBanner(false), 3000)
    }
  })

  return (
    <div>
      {showBanner && (
        <div className="bg-blue-50 text-blue-700 text-sm px-4 py-2 rounded-lg mb-3
                        animate-fade-in flex items-center gap-2">
          <span>🔄</span> New transaction added
        </div>
      )}
      {transactions.map(txn => (
        <TransactionCard key={txn.id} transaction={txn} />
      ))}
    </div>
  )
}
```

---

## Offline Handling

Supabase Realtime requires an internet connection. Handle gracefully:

```typescript
.subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    console.log('Realtime connected')
  }
  if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
    // Silently fail — user will see data on next manual refresh
    // Do NOT show an error to the user for this
    console.warn('Realtime unavailable — offline mode')
  }
})
```

Never show a scary error to the user if realtime fails — it's a nice-to-have, not critical.
The data is always safe in the database; they just won't see live updates until they refresh.

---

## Rules

1. Always filter by `household_id` — never subscribe to all transactions globally
2. Always clean up with `supabase.removeChannel()` on unmount
3. Only listen to `INSERT` events in v1 (not UPDATE or DELETE)
4. Cap the displayed list at 5 items on dashboard after prepending
5. The banner auto-dismisses after 3 seconds — never requires user action

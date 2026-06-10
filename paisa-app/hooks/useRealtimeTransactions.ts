import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

interface UseRealtimeTransactionsProps {
  householdId: string
  onNewTransaction: (transaction: any) => void
}

export function useRealtimeTransactions({
  householdId,
  onNewTransaction
}: UseRealtimeTransactionsProps) {
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!householdId) return

    // Create channel scoped to this household only
    channelRef.current = supabase
      .channel(`transactions:${householdId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Only new transactions — not edits or deletes
          schema: 'public',
          table: 'transactions',
          filter: `household_id=eq.${householdId}`
        },
        (payload) => {
          onNewTransaction(payload.new)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime connected')
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('Realtime unavailable — offline mode')
        }
      })

    // Cleanup on unmount — critical, prevents memory leaks
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [householdId]) // Only re-subscribe if householdId changes
}

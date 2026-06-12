'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRealtimeTransactions } from '@/hooks/useRealtimeTransactions'
import { showToast } from '@/lib/toast'
import { RefreshCw } from 'lucide-react'
import { Transaction, Profile } from '@/types'
import { DashboardGreeting } from '@/components/dashboard/DashboardGreeting'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'

export default function DashboardPage() {
  const [data, setData] = useState<{
    profile: { id: string; displayName: string; role: string; householdId: string }
    summary: { thisMonthTotal: number; lastMonthTotal: number; allTimeTotal: number; changePercent: number }
    recentTransactions: Transaction[]
    members: Profile[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [realtimeNotify, setRealtimeNotify] = useState(false)

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/summary')
      if (!res.ok) throw new Error('Failed to load dashboard data')
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error(err)
      showToast("Couldn't load dashboard. Please pull to refresh.", 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary()
    // We removed 'transaction-saved' listener because useRealtimeTransactions 
    // will catch the insert and trigger the update for both partners.
  }, [fetchSummary])

  useRealtimeTransactions({
    householdId: data?.profile.householdId || '',
    onNewTransaction: (newTxn) => {
      setData((prev) => {
        if (!prev) return null
        const exists = prev.recentTransactions.some((t) => t.id === newTxn.id)
        if (exists) return prev

        // If it's a new transaction, we need to update the summary
        fetchSummary()

        const updatedRecent = [newTxn, ...prev.recentTransactions].slice(0, 5)
        if (newTxn.logged_by !== prev.profile.id) {
          setRealtimeNotify(true)
          setTimeout(() => setRealtimeNotify(false), 3000)
        }
        return { ...prev, recentTransactions: updatedRecent }
      })
    },
  })

  if (loading) {
    return (
      <div className="page-content" style={{ paddingTop: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Greeting skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="skeleton" style={{ height: '13px', width: '80px', borderRadius: '6px' }} />
          <div className="skeleton" style={{ height: '26px', width: '180px', borderRadius: '8px' }} />
        </div>
        {/* Cards skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="skeleton" style={{ height: '120px', borderRadius: '12px' }} />
          <div className="skeleton" style={{ height: '120px', borderRadius: '12px' }} />
        </div>
        {/* Transactions skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div className="skeleton" style={{ height: '16px', width: '100px', borderRadius: '6px' }} />
          <div className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />
          <div className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />
        </div>
      </div>
    )
  }

  if (!data) return null

  const isMom = data.profile.role === 'mom'
  const isDad = data.profile.role === 'dad'

  return (
    <div
      className="page-content"
      style={{
        paddingTop: 'var(--space-8)',
        paddingBottom: 'calc(var(--nav-height) + var(--space-8))',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
    >
      {/* ── Greeting ── */}
      <DashboardGreeting 
        displayName={data.profile.displayName} 
        isDad={isDad} 
        isMom={isMom} 
      />

      {/* ── Realtime Notification ── */}
      {realtimeNotify && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            fontSize: '13px',
            fontWeight: 500,
            padding: '10px 14px',
            borderRadius: 'var(--border-radius)',
            border: '1px solid rgba(26, 86, 219, 0.2)',
          }}
        >
          <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
          <span>New transaction added by your partner</span>
        </div>
      )}

      {/* ── Summary Cards ── */}
      <SummaryCards summary={data.summary} />

      {/* ── Recent Transactions ── */}
      <RecentTransactions transactions={data.recentTransactions} members={data.members} />
    </div>
  )
}
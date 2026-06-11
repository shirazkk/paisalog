'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useRealtimeTransactions } from '@/hooks/useRealtimeTransactions'
import { TransactionCard } from '@/components/TransactionCard'
import { formatPKR } from '@/lib/utils'
import { showToast } from '@/lib/toast'
import { TrendingUp, TrendingDown, CreditCard, RefreshCw, Wallet, ArrowUpRight } from 'lucide-react'
import { Transaction, Profile } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
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
    const handleSaved = () => fetchSummary()
    window.addEventListener('transaction-saved', handleSaved)
    return () => window.removeEventListener('transaction-saved', handleSaved)
  }, [fetchSummary])

  useRealtimeTransactions({
    householdId: data?.profile.householdId || '',
    onNewTransaction: (newTxn) => {
      setData((prev) => {
        if (!prev) return null
        const exists = prev.recentTransactions.some((t) => t.id === newTxn.id)
        if (exists) return prev
        const updatedRecent = [newTxn, ...prev.recentTransactions].slice(0, 5)
        if (newTxn.logged_by !== prev.profile.id) {
          setRealtimeNotify(true)
          setTimeout(() => setRealtimeNotify(false), 3000)
        }
        fetchSummary()
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

  const isUp = data.summary.changePercent >= 0
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
      <section style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
          Welcome back
        </p>
        <h1 className="text-page-title">
          Hi, {data.profile.displayName} {isDad ? '👋' : isMom ? '👋' : '👋'}
        </h1>
      </section>

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
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        {/* This Month */}
        <div
          className="card"
          style={{
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '120px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)' }}>
              This Month
            </p>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: isUp ? 'var(--color-success-light)' : 'var(--color-error-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isUp
                ? <TrendingUp size={14} color="var(--color-success)" />
                : <TrendingDown size={14} color="var(--color-error)" />
              }
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.3px', lineHeight: 1 }}>
              {formatPKR(data.summary.thisMonthTotal)}
            </p>
            <p style={{ fontSize: '12px', fontWeight: 600, color: isUp ? 'var(--color-success)' : 'var(--color-error)' }}>
              {isUp ? '+' : ''}{data.summary.changePercent}% vs last month
            </p>
          </div>
        </div>

        {/* All Time */}
        <div
          className="card"
          style={{
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '120px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)' }}>
              Total Given
            </p>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CreditCard size={14} color="var(--color-primary)" />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.3px', lineHeight: 1 }}>
              {formatPKR(data.summary.allTimeTotal)}
            </p>
            <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)' }}>
              All time
            </p>
          </div>
        </div>
      </section>

      {/* ── Recent Transactions ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="text-section-heading">Recent</h2>
          <button
            onClick={() => router.push('/history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-primary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
            }}
          >
            View All <ArrowUpRight size={13} />
          </button>
        </div>

        {data.recentTransactions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {data.recentTransactions.map((txn) => (
              <TransactionCard
                key={txn.id}
                transaction={txn}
                members={data.members}
                onClick={() => router.push(`/history/${txn.id}`)}
              />
            ))}
          </div>
        ) : (
          <div
            className="card"
            style={{
              padding: 'var(--space-8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-2)',
              borderStyle: 'dashed',
              borderColor: 'var(--color-border)',
              borderWidth: '2px',
              backgroundColor: 'var(--color-bg)',
              boxShadow: 'none',
            }}
          >
            <Wallet size={28} color="var(--color-text-muted)" strokeWidth={1.5} />
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
              No transactions yet
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              Tap the + button below to log your first one
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
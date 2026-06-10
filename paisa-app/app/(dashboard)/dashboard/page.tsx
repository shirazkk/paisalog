'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useRealtimeTransactions } from '@/hooks/useRealtimeTransactions'
import { TransactionCard } from '@/components/TransactionCard'
import { formatPKR } from '@/lib/utils'
import { showToast } from '@/lib/toast'
import { TrendingUp, TrendingDown, CreditCard, Shield, RefreshCw } from 'lucide-react'
import { Transaction, Profile } from '@/types'

/**
 * Hallmark · macrostructure: Workbench · tone: Utilitarian+Warm · anchor hue: blue
 * Last build: none (new session)
 */
export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<{
    profile: { displayName: string; role: string }
    summary: { thisMonthTotal: number; lastMonthTotal: number; allTimeTotal: number; changePercent: number }
    recentTransactions: Transaction[]
    members: Profile[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [realtimeNotify, setRealtimeNotify] = useState(false)

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/summary')
      if (!res.ok) {
        throw new Error('Failed to load dashboard data')
      }
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
    householdId: data?.members[0]?.household_id || '',
    onNewTransaction: (newTxn) => {
      setData((prev) => {
        if (!prev) return null
        const exists = prev.recentTransactions.some((t) => t.id === newTxn.id)
        if (exists) return prev
        const updatedRecent = [newTxn, ...prev.recentTransactions].slice(0, 5)
        setRealtimeNotify(true)
        setTimeout(() => setRealtimeNotify(false), 3000)
        fetchSummary()
        return { ...prev, recentTransactions: updatedRecent }
      })
    },
  })

  if (loading) {
    return (
      <div className="page-content pt-4 space-y-6">
        <div className="space-y-2">
          <div className="h-4 w-24 skeleton"></div>
          <div className="h-8 w-48 skeleton"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 rounded-xl skeleton"></div>
          <div className="h-32 rounded-xl skeleton"></div>
        </div>
        <div className="space-y-4">
          <div className="h-5 w-40 skeleton"></div>
          <div className="h-24 rounded-xl skeleton"></div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const isUp = data.summary.changePercent >= 0
  const isMom = data.profile.role === 'mom'
  const isDad = data.profile.role === 'dad'

  return (
    <div className="page-content" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'calc(var(--nav-height) + var(--space-8))', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Greeting */}
      <section style={{ gap: 'var(--space-1)', display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Welcome back</p>
        <h2 className="text-page-title">
          Hi, {data.profile.displayName} {isDad ? 'Dad 👋' : isMom ? 'Mom 👋' : '👋'}
        </h2>
      </section>

      {/* Summary Grid */}
      <section className="grid grid-cols-2" style={{ gap: 'var(--space-4)' }}>
        <div className="card flex flex-col justify-between" style={{ height: '120px', padding: 'var(--space-4)' }}>
          <div className="flex items-center justify-between">
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>This Month</p>
            {isUp ? <TrendingUp size={16} color="var(--color-success)" /> : <TrendingDown size={16} color="var(--color-error)" />}
          </div>
          <div>
            <p style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text)' }}>{formatPKR(data.summary.thisMonthTotal)}</p>
            <p style={{ fontSize: '12px', fontWeight: 500, color: isUp ? 'var(--color-success)' : 'var(--color-error)' }}>
              {isUp ? '+' : ''}{data.summary.changePercent}%
            </p>
          </div>
        </div>

        <div className="card flex flex-col justify-between" style={{ height: '120px', padding: 'var(--space-4)' }}>
          <div className="flex items-center justify-between">
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Total Given</p>
            <CreditCard size={16} color="var(--color-primary)" />
          </div>
          <div>
            <p style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text)' }}>{formatPKR(data.summary.allTimeTotal)}</p>
            <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)' }}>All time</p>
          </div>
        </div>
      </section>

      {/* Realtime Notification */}
      {realtimeNotify && (
        <div style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: '13px', padding: '10px 16px', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-primary)' }} className="flex items-center gap-2 animate-toast-in">
          <RefreshCw size={14} className="animate-spin" />
          <span>New transaction added</span>
        </div>
      )}

      {/* Transactions */}
      <section style={{ gap: 'var(--space-4)', display: 'flex', flexDirection: 'column' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-section-heading text-text-primary">Recent</h3>
          <button
            onClick={() => router.push('/history')}
            className="text-primary text-[12px] font-semibold hover:underline bg-transparent border-none cursor-pointer"
          >
            View All
          </button>
        </div>

        {data.recentTransactions.length > 0 ? (
          <div style={{ gap: 'var(--space-3)', display: 'flex', flexDirection: 'column' }}>
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
          <div className="card p-8 text-center border-dashed border-2 flex flex-col items-center gap-2">
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>No transactions yet</p>
          </div>
        )}
      </section>

      {/* Info Banner */}
      <section style={{ backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: 'var(--border-radius)', padding: 'var(--space-4)' }} className="shadow-sm">
        <h4 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={16} /> Shared Wallet Security
        </h4>
        <p style={{ fontSize: '13px', marginTop: '4px', opacity: 0.9 }}>
          Your financial logs are synchronized instantly.
        </p>
      </section>
    </div>
  )
}

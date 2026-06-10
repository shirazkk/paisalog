'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useRealtimeTransactions } from '@/hooks/useRealtimeTransactions'
import { TransactionCard } from '@/components/TransactionCard'
import { formatPKR } from '@/lib/utils'
import { showToast } from '@/lib/toast'
import { TrendingUp, TrendingDown, CreditCard, Shield, RefreshCw } from 'lucide-react'
import { Transaction, Profile } from '@/types'

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

    // Listen for transaction-saved custom event from layout
    const handleSaved = () => {
      fetchSummary()
    }
    window.addEventListener('transaction-saved', handleSaved)
    return () => window.removeEventListener('transaction-saved', handleSaved)
  }, [fetchSummary])

  // Subscribing to realtime sync
  useRealtimeTransactions({
    householdId: data?.members[0]?.household_id || '',
    onNewTransaction: (newTxn) => {
      // Avoid adding duplicate transactions
      setData((prev) => {
        if (!prev) return null
        const exists = prev.recentTransactions.some((t) => t.id === newTxn.id)
        if (exists) return prev

        // Prepend and trim to latest 5
        const updatedRecent = [newTxn, ...prev.recentTransactions].slice(0, 5)

        // Show live notify banner
        setRealtimeNotify(true)
        setTimeout(() => setRealtimeNotify(false), 3000)

        // Trigger updating totals
        fetchSummary()

        return {
          ...prev,
          recentTransactions: updatedRecent,
        }
      })
    },
  })

  if (loading) {
    return (
      <div className="page-content pt-4 space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-24 skeleton"></div>
          <div className="h-8 w-48 skeleton"></div>
        </div>

        {/* Bento Summary Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 rounded-xl skeleton"></div>
          <div className="h-32 rounded-xl skeleton"></div>
        </div>

        {/* Transactions Skeleton */}
        <div className="space-y-4">
          <div className="h-5 w-40 skeleton"></div>
          <div className="h-24 rounded-xl skeleton"></div>
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
    <div className="page-content pt-4 space-y-6">
      {/* Greeting Section */}
      <section className="space-y-1">
        <p className="text-meta text-text-muted">Welcome back</p>
        <h2 className="text-section-heading text-xl text-text-primary">
          Hi, {data.profile.displayName} {isDad ? 'Dad 👋' : isMom ? 'Mom 👋' : '👋'}
        </h2>
      </section>

      {/* Summary Grid */}
      <section className="grid grid-cols-2 gap-4">
        {/* Card 1: This Month */}
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <p className="text-meta text-text-muted">This Month</p>
            {isUp ? (
              <TrendingUp size={16} className="text-success" />
            ) : (
              <TrendingDown size={16} className="text-error" />
            )}
          </div>
          <div>
            <p className="text-[22px] font-bold text-text-primary">
              {formatPKR(data.summary.thisMonthTotal)}
            </p>
            <p className={`text-[12px] font-medium ${isUp ? 'text-success' : 'text-error'}`}>
              {isUp ? '+' : ''}{data.summary.changePercent}% vs last month
            </p>
          </div>
        </div>

        {/* Card 2: Total Given */}
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <p className="text-meta text-text-muted">Total Given</p>
            <CreditCard size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-[22px] font-bold text-text-primary">
              {formatPKR(data.summary.allTimeTotal)}
            </p>
            <p className="text-[12px] font-medium text-text-muted">
              All time record
            </p>
          </div>
        </div>
      </section>

      {/* Realtime Notification Banner */}
      {realtimeNotify && (
        <div className="bg-primary-light text-primary text-meta px-4 py-2.5 rounded-lg shadow-sm border border-primary/10 flex items-center gap-2 animate-toast-in">
          <RefreshCw size={14} className="animate-spin" />
          <span>New transaction added by partner</span>
        </div>
      )}

      {/* Recent Transactions List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-section-heading text-text-primary">Recent Transactions</h3>
          <button
            onClick={() => router.push('/history')}
            className="text-primary text-[12px] font-semibold hover:underline bg-transparent border-none cursor-pointer"
          >
            View All
          </button>
        </div>

        {data.recentTransactions.length > 0 ? (
          <div className="space-y-3">
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
          <div className="card p-8 text-center border-dashed border-2 flex flex-col items-center justify-center gap-2">
            <p className="text-[15px] font-medium text-text-primary">No transactions logged yet</p>
            <p className="text-meta text-text-muted px-4">
              Tap the plus button below to log your first shared expense.
            </p>
          </div>
        )}
      </section>

      {/* Informational Banner */}
      <section className="bg-primary rounded-xl p-4 text-white relative overflow-hidden flex flex-col gap-1 shadow-sm">
        <h4 className="text-card-title text-white font-semibold flex items-center gap-1.5">
          <Shield size={16} /> Shared Wallet Security
        </h4>
        <p className="text-[13px] text-white/95 leading-relaxed pr-8">
          Your financial logs are synchronized instantly between Dad and Mom&apos;s devices.
        </p>
      </section>
    </div>
  )
}

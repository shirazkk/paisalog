'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TransactionCard } from '@/components/TransactionCard'
import { showToast } from '@/lib/toast'
import { Calendar, Package, Search, X } from 'lucide-react'
import { Transaction, Profile } from '@/types'

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'home_expenses', label: 'Home' },
  { value: 'grocery', label: 'Grocery' },
  { value: 'utility', label: 'Utilities' },
  { value: 'personal', label: 'Personal' },
  { value: 'other', label: 'Other' },
]

/**
 * Hallmark · macrostructure: Workbench · tone: Utilitarian+Warm · anchor hue: blue
 * Last build: none (new session)
 */
export default function HistoryPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [monthsList, setMonthsList] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    const months: { value: string; label: string }[] = [{ value: 'all', label: 'All Time' }]
    const now = new Date()
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const value = d.toISOString().slice(0, 7)
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      months.push({ value, label })
    }
    setMonthsList(months)
    setSelectedMonth('all')
  }, [])

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedMonth && selectedMonth !== 'all') params.append('month', selectedMonth)
      const res = await fetch(`/api/transactions?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load transaction logs')
      const data = await res.json()
      setTransactions(data.transactions)
      setMembers(data.members)
    } catch (err) {
      console.error(err)
      showToast("Couldn't load transactions.", 'error')
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, selectedMonth])

  useEffect(() => {
    if (selectedMonth !== '') fetchTransactions()
    const handleSaved = () => fetchTransactions()
    window.addEventListener('transaction-saved', handleSaved)
    return () => window.removeEventListener('transaction-saved', handleSaved)
  }, [fetchTransactions])

  const filteredTransactions = transactions.filter((txn) => {
    if (!searchQuery.trim()) return true
    return txn.note?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const groupedTransactions: Record<string, Transaction[]> = {}
  filteredTransactions.forEach((txn) => {
    const dateStr = txn.txn_date
    if (!groupedTransactions[dateStr]) groupedTransactions[dateStr] = []
    groupedTransactions[dateStr].push(txn)
  })

  const getGroupTitle = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0]
    const yesterdayDate = new Date()
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const yesterday = yesterdayDate.toISOString().split('T')[0]
    if (dateStr === today) return 'Today'
    if (dateStr === yesterday) return 'Yesterday'
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long', month: 'short', day: 'numeric'
    })
  }

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-bg)', gap: 'var(--space-4)' }}>
      {/* Category Scroll */}
      <nav className="bg-white py-3 sticky top-14 z-30 border-b border-[var(--color-border)]">
        <div className="flex overflow-x-auto hide-scrollbar px-4" style={{ gap: 'var(--space-2)' }}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors border ${
                  isSelected
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-white text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-bg)]'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Filter and Search */}
      <div className="px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 flex-grow max-w-[240px] shadow-sm">
          <Calendar size={16} color="var(--color-text-muted)" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent border-none text-[13px] font-semibold text-[var(--color-text)] focus:ring-0 outline-none w-full p-0 cursor-pointer"
          >
            {monthsList.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearchQuery('') }}
          className="w-10 h-10 rounded-xl border border-[var(--color-border)] flex items-center justify-center bg-white"
          style={{ color: showSearch ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
        >
          {showSearch ? <X size={18} /> : <Search size={18} />}
        </button>
      </div>

      {showSearch && (
        <div className="px-4">
          <input
            type="text"
            placeholder="Search by note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            autoFocus
          />
        </div>
      )}

      {/* Content Area */}
      <div className="px-4" style={{ paddingBottom: 'calc(var(--nav-height) + var(--space-8))', gap: 'var(--space-6)', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div className="space-y-6">
            <div className="h-4 w-20 skeleton rounded-md"></div>
            <div className="h-24 rounded-2xl skeleton shadow-sm"></div>
          </div>
        ) : sortedDates.length > 0 ? (
          <div style={{ gap: 'var(--space-6)', display: 'flex', flexDirection: 'column' }}>
            {sortedDates.map((date) => (
              <section key={date} style={{ gap: 'var(--space-2)', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', padding: '0 var(--space-1)' }}>
                  {getGroupTitle(date)}
                </h2>
                <div className="card" style={{ padding: 'var(--space-3)' }}>
                  {groupedTransactions[date].map((txn, index) => (
                    <div key={txn.id} className={index !== 0 ? 'border-t border-[var(--color-border)] pt-4 mt-4' : ''}>
                      <TransactionCard
                        transaction={txn}
                        members={members}
                        onClick={() => router.push(`/history/${txn.id}`)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center border-dashed border-2 flex flex-col items-center gap-4">
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>No transactions found</p>
          </div>
        )}
      </div>
    </div>
  )
}

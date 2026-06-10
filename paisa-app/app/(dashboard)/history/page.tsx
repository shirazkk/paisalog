'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TransactionCard } from '@/components/TransactionCard'
import { showToast } from '@/lib/toast'
import { Calendar, Package, Search } from 'lucide-react'
import { Transaction, Profile } from '@/types'

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'home_expenses', label: 'Home' },
  { value: 'grocery', label: 'Grocery' },
  { value: 'utility', label: 'Utilities' },
  { value: 'personal', label: 'Personal' },
  { value: 'other', label: 'Other' },
]

export default function HistoryPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('') // format YYYY-MM
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // Generate last 6 months for filtering
  const [monthsList, setMonthsList] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    const months: { value: string; label: string }[] = [
      { value: 'all', label: 'All Time' }
    ]
    const now = new Date()
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const value = d.toISOString().slice(0, 7) // YYYY-MM
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
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }
      if (selectedMonth) {
        params.append('month', selectedMonth)
      }

      const res = await fetch(`/api/transactions?${params.toString()}`)
      if (!res.ok) {
        throw new Error('Failed to load transaction logs')
      }
      const data = await res.json()
      setTransactions(data.transactions)
      setMembers(data.members)
    } catch (err) {
      console.error(err)
      showToast("Couldn't load transactions. Please pull to refresh.", 'error')
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, selectedMonth])

  useEffect(() => {
    if (selectedMonth !== '') {
      fetchTransactions()
    }
    
    // Listen for transaction-saved custom event to refresh
    const handleSaved = () => {
      fetchTransactions()
    }
    window.addEventListener('transaction-saved', handleSaved)
    return () => window.removeEventListener('transaction-saved', handleSaved)
  }, [fetchTransactions])

  // Filter transactions by note search query locally
  const filteredTransactions = transactions.filter((txn) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return txn.note?.toLowerCase().includes(query)
  })

  // Group transactions by date
  const groupedTransactions: Record<string, Transaction[]> = {}
  filteredTransactions.forEach((txn) => {
    const dateStr = txn.txn_date // e.g. "2026-06-10"
    if (!groupedTransactions[dateStr]) {
      groupedTransactions[dateStr] = []
    }
    groupedTransactions[dateStr].push(txn)
  })

  const getGroupTitle = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0]
    
    const yesterdayDate = new Date()
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const yesterday = yesterdayDate.toISOString().split('T')[0]

    if (dateStr === today) return 'Today'
    if (dateStr === yesterday) return 'Yesterday'

    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  return (
    <div className="flex flex-col min-h-screen">
      {/* Category Scroll Container */}
      <nav className="bg-white py-3 shadow-sm sticky top-[56px] z-30 border-b border-border">
        <div className="flex overflow-x-auto hide-scrollbar px-4 gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-full font-badge text-badge whitespace-nowrap transition-colors border ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-sm font-semibold'
                    : 'bg-white text-text-muted border-border hover:bg-bg-canvas'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Filter and Search Action bar */}
      <div className="px-4 pt-4 flex items-center justify-between gap-3">
        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-3 py-2 flex-grow max-w-[240px] shadow-sm">
          <Calendar size={16} className="text-text-muted" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent border-none text-[13px] font-semibold text-text-primary focus:ring-0 outline-none w-full p-0 cursor-pointer"
          >
            {monthsList.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Toggle */}
        <button
          onClick={() => {
            setShowSearch(!showSearch)
            if (showSearch) setSearchQuery('')
          }}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
            showSearch ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-border text-text-muted'
          }`}
          aria-label="Toggle search"
        >
          <Search size={18} />
        </button>
      </div>

      {/* Search Bar Input */}
      {showSearch && (
        <div className="px-4 pt-3">
          <input
            type="text"
            placeholder="Search by note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full"
            autoFocus
          />
        </div>
      )}

      {/* Content Area */}
      <div className="px-4 py-6 flex-grow pb-24">
        {loading ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="h-4 w-20 skeleton rounded-md"></div>
              <div className="h-24 rounded-2xl skeleton shadow-sm"></div>
              <div className="h-24 rounded-2xl skeleton shadow-sm"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-20 skeleton rounded-md"></div>
              <div className="h-24 rounded-2xl skeleton shadow-sm"></div>
            </div>
          </div>
        ) : sortedDates.length > 0 ? (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <section key={date} className="space-y-3">
                <h2 className="text-section-heading text-[13px] text-text-muted font-bold tracking-wider uppercase px-1">
                  {getGroupTitle(date)}
                </h2>
                <div className="space-y-3">
                  {groupedTransactions[date].map((txn) => (
                    <TransactionCard
                      key={txn.id}
                      transaction={txn}
                      members={members}
                      onClick={() => router.push(`/history/${txn.id}`)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center border-dashed border-2 flex flex-col items-center justify-center gap-4 mt-8">
            <div className="w-16 h-16 rounded-full bg-bg flex items-center justify-center text-text-muted">
              <Package size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-[16px] font-semibold text-text-primary">No transactions found</p>
              <p className="text-[14px] text-text-muted">Try changing your filters or logging a new transaction.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

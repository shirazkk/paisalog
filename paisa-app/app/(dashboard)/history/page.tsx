'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TransactionCard } from '@/components/TransactionCard'
import { showToast } from '@/lib/toast'
import { Calendar, Search, X, ReceiptText, SlidersHorizontal } from 'lucide-react'
import { Transaction, Profile } from '@/types'

const CATEGORIES = [
  { value: 'all',           label: 'All'       },
  { value: 'home_expenses', label: 'Home'      },
  { value: 'grocery',       label: 'Grocery'   },
  { value: 'utility',       label: 'Utilities' },
  { value: 'personal',      label: 'Personal'  },
  { value: 'other',         label: 'Other'     },
]

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
      weekday: 'long', month: 'short', day: 'numeric',
    })
  }

  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  const totalFiltered = filteredTransactions.length

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {/* ── Sticky filter bar ── */}
      <div
        style={{
          position: 'sticky',
          top: '56px', // below fixed header
          zIndex: 30,
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
        }}
      >
        {/* Category chips */}
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            gap: 'var(--space-2)',
            padding: '10px var(--space-4)',
            scrollbarWidth: 'none',
          }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--border-radius-pill)',
                  fontSize: '13px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: isSelected ? '#ffffff' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                  flexShrink: 0,
                }}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Month picker + search toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '8px var(--space-4) 10px',
          }}
        >
          {/* Month select */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flex: 1,
              height: '38px',
              padding: '0 12px',
              borderRadius: 'var(--border-radius)',
              border: '1.5px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
            }}
          >
            <Calendar size={14} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text)',
                width: '100%',
                cursor: 'pointer',
                fontFamily: 'var(--font-family)',
              }}
            >
              {monthsList.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Search toggle */}
          <button
            onClick={() => {
              setShowSearch(!showSearch)
              if (showSearch) setSearchQuery('')
            }}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--border-radius)',
              border: `1.5px solid ${showSearch ? 'var(--color-primary)' : 'var(--color-border)'}`,
              backgroundColor: showSearch ? 'var(--color-primary-light)' : 'var(--color-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 120ms ease',
            }}
            aria-label={showSearch ? 'Close search' : 'Search'}
          >
            {showSearch
              ? <X size={16} color="var(--color-primary)" />
              : <Search size={16} color="var(--color-text-muted)" />
            }
          </button>
        </div>

        {/* Search input — slides in */}
        {showSearch && (
          <div style={{ padding: '0 var(--space-4) 10px' }}>
            <input
              type="text"
              placeholder="Search by note…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ height: '40px', fontSize: '14px' }}
              autoFocus
            />
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div
        style={{
          padding: 'var(--space-4) var(--space-4)',
          paddingBottom: 'calc(var(--nav-height) + var(--space-8))',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)',
          flex: 1,
        }}
      >
        {/* Result count */}
        {!loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              {totalFiltered === 0
                ? 'No transactions'
                : `${totalFiltered} transaction${totalFiltered !== 1 ? 's' : ''}`}
            </p>
            {(selectedCategory !== 'all' || (selectedMonth && selectedMonth !== 'all') || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('all')
                  setSelectedMonth('all')
                  setSearchQuery('')
                  setShowSearch(false)
                }}
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div className="skeleton" style={{ height: '13px', width: '80px', borderRadius: '6px' }} />
                <div className="skeleton" style={{ height: '72px', borderRadius: '12px' }} />
              </div>
            ))}
          </div>

        ) : sortedDates.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {sortedDates.map((date) => (
              <section key={date} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {/* Date group header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <p
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getGroupTitle(date)}
                  </p>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {groupedTransactions[date].length} {groupedTransactions[date].length === 1 ? 'entry' : 'entries'}
                  </p>
                </div>

                {/* Transaction cards for this date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
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
          /* Empty state */
          <div
            className="card"
            style={{
              padding: 'var(--space-12) var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-3)',
              border: '2px dashed var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              boxShadow: 'none',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ReceiptText size={22} color="var(--color-primary)" strokeWidth={1.5} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                No transactions found
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : selectedCategory !== 'all'
                    ? 'Try a different category or time range'
                    : 'Log your first transaction using the + button'
                }
              </p>
            </div>
            {(selectedCategory !== 'all' || searchQuery) && (
              <button
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setShowSearch(false) }}
                className="btn btn-secondary"
                style={{ width: 'auto', height: '36px', padding: '0 var(--space-4)', fontSize: '13px' }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
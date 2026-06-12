'use client'

import { useState, useEffect } from 'react'
import { formatPKR } from '@/lib/utils'
import { showToast } from '@/lib/toast'
import { Plus } from 'lucide-react'
import { EditLimitSheet } from '@/components/budget/EditLimitSheet'
import { CATEGORIES, CATEGORY_MAP } from '@/lib/constants'

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBudget, setEditingBudget] = useState<{ category: string, limit: number } | null>(null)

  async function fetchBudgets() {
    setLoading(true)
    try {
      const res = await fetch('/api/budgets')
      const json = await res.json()
      // Merge with all categories to show missing ones
      const merged = CATEGORIES.map(c => {
        const existing = json.budgets?.find((b: any) => b.category === c.value)
        return existing || { category: c.value, limit: 0, actual: 0, percent: 0 }
      })
      setBudgets(merged)
    } catch (err) {
      console.error('Failed to load budgets:', err)
      showToast("Couldn't load budgets", 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [])

  if (loading) return <BudgetSkeleton />

  return (
    <div 
      className="page-content" 
      style={{ 
        padding: 'var(--space-6)', 
        paddingBottom: 'calc(var(--nav-height) + var(--space-8))',
        display: 'flex', 
        flexDirection: 'column', 
        gap: 'var(--space-6)' 
      }}
    >
      <h1 className="text-page-title">Monthly Budget</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {budgets.map((b) => {
          const info = CATEGORY_MAP[b.category]
          const Icon = info.icon
          return (
            <div 
              key={b.category} 
              className="card" 
              style={{ padding: 'var(--space-4)', cursor: 'pointer' }}
              onClick={() => setEditingBudget({ category: b.category, limit: b.limit })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: info.color }}>
                    <Icon size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-card-title" style={{ textTransform: 'capitalize' }}>
                            {b.category.replace('_', ' ')}
                            {b.limit === 0 && <span style={{ color: 'var(--color-primary)', marginLeft: '8px' }}><Plus size={14} /></span>}
                        </span>
                        <span className="text-amount">{formatPKR(b.actual)} / {formatPKR(b.limit)}</span>
                    </div>
                </div>
              </div>
              
              {b.limit > 0 && (
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.min(b.percent, 100)}%`, 
                    backgroundColor: b.percent > 100 ? 'var(--color-error)' : b.percent > 80 ? 'var(--color-warning)' : 'var(--color-primary)',
                    borderRadius: '4px' 
                  }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {editingBudget && (
        <EditLimitSheet
          isOpen={!!editingBudget}
          onClose={() => setEditingBudget(null)}
          category={editingBudget.category}
          currentLimit={editingBudget.limit}
          onSave={fetchBudgets}
        />
      )}
    </div>
  )
}

function BudgetSkeleton() {
  return (
    <div className="page-content" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="skeleton" style={{ height: '28px', width: '180px', borderRadius: '8px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card" style={{ padding: 'var(--space-4)', height: '80px' }}>
            <div className="skeleton" style={{ height: '16px', width: '100%', marginBottom: '12px', borderRadius: '6px' }} />
            <div className="skeleton" style={{ height: '8px', width: '100%', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

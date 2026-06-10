'use client'

import { Transaction, Profile } from '@/types'
import { formatPKR } from '@/lib/utils'
import { ArrowRight, Home, ShoppingCart, Bolt, User, Package } from 'lucide-react'
import React from 'react'

interface TransactionCardProps {
  transaction: Transaction
  members: Profile[]
  onClick?: () => void
}

const CATEGORY_MAP: Record<string, { label: string; bgClass: string; icon: React.ComponentType<{ size: number }> }> = {
  home_expenses: { label: 'Home', bgClass: 'badge-home', icon: Home },
  grocery: { label: 'Grocery', bgClass: 'badge-grocery', icon: ShoppingCart },
  utility: { label: 'Utility', bgClass: 'badge-utility', icon: Bolt },
  personal: { label: 'Personal', bgClass: 'badge-personal', icon: User },
  other: { label: 'Other', bgClass: 'badge-other', icon: Package },
}

/**
 * Hallmark · component: Card · genre: editorial · theme: Custom
 * states: default · hover (interactive)
 */
export function TransactionCard({ transaction, members, onClick }: TransactionCardProps) {
  const giver = members.find(m => m.id === transaction.giver_id)
  const receiver = members.find(m => m.id === transaction.receiver_id)

  const giverRole = giver?.role || 'Dad'
  const receiverRole = receiver?.role || 'Mom'
  const giverInitial = giverRole.toLowerCase() === 'dad' ? 'D' : 'M'
  const receiverInitial = receiverRole.toLowerCase() === 'dad' ? 'D' : 'M'

  const categoryInfo = CATEGORY_MAP[transaction.category] || CATEGORY_MAP.other
  const CategoryIcon = categoryInfo.icon

  const formattedDate = new Date(transaction.txn_date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })

  return (
    <div
      onClick={onClick}
      className={`card p-4 space-y-3 transition-transform duration-100 ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      }`}
      style={{
        borderRadius: 'var(--border-radius)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`avatar ${giverRole.toLowerCase() === 'dad' ? 'avatar-dad' : 'avatar-mom'}`}>
            {giverInitial}
          </div>
          <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
          <div className={`avatar ${receiverRole.toLowerCase() === 'dad' ? 'avatar-dad' : 'avatar-mom'}`}>
            {receiverInitial}
          </div>
        </div>
        <p style={{ color: 'var(--color-text)', fontSize: '28px', fontWeight: 700 }}>
          {formatPKR(transaction.amount)}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3">
        <div className="flex items-center gap-2">
          <span className={`badge ${categoryInfo.bgClass} flex items-center gap-1`}>
            <CategoryIcon size={12} />
            {categoryInfo.label}
          </span>
          {transaction.note && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
              {transaction.note}
            </p>
          )}
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{formattedDate}</p>
      </div>
    </div>
  )
}


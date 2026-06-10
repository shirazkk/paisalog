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

export function TransactionCard({ transaction, members, onClick }: TransactionCardProps) {
  // Find profiles
  const giver = members.find(m => m.id === transaction.giver_id)
  const receiver = members.find(m => m.id === transaction.receiver_id)

  const giverRole = giver?.role || 'Dad'
  const receiverRole = receiver?.role || 'Mom'

  const giverInitial = giverRole.toLowerCase() === 'dad' ? 'D' : 'M'
  const receiverInitial = receiverRole.toLowerCase() === 'dad' ? 'D' : 'M'

  const categoryInfo = CATEGORY_MAP[transaction.category] || {
    label: 'Other',
    bgClass: 'badge-other',
    icon: Package,
  }

  const CategoryIcon = categoryInfo.icon

  // Format date
  const dateObj = new Date(transaction.txn_date)
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div
      onClick={onClick}
      className={`card p-4 space-y-3 transition-transform duration-100 active:scale-[0.98] ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Row 1: Direction indicator (left) + Amount (right) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {/* Giver */}
          <div
            className={`avatar ${
              giverRole.toLowerCase() === 'dad' ? 'avatar-dad' : 'avatar-mom'
            }`}
            title={giver?.display_name || giverRole}
          >
            {giverInitial}
          </div>
          <ArrowRight className="text-[#9ca3af]" size={14} />
          {/* Receiver */}
          <div
            className={`avatar ${
              receiverRole.toLowerCase() === 'dad' ? 'avatar-dad' : 'avatar-mom'
            }`}
            title={receiver?.display_name || receiverRole}
          >
            {receiverInitial}
          </div>
        </div>
        <p className="text-amount text-[28px] font-bold text-text-primary">
          {formatPKR(transaction.amount)}
        </p>
      </div>

      {/* Row 2: Category badge (left) + Date (right) */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex flex-col gap-1">
          <span className={`badge ${categoryInfo.bgClass} gap-1`}>
            <CategoryIcon size={12} />
            {categoryInfo.label}
          </span>
          {/* Row 3: Note text muted (if present) */}
          {transaction.note && (
            <p className="text-meta text-text-muted italic max-w-[220px] truncate">
              {transaction.note}
            </p>
          )}
        </div>
        <p className="text-meta text-text-muted">{formattedDate}</p>
      </div>
    </div>
  )
}

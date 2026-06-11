'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { showToast } from '@/lib/toast'
import { formatPKR } from '@/lib/utils'
import {
  ArrowLeft,
  ArrowRight,
  Home,
  ShoppingCart,
  Bolt,
  User,
  Package,
  Calendar,
  FileText,
  UserCircle,
  Clock,
  Trash2,
} from 'lucide-react'
import { Transaction, Profile } from '@/types'

const CATEGORY_MAP: Record<string, { label: string; bgClass: string; icon: any; color: string; bg: string }> = {
  home_expenses: { label: 'Home Expenses', bgClass: 'badge-home', icon: Home,         color: '#16a34a', bg: '#dcfce7' },
  grocery:       { label: 'Grocery',       bgClass: 'badge-grocery', icon: ShoppingCart, color: '#d97706', bg: '#ffedd5' },
  utility:       { label: 'Utility',       bgClass: 'badge-utility', icon: Bolt,         color: '#7c3aed', bg: '#ede9fe' },
  personal:      { label: 'Personal',      bgClass: 'badge-personal', icon: User,         color: '#374151', bg: '#f3f4f6' },
  other:         { label: 'Other',         bgClass: 'badge-other', icon: Package,      color: '#1d4ed8', bg: '#dbeafe' },
}

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        setCurrentUser(session?.user.id || null)
        if (!session) { router.push('/login'); return }

        const { data: txn, error: txnError } = await supabase
          .from('transactions').select('*').eq('id', resolvedParams.id).single()
        if (txnError) throw txnError
        setTransaction(txn)

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles').select('*').eq('household_id', txn.household_id)
        if (profilesError) throw profilesError
        setMembers(profiles)
      } catch (err: any) {
        showToast("Couldn't find this transaction.", 'error')
        router.push('/history')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [resolvedParams.id, router])

  const handleDelete = async () => {
    if (!transaction) return
    try {
      setIsDeleting(true)
      const { error } = await supabase.from('transactions').delete().eq('id', transaction.id)
      if (error) throw error
      showToast('Transaction deleted ✓', 'success')
      router.push('/history')
      router.refresh()
    } catch (err: any) {
      showToast("Couldn't delete. Please try again.", 'error')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="page-content" style={{ paddingTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="skeleton" style={{ height: '26px', width: '160px', borderRadius: '8px' }} />
        <div className="skeleton" style={{ height: '220px', borderRadius: '16px' }} />
        <div className="skeleton" style={{ height: '180px', borderRadius: '16px' }} />
      </div>
    )
  }

  if (!transaction) return null

  const giver    = members.find(m => m.id === transaction.giver_id)
  const receiver = members.find(m => m.id === transaction.receiver_id)
  const logger   = members.find(m => m.id === transaction.logged_by)

  const giverRole    = giver?.role?.toLowerCase()    || 'dad'
  const receiverRole = receiver?.role?.toLowerCase() || 'mom'

  const categoryInfo = CATEGORY_MAP[transaction.category] || CATEGORY_MAP.other
  const CategoryIcon = categoryInfo.icon

  const txnDate = new Date(transaction.txn_date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  const loggedDateTime = new Date(transaction.logged_at).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })

  const canDelete = currentUser === transaction.logged_by

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>

      {/* ── Inline page header (not fixed — layout header handles that) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4) var(--space-4) 0',
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-primary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 0',
            minHeight: '44px',
          }}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {canDelete && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-error-light)',
              border: '1px solid rgba(220,38,38,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-error)',
              opacity: isDeleting ? 0.5 : 1,
            }}
            aria-label="Delete transaction"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div
        className="page-content"
        style={{
          paddingTop: 'var(--space-4)',
          paddingBottom: 'calc(var(--nav-height) + var(--space-8))',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >

        {/* ── Hero amount card ── */}
        <div
          className="card"
          style={{
            padding: 'var(--space-6) var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-4)',
            background: `linear-gradient(145deg, var(--color-surface) 60%, ${categoryInfo.bg})`,
          }}
        >
          {/* Category badge */}
          <span
            className={`badge ${categoryInfo.bgClass}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <CategoryIcon size={12} />
            {categoryInfo.label}
          </span>

          {/* Amount */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Amount
            </p>
            <p style={{ fontSize: '40px', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-1.5px', lineHeight: 1 }}>
              {formatPKR(transaction.amount)}
            </p>
          </div>

          {/* Flow: Giver → Receiver */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-5)',
              padding: 'var(--space-4) var(--space-6)',
              borderRadius: 'var(--border-radius)',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            {/* Giver */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div
                className={`avatar ${giverRole === 'dad' ? 'avatar-dad' : 'avatar-mom'}`}
                style={{ width: '48px', height: '48px', fontSize: '18px', borderRadius: '14px' }}
              >
                {giverRole === 'dad' ? 'D' : 'M'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
                  {giver?.display_name || (giverRole === 'dad' ? 'Dad' : 'Mom')}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Sender
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--color-text-muted)' }}>
              <div style={{ width: '20px', height: '1.5px', backgroundColor: 'var(--color-border)' }} />
              <ArrowRight size={14} />
            </div>

            {/* Receiver */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div
                className={`avatar ${receiverRole === 'dad' ? 'avatar-dad' : 'avatar-mom'}`}
                style={{ width: '48px', height: '48px', fontSize: '18px', borderRadius: '14px' }}
              >
                {receiverRole === 'dad' ? 'D' : 'M'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
                  {receiver?.display_name || (receiverRole === 'dad' ? 'Dad' : 'Mom')}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Receiver
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Detail rows ── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

          {/* Date */}
          <DetailRow
            icon={<Calendar size={16} color={categoryInfo.color} />}
            iconBg={categoryInfo.bg}
            label="Transaction Date"
            value={txnDate}
            border
          />

          {/* Note */}
          <DetailRow
            icon={<FileText size={16} color="var(--color-primary)" />}
            iconBg="var(--color-primary-light)"
            label="Note"
            value={transaction.note || ''}
            placeholder="No additional details"
            border
          />

          {/* Logged by */}
          <DetailRow
            icon={<UserCircle size={16} color="#7c3aed" />}
            iconBg="#ede9fe"
            label="Logged By"
            value={logger?.display_name || 'Partner'}
            badge={logger?.role}
            badgeIsDad={logger?.role?.toLowerCase() === 'dad'}
          />
        </div>

        {/* ── Timestamp ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: 'var(--space-2) 0 var(--space-4)',
          }}
        >
          <Clock size={13} color="var(--color-text-muted)" />
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Logged {loggedDateTime}
          </p>
        </div>
      </div>

      {/* ── Delete confirm sheet ── */}
      {showDeleteConfirm && (
        <div
          className="sheet-overlay entering"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteConfirm(false) }}
        >
          <div
            className="sheet entering"
            style={{ padding: 'var(--space-5) var(--space-4) var(--space-8)' }}
          >
            <div className="sheet-handle" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Icon */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    backgroundColor: 'var(--color-error-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Trash2 size={24} color="var(--color-error)" />
                </div>
              </div>

              {/* Text */}
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text)' }}>
                  Delete Transaction?
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  This will permanently remove the{' '}
                  <strong style={{ color: 'var(--color-text)' }}>{formatPKR(transaction.amount)}</strong>{' '}
                  transaction. This cannot be undone.
                </p>
              </div>

              {/* Amount preview */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--border-radius)',
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  {categoryInfo.label} · {new Date(transaction.txn_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
                  {formatPKR(transaction.amount)}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="btn btn-destructive"
                  style={{ backgroundColor: 'var(--color-error)', color: '#fff', opacity: isDeleting ? 0.6 : 1 }}
                >
                  {isDeleting ? 'Deleting…' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Reusable detail row ── */
function DetailRow({
  icon, iconBg, label, value, placeholder, badge, badgeIsDad, border,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string
  placeholder?: string
  badge?: string
  badgeIsDad?: boolean
  border?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        borderBottom: border ? '1px solid var(--color-border)' : 'none',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          backgroundColor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <p style={{
            fontSize: '15px',
            fontWeight: value ? 500 : 400,
            color: value ? 'var(--color-text)' : 'var(--color-text-muted)',
            fontStyle: value ? 'normal' : 'italic',
            lineHeight: 1.5,
          }}>
            {value || placeholder}
          </p>
          {badge && (
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--border-radius-pill)',
              backgroundColor: badgeIsDad ? 'rgba(59,130,246,0.1)' : 'rgba(236,72,153,0.1)',
              color: badgeIsDad ? 'var(--color-dad)' : 'var(--color-mom)',
              textTransform: 'capitalize',
            }}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
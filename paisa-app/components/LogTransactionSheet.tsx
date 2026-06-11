'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { showToast } from '@/lib/toast'
import { ArrowRight, Home, ShoppingCart, Bolt, User, Package, Calendar, FileText, X, CheckCircle2 } from 'lucide-react'

const transactionSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount (numbers only)')
    .refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0')
    .refine((val) => parseFloat(val) <= 9999999.99, 'Amount is too large'),
  direction: z.enum(['dad_to_mom', 'mom_to_dad'], {
    message: 'Please select who gave the money',
  }),
  category: z.enum(['home_expenses', 'grocery', 'utility', 'personal', 'other'], {
    message: 'Please select a category',
  }),
  txn_date: z
    .string()
    .min(1, 'Date is required')
    .refine((val) => {
      const d = new Date(val)
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      return d <= today
    }, 'Date cannot be in the future'),
  note: z
    .string()
    .max(200, 'Note must be 200 characters or less')
    .optional()
    .nullable()
    .or(z.literal('')),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

interface LogTransactionSheetProps {
  isOpen: boolean
  onClose: () => void
  householdId: string
  currentUserProfile: any
  onSuccess: () => void
}

const CATEGORIES = [
  { value: 'home_expenses',  label: 'Home',     icon: Home,         color: '#16a34a', bg: '#dcfce7' },
  { value: 'grocery',        label: 'Grocery',  icon: ShoppingCart, color: '#d97706', bg: '#ffedd5' },
  { value: 'utility',        label: 'Utility',  icon: Bolt,         color: '#7c3aed', bg: '#ede9fe' },
  { value: 'personal',       label: 'Personal', icon: User,         color: '#374151', bg: '#f3f4f6' },
  { value: 'other',          label: 'Other',    icon: Package,      color: '#1d4ed8', bg: '#dbeafe' },
] as const

export function LogTransactionSheet({
  isOpen,
  onClose,
  householdId,
  currentUserProfile,
  onSuccess,
}: LogTransactionSheetProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: '',
      direction: currentUserProfile?.role === 'mom' ? 'mom_to_dad' : 'dad_to_mom',
      category: undefined,
      txn_date: new Date().toISOString().split('T')[0],
      note: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setIsAnimating(true)
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => setShouldRender(false), 250)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (currentUserProfile) {
      form.setValue('direction', currentUserProfile.role === 'mom' ? 'mom_to_dad' : 'dad_to_mom')
    }
  }, [currentUserProfile, form])

  if (!shouldRender) return null

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const responseData = await res.json()
      if (!res.ok) throw new Error(responseData.error || 'Failed to save transaction.')
      showToast('Transaction saved ✓', 'success')
      form.reset({
        amount: '',
        direction: currentUserProfile?.role === 'mom' ? 'mom_to_dad' : 'dad_to_mom',
        category: undefined,
        txn_date: new Date().toISOString().split('T')[0],
        note: '',
      })
      onSuccess()
    } catch (err: any) {
      if (!navigator.onLine) {
        showToast('No internet connection. Please try again.', 'error')
      } else {
        showToast(err.message || "Couldn't save. Please try again.", 'error')
      }
    }
  }

  const selectedCategory = form.watch('category')
  const amountValue = form.watch('amount')
  const isDad = currentUserProfile?.role === 'dad'

  return (
    <div
      className={`sheet-overlay ${isAnimating ? 'entering' : 'leaving'}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={`sheet ${isAnimating ? 'entering' : 'leaving'}`}
        style={{
          position: 'relative',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: 'var(--border-radius-sheet)',
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-sheet)',
          padding: '0',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: 'var(--color-surface)',
            padding: '16px var(--space-4) 12px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}>
              Log Transaction
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 400 }}>
              Record a money transfer
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: 'var(--space-5) var(--space-4) var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

          {/* Amount */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Amount (PKR)
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-muted)' }}>₨</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                style={{
                  fontSize: '44px',
                  fontWeight: 700,
                  color: amountValue ? 'var(--color-text)' : 'var(--color-border)',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  width: '180px',
                  textAlign: 'center',
                  letterSpacing: '-1px',
                  fontFamily: 'var(--font-family)',
                }}
                {...form.register('amount')}
              />
            </div>
            {/* Underline */}
            <div style={{
              width: '160px',
              height: '2px',
              borderRadius: '1px',
              backgroundColor: form.formState.errors.amount
                ? 'var(--color-error)'
                : amountValue
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
              transition: 'background-color 150ms ease',
            }} />
            {form.formState.errors.amount && (
              <p style={{ fontSize: '12px', color: 'var(--color-error)', fontWeight: 500 }}>
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          {/* Direction */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>From → To</p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--border-radius)',
                backgroundColor: 'var(--color-primary-light)',
                border: '1.5px solid rgba(26, 86, 219, 0.2)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div className={`avatar ${isDad ? 'avatar-dad' : 'avatar-mom'}`}>
                  {isDad ? 'D' : 'M'}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  {isDad ? 'Dad' : 'Mom'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)' }}>
                <div style={{ width: '24px', height: '1.5px', backgroundColor: 'var(--color-primary)', opacity: 0.4 }} />
                <ArrowRight size={16} color="var(--color-primary)" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div className={`avatar ${isDad ? 'avatar-mom' : 'avatar-dad'}`}>
                  {isDad ? 'M' : 'D'}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  {isDad ? 'Mom' : 'Dad'}
                </span>
              </div>
            </div>
          </div>

          {/* Category */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>Category</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
              {CATEGORIES.map((cat) => {
                const CatIcon = cat.icon
                const isSelected = selectedCategory === cat.value
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => form.setValue('category', cat.value, { shouldValidate: true })}
                    style={{
                      gridColumn: cat.value === 'other' ? 'span 2' : 'span 1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: '12px var(--space-3)',
                      borderRadius: 'var(--border-radius)',
                      border: `1.5px solid ${isSelected ? cat.color : 'var(--color-border)'}`,
                      backgroundColor: isSelected ? cat.bg : 'var(--color-surface)',
                      cursor: 'pointer',
                      transition: 'all 120ms ease',
                      textAlign: 'left',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? cat.color : 'var(--color-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'background-color 120ms ease',
                      }}
                    >
                      <CatIcon size={16} color={isSelected ? '#ffffff' : cat.color} strokeWidth={isSelected ? 2.5 : 1.5} />
                    </div>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? cat.color : 'var(--color-text)',
                    }}>
                      {cat.label}
                    </span>
                    {isSelected && (
                      <CheckCircle2 size={16} color={cat.color} style={{ marginLeft: 'auto', flexShrink: 0 }} />
                    )}
                  </button>
                )
              })}
            </div>
            {form.formState.errors.category && (
              <p style={{ fontSize: '12px', color: 'var(--color-error)', fontWeight: 500 }}>
                {form.formState.errors.category.message}
              </p>
            )}
          </div>

          {/* Date + Note */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                htmlFor="txn_date"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}
              >
                <Calendar size={14} color="var(--color-text-muted)" />
                Date
              </label>
              <input
                id="txn_date"
                type="date"
                className={form.formState.errors.txn_date ? 'input input-error' : 'input'}
                {...form.register('txn_date')}
              />
              {form.formState.errors.txn_date && (
                <p style={{ fontSize: '12px', color: 'var(--color-error)', fontWeight: 500 }}>
                  {form.formState.errors.txn_date.message}
                </p>
              )}
            </div>

            {/* Note */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                htmlFor="note"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}
              >
                <FileText size={14} color="var(--color-text-muted)" />
                Note
                <span style={{ marginLeft: '2px', fontSize: '12px', fontWeight: 400, color: 'var(--color-text-muted)' }}>
                  (optional)
                </span>
              </label>
              <input
                id="note"
                type="text"
                placeholder="What was this for?"
                maxLength={200}
                className={form.formState.errors.note ? 'input input-error' : 'input'}
                {...form.register('note')}
              />
              {form.formState.errors.note && (
                <p style={{ fontSize: '12px', color: 'var(--color-error)', fontWeight: 500 }}>
                  {form.formState.errors.note.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="button"
            disabled={form.formState.isSubmitting}
            onClick={form.handleSubmit(onSubmit)}
            className="btn btn-primary"
          >
            {form.formState.isSubmitting ? 'Saving…' : 'Save Transaction'}
          </button>

        </div>
      </div>
    </div>
  )
}
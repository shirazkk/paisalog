'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema, type TransactionFormValues } from '@/lib/validations'
import { showToast } from '@/lib/toast'
import { Calendar, FileText, X } from 'lucide-react'
import { AmountInput } from './log-transaction/AmountInput'
import { TransactionDirection } from './log-transaction/TransactionDirection'
import { CategoryPicker } from './log-transaction/CategoryPicker'

interface LogTransactionSheetProps {
  isOpen: boolean
  onClose: () => void
  householdId: string
  currentUserProfile: any
  onSuccess: () => void
}

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

          <AmountInput register={form.register} errors={form.formState.errors} amountValue={amountValue} />

          <TransactionDirection isDad={isDad} />

          <CategoryPicker selectedCategory={selectedCategory} setValue={form.setValue} errors={form.formState.errors} />

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
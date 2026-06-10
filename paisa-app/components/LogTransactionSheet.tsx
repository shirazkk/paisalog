'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { showToast } from '@/lib/toast'
import { ArrowRight, Home, ShoppingCart, Bolt, User, Package, Calendar, FileText, X } from 'lucide-react'

// Zod Schema from form-validation skill
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
      today.setHours(23, 59, 59, 999) // include all of today
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
  { value: 'home_expenses', label: 'Home', bgClass: 'badge-home', activeBorder: 'border-[#16a34a]', icon: Home },
  { value: 'grocery', label: 'Grocery', bgClass: 'badge-grocery', activeBorder: 'border-[#d97706]', icon: ShoppingCart },
  { value: 'utility', label: 'Utility', bgClass: 'badge-utility', activeBorder: 'border-[#7c3aed]', icon: Bolt },
  { value: 'personal', label: 'Personal', bgClass: 'badge-personal', activeBorder: 'border-[#374151]', icon: User },
  { value: 'other', label: 'Other', bgClass: 'badge-other', activeBorder: 'border-[#1d4ed8]', icon: Package },
] as const

/**
 * Hallmark · component: BottomSheet · genre: editorial · theme: Custom
 * states: default · entering · leaving · disabled · error
 */
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

  // Handle entering/leaving animations
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

  // Reset form default direction if currentUserProfile changes
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

      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to save transaction.')
      }

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

  const { watch } = form
  const selectedDirection = watch('direction')
  const selectedCategory = watch('category')

  return (
    <div
      className={`sheet-overlay ${isAnimating ? 'entering' : 'leaving'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`sheet relative max-h-[90vh] overflow-y-auto ${isAnimating ? 'entering' : 'leaving'}`}
        style={{
          borderRadius: 'var(--border-radius-sheet)',
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-sheet)',
          padding: `var(--space-5) var(--space-4) var(--space-8)`, // Using spacing tokens
        }}
      >
        {/* Close Button top right */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full transition-colors"
          aria-label="Close sheet"
          style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}
        >
          <X size={20} />
        </button>

        {/* Drag Handle */}
        <div className="sheet-handle" style={{ backgroundColor: '#d1d5db', borderRadius: '2px' }}></div>

        <div className="px-1 pb-safe pt-2">
          {/* Amount Input Section */}
          <div className="text-center py-4 flex flex-col" style={{ gap: 'var(--space-1)' }}>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: 'var(--color-text-muted)' }}>
              Amount (PKR)
            </span>
            <div className="flex items-center justify-center" style={{ gap: 'var(--space-1)' }}>
              <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text)' }}>PKR</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                className="w-40 bg-transparent border-none text-center outline-none focus:ring-0 p-0"
                style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text)' }}
                {...form.register('amount')}
              />
            </div>
            {form.formState.errors.amount && (
              <p className="error-message text-center" style={{ color: 'var(--color-error)' }}>
                ⚠ {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          {/* Direction Toggle - Restricted based on role */}
          <div className="flex flex-col" style={{ gap: 'var(--space-1)', marginBottom: 'var(--space-6)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Transaction Flow</span>
            <div className="grid grid-cols-1" style={{ gap: 'var(--space-3)' }}>
              {currentUserProfile?.role === 'dad' ? (
                /* Dad -> Mom (Fixed for Dad) */
                <div
                  className="flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-100"
                  style={{
                    gap: 'var(--space-2)',
                    borderColor: 'var(--color-primary)',
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    fontWeight: 700
                  }}
                >
                  <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
                    <div className="avatar avatar-dad">D</div>
                    <ArrowRight size={14} style={{ color: 'var(--color-primary)' }} />
                    <div className="avatar avatar-mom">M</div>
                  </div>
                  <span style={{ fontSize: '12px' }}>Dad → Mom</span>
                </div>
              ) : (
                /* Mom -> Dad (Fixed for Mom) */
                <div
                  className="flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-100"
                  style={{
                    gap: 'var(--space-2)',
                    borderColor: 'var(--color-primary)',
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    fontWeight: 700
                  }}
                >
                  <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
                    <div className="avatar avatar-mom">M</div>
                    <ArrowRight size={14} style={{ color: 'var(--color-primary)' }} />
                    <div className="avatar avatar-dad">D</div>
                  </div>
                  <span style={{ fontSize: '12px' }}>Mom → Dad</span>
                </div>
              )}
            </div>
          </div>

          {/* Category Grid */}
          <div className="flex flex-col" style={{ gap: 'var(--space-1)', marginBottom: 'var(--space-6)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Category</span>
            <div className="grid grid-cols-2" style={{ gap: 'var(--space-3)' }}>
              {CATEGORIES.map((cat) => {
                const CatIcon = cat.icon
                const isSelected = selectedCategory === cat.value
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => form.setValue('category', cat.value)}
                    className={`flex items-center p-3 rounded-xl border-2 transition-all duration-100 text-left ${
                      cat.value === 'other' ? 'col-span-2' : ''
                    }`}
                    style={{
                      gap: 'var(--space-3)',
                      borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)', // Use primary for active border
                      backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                      color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  >
                    <div className="text-current flex items-center justify-center">
                      <CatIcon size={20} strokeWidth={isSelected ? 2.5 : 1.5} />
                    </div>
                    <span style={{ fontSize: '15px' }}>{cat.label}</span>
                  </button>
                )
              })}
            </div>
            {form.formState.errors.category && (
              <p className="error-message" style={{ color: 'var(--color-error)' }}>⚠ {form.formState.errors.category.message}</p>
            )}
          </div>

          {/* Date and Note Inputs */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <div className="flex flex-col" style={{ gap: 'var(--space-1)' }}>
              <label htmlFor="txn_date" className="label flex items-center" style={{ fontSize: '13px', color: 'var(--color-text-muted)', gap: 'var(--space-1)' }}>
                <Calendar size={16} /> Transaction Date
              </label>
              <input
                id="txn_date"
                type="date"
                className={`input ${form.formState.errors.txn_date ? 'input-error' : ''}`}
                style={{
                  height: 'var(--input-height)',
                  borderRadius: 'var(--border-radius)',
                  border: `1.5px solid ${form.formState.errors.txn_date ? 'var(--color-error)' : 'var(--color-border)'}`,
                  backgroundColor: form.formState.errors.txn_date ? 'var(--color-error-light)' : 'var(--color-surface)',
                  padding: `0 var(--space-4)`,
                  fontFamily: 'var(--font-family)',
                  fontSize: '15px',
                  color: 'var(--color-text)',
                  width: '100%',
                  outline: 'none',
                }}
                {...form.register('txn_date')}
              />
              {form.formState.errors.txn_date && (
                <p className="error-message" style={{ color: 'var(--color-error)' }}>⚠ {form.formState.errors.txn_date.message}</p>
              )}
            </div>

            <div className="flex flex-col mt-4" style={{ gap: 'var(--space-1)' }}>
              <label htmlFor="note" className="label flex items-center" style={{ fontSize: '13px', color: 'var(--color-text-muted)', gap: 'var(--space-1)' }}>
                <FileText size={16} /> Note (Optional)
              </label>
              <input
                id="note"
                type="text"
                placeholder="What was this for?"
                maxLength={200}
                className={`input ${form.formState.errors.note ? 'input-error' : ''}`}
                style={{
                  height: 'var(--input-height)',
                  borderRadius: 'var(--border-radius)',
                  border: `1.5px solid ${form.formState.errors.note ? 'var(--color-error)' : 'var(--color-border)'}`,
                  backgroundColor: form.formState.errors.note ? 'var(--color-error-light)' : 'var(--color-surface)',
                  padding: `0 var(--space-4)`,
                  fontFamily: 'var(--font-family)',
                  fontSize: '15px',
                  color: 'var(--color-text)',
                  width: '100%',
                  outline: 'none',
                }}
                {...form.register('note')}
              />
              {form.formState.errors.note && (
                <p className="error-message" style={{ color: 'var(--color-error)' }}>⚠ {form.formState.errors.note.message}</p>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="pb-4">
            <button
              type="button"
              disabled={form.formState.isSubmitting}
              onClick={form.handleSubmit(onSubmit)}
              className="btn btn-primary"
              style={{
                height: 'var(--btn-height)',
                borderRadius: 'var(--border-radius)',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                fontFamily: 'var(--font-family)',
                fontSize: '15px',
                fontWeight: 600,
                width: '100%',
                opacity: form.formState.isSubmitting ? 0.5 : 1,
                cursor: form.formState.isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {form.formState.isSubmitting ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

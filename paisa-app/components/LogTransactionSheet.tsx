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
      <div className={`sheet relative max-h-[90vh] overflow-y-auto ${isAnimating ? 'entering' : 'leaving'}`}>
        {/* Close Button top right */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-text-muted hover:text-text-primary rounded-full hover:bg-bg transition-colors"
          aria-label="Close sheet"
        >
          <X size={20} />
        </button>

        {/* Drag Handle */}
        <div className="sheet-handle"></div>

        <div className="px-1 pb-safe pt-2">
          {/* Amount Input Section */}
          <div className="text-center py-4 flex flex-col gap-1">
            <span className="text-[12px] uppercase tracking-wider font-bold text-text-muted">
              Amount (PKR)
            </span>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-2xl font-bold text-text-primary">PKR</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                className="w-40 bg-transparent border-none text-center text-3xl font-bold text-text-primary outline-none focus:ring-0 p-0"
                {...form.register('amount')}
              />
            </div>
            {form.formState.errors.amount && (
              <p className="error-message text-center">
                ⚠ {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          {/* Direction Toggle */}
          <div className="flex flex-col gap-1.5 mb-6">
            <span className="text-[13px] font-semibold text-text-muted">Transaction Flow</span>
            <div className="grid grid-cols-2 gap-3">
              {/* Dad -> Mom */}
              <button
                type="button"
                onClick={() => form.setValue('direction', 'dad_to_mom')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-100 ${
                  selectedDirection === 'dad_to_mom'
                    ? 'border-primary bg-primary-light text-primary font-bold'
                    : 'border-border bg-white text-text-muted'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-dad flex items-center justify-center text-white font-bold text-[13px]">
                    D
                  </div>
                  <ArrowRight size={14} className={selectedDirection === 'dad_to_mom' ? 'text-primary' : 'text-text-muted'} />
                  <div className="w-8 h-8 rounded-full bg-mom flex items-center justify-center text-white font-bold text-[13px]">
                    M
                  </div>
                </div>
                <span className="text-[12px] font-semibold">Dad → Mom</span>
              </button>

              {/* Mom -> Dad */}
              <button
                type="button"
                onClick={() => form.setValue('direction', 'mom_to_dad')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-100 ${
                  selectedDirection === 'mom_to_dad'
                    ? 'border-primary bg-primary-light text-primary font-bold'
                    : 'border-border bg-white text-text-muted'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-mom flex items-center justify-center text-white font-bold text-[13px]">
                    M
                  </div>
                  <ArrowRight size={14} className={selectedDirection === 'mom_to_dad' ? 'text-primary' : 'text-text-muted'} />
                  <div className="w-8 h-8 rounded-full bg-dad flex items-center justify-center text-white font-bold text-[13px]">
                    D
                  </div>
                </div>
                <span className="text-[12px] font-semibold">Mom → Dad</span>
              </button>
            </div>
            {form.formState.errors.direction && (
              <p className="error-message">⚠ {form.formState.errors.direction.message}</p>
            )}
          </div>

          {/* Category Grid */}
          <div className="flex flex-col gap-1.5 mb-6">
            <span className="text-[13px] font-semibold text-text-muted">Category</span>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => {
                const CatIcon = cat.icon
                const isSelected = selectedCategory === cat.value
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => form.setValue('category', cat.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-100 text-left ${
                      cat.value === 'other' ? 'col-span-2' : ''
                    } ${
                      isSelected
                        ? `${cat.activeBorder} ${cat.bgClass} font-bold text-text-primary`
                        : 'border-border bg-white text-text-muted hover:border-text-muted/20'
                    }`}
                  >
                    <div className="text-current flex items-center justify-center">
                      <CatIcon size={20} className={isSelected ? 'stroke-[2.5px]' : ''} />
                    </div>
                    <span className="text-[15px] font-semibold">{cat.label}</span>
                  </button>
                )
              })}
            </div>
            {form.formState.errors.category && (
              <p className="error-message">⚠ {form.formState.errors.category.message}</p>
            )}
          </div>

          {/* Date and Note Inputs */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-col gap-1">
              <label htmlFor="txn_date" className="label text-[13px] text-text-muted flex items-center gap-1.5">
                <Calendar size={16} /> Transaction Date
              </label>
              <input
                id="txn_date"
                type="date"
                className={`input ${form.formState.errors.txn_date ? 'input-error' : ''}`}
                {...form.register('txn_date')}
              />
              {form.formState.errors.txn_date && (
                <p className="error-message">⚠ {form.formState.errors.txn_date.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="note" className="label text-[13px] text-text-muted flex items-center gap-1.5">
                <FileText size={16} /> Note (Optional)
              </label>
              <input
                id="note"
                type="text"
                placeholder="What was this for?"
                maxLength={200}
                className={`input ${form.formState.errors.note ? 'input-error' : ''}`}
                {...form.register('note')}
              />
              {form.formState.errors.note && (
                <p className="error-message">⚠ {form.formState.errors.note.message}</p>
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
            >
              {form.formState.isSubmitting ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

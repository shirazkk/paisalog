---
name: form-validation
description: >
  Use this skill whenever building or modifying ANY form in the PaisaLog app.
  Triggers on: "log transaction form", "input validation", "form error", "react-hook-form",
  "zod schema", any form field (amount, category, date, note), or any screen that
  accepts user input. Always read this skill before writing a single form component.
---

# Form Validation Skill — PaisaLog

PaisaLog has one critical form: the Log Transaction form. It must be bulletproof —
Mom and Dad should never see a confusing error or be able to submit bad data.

---

## Required Libraries

```bash
npm install react-hook-form zod @hookform/resolvers
```

---

## Zod Schema — Transaction Form

Always use this exact schema. Do not change field names.

```typescript
import { z } from 'zod'

export const transactionSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount (numbers only)')
    .refine(val => parseFloat(val) > 0, 'Amount must be greater than 0')
    .refine(val => parseFloat(val) <= 9999999.99, 'Amount is too large'),

  direction: z.enum(['dad_to_mom', 'mom_to_dad'], {
    errorMap: () => ({ message: 'Please select who gave the money' })
  }),

  category: z.enum(['home_expenses', 'grocery', 'utility', 'personal', 'other'], {
    errorMap: () => ({ message: 'Please select a category' })
  }),

  txn_date: z
    .string()
    .min(1, 'Date is required')
    .refine(val => {
      const d = new Date(val)
      return d <= new Date()
    }, 'Date cannot be in the future'),

  note: z
    .string()
    .max(200, 'Note must be 200 characters or less')
    .optional()
})

export type TransactionFormValues = z.infer<typeof transactionSchema>
```

---

## Form Hook Setup

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm<TransactionFormValues>({
  resolver: zodResolver(transactionSchema),
  defaultValues: {
    amount: '',
    direction: 'dad_to_mom',
    category: undefined,
    txn_date: new Date().toISOString().split('T')[0], // today
    note: ''
  }
})
```

---

## Inline Error Display Pattern

Always show errors inline below the field — never in an alert or modal.

```tsx
{/* Example for amount field */}
<div className="flex flex-col gap-1">
  <label className="text-sm font-medium text-gray-700">Amount (PKR)</label>
  <input
    type="number"
    inputMode="decimal"
    placeholder="e.g. 5000"
    className={`h-[52px] rounded-xl border px-4 text-[15px] ${
      form.formState.errors.amount
        ? 'border-red-500 bg-red-50'
        : 'border-gray-200 bg-white'
    }`}
    {...form.register('amount')}
  />
  {form.formState.errors.amount && (
    <p className="text-sm text-red-600 flex items-center gap-1">
      <span>⚠</span>
      {form.formState.errors.amount.message}
    </p>
  )}
</div>
```

Apply the same pattern to every field.

---

## Submit Button Rules

```tsx
<button
  type="button"
  onClick={form.handleSubmit(onSubmit)}
  disabled={form.formState.isSubmitting}
  className="w-full h-[52px] bg-blue-600 text-white font-semibold rounded-xl
             disabled:opacity-50 disabled:cursor-not-allowed"
>
  {form.formState.isSubmitting ? 'Saving...' : 'Save Transaction'}
</button>
```

- Always disable during submission
- Always show loading text while in flight
- Never use `<form>` submit — use `onClick` with `handleSubmit`

---

## Category Button Grid Pattern

Categories are tappable buttons, not a dropdown — easier for Mom on mobile:

```tsx
const CATEGORIES = [
  { value: 'home_expenses', label: '🏠 Home', color: 'green' },
  { value: 'grocery',       label: '🛒 Grocery', color: 'orange' },
  { value: 'utility',       label: '⚡ Utility', color: 'purple' },
  { value: 'personal',      label: '👤 Personal', color: 'gray' },
  { value: 'other',         label: '📦 Other', color: 'blue' },
]

// Render as a 2-col grid of large tap buttons (min 52px height)
// Selected = filled color, unselected = outline
```

---

## After Successful Submit

```typescript
const onSubmit = async (data: TransactionFormValues) => {
  try {
    await saveTransaction(data)   // call your API
    form.reset()                  // clear form
    onSuccess()                   // close sheet / navigate
  } catch (err) {
    // Let error-handling skill take over — show toast
  }
}
```

Always call `form.reset()` after success so the form is clean for next use.

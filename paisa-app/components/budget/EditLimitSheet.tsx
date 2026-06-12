'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { showToast } from '@/lib/toast'
import { X } from 'lucide-react'

const limitSchema = z.object({
  limit: z.string().min(1, 'Amount is required').refine((val) => parseFloat(val) >= 0, 'Must be positive')
})

interface EditLimitSheetProps {
  isOpen: boolean
  onClose: () => void
  category: string
  currentLimit: number
  onSave: () => void
}

export function EditLimitSheet({ isOpen, onClose, category, currentLimit, onSave }: EditLimitSheetProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  const form = useForm({
    resolver: zodResolver(limitSchema),
    defaultValues: { limit: currentLimit.toString() }
  })

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setIsAnimating(true)
      form.setValue('limit', currentLimit.toString())
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => setShouldRender(false), 250)
      return () => clearTimeout(timer)
    }
  }, [isOpen, currentLimit, form])

  if (!shouldRender) return null

  const onSubmit = async (data: { limit: string }) => {
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, limit: parseFloat(data.limit) }),
      })
      if (!res.ok) throw new Error('Failed to save limit')
      showToast('Budget updated ✓', 'success')
      onSave()
      onClose()
    } catch (err) {
      showToast("Couldn't save limit", 'error')
    }
  }

  return (
    <div className={`sheet-overlay ${isAnimating ? 'entering' : 'leaving'}`} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`sheet ${isAnimating ? 'entering' : 'leaving'}`} style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, textTransform: 'capitalize' }}>{category.replace('_', ' ')} Limit</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        
        <input 
          type="number" 
          className="input" 
          style={{ fontSize: '32px', marginBottom: '24px' }}
          {...form.register('limit')} 
        />
        
        <button 
          className="btn btn-primary" 
          onClick={form.handleSubmit(onSubmit)}
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Saving...' : 'Save Limit'}
        </button>
      </div>
    </div>
  )
}

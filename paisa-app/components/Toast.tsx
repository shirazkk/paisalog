'use client'
import { useState, useEffect } from 'react'

interface ToastData { message: string; type: 'success' | 'error' | 'info' }

export function Toast() {
  const [toast, setToast] = useState<ToastData | null>(null)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<ToastData>
      setToast(customEvent.detail)
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => setToast(null), 3000)
    }
    window.addEventListener('show-toast', handler as EventListener)
    return () => {
      window.removeEventListener('show-toast', handler as EventListener)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  if (!toast) return null

  const colors = {
    success: 'toast-success',
    error:   'toast-error',
    info:    'toast-info'
  }

  return (
    <div className={`toast ${colors[toast.type]}`}>
      {toast.message}
    </div>
  )
}

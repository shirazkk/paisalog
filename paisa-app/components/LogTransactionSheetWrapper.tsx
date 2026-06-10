'use client'

import { useState } from 'react'
import { LogTransactionSheet } from './LogTransactionSheet'
import { Plus } from 'lucide-react'
import { Profile } from '@/types'

export function LogTransactionSheetWrapper({ 
  householdId, 
  currentUserProfile 
}: { 
  householdId: string,
  currentUserProfile: Profile 
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleTransactionSaved = () => {
    setIsSheetOpen(false)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('transaction-saved'))
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsSheetOpen(true)}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 w-14 h-14 bg-primary text-white rounded-full shadow-[0_8px_16px_rgba(26,86,219,0.3)] flex items-center justify-center z-[49] active:scale-95 transition-transform duration-150"
        aria-label="Log new transaction"
      >
        <Plus size={28} />
      </button>

      {/* Sheet */}
      <LogTransactionSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        householdId={householdId}
        currentUserProfile={currentUserProfile}
        onSuccess={handleTransactionSaved}
      />
    </>
  )
}

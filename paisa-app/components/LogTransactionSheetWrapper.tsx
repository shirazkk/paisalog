'use client'

import { LogTransactionSheet } from "./LogTransactionSheet"

interface LogTransactionSheetWrapperProps {
  householdId: string
  currentUserProfile: any
  isOpen: boolean
  onClose: () => void
}

export function LogTransactionSheetWrapper({ 
  householdId, 
  currentUserProfile,
  isOpen,
  onClose
}: LogTransactionSheetWrapperProps) {
  const handleTransactionSaved = () => {
    onClose()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('transaction-saved'))
    }
  }

  return (
    <LogTransactionSheet
      isOpen={isOpen}
      onClose={onClose}
      householdId={householdId}
      currentUserProfile={currentUserProfile}
      onSuccess={handleTransactionSaved}
    />
  )
}


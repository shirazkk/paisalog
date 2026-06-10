'use client'

import { useState } from "react";
import { DashboardNavigation } from "@/components/DashboardNavigation";
import { LogTransactionSheetWrapper } from "@/components/LogTransactionSheetWrapper";
import { Profile } from "@/types";

interface DashboardUIProps {
  children: React.ReactNode;
  householdId: string;
  currentUserProfile: Profile;
}

export function DashboardUI({ children, householdId, currentUserProfile }: DashboardUIProps) {
  const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);

  return (
    <>
      {/* Main Canvas content */}
      <main className="flex-1 pb-20 pt-16 overflow-y-auto">{children}</main>

      {/* Navigation and Sheet */}
      <DashboardNavigation onLogClick={() => setIsLogSheetOpen(true)} />
      <LogTransactionSheetWrapper
        householdId={householdId}
        currentUserProfile={currentUserProfile}
        isOpen={isLogSheetOpen}
        onClose={() => setIsLogSheetOpen(false)}
      />
    </>
  );
}

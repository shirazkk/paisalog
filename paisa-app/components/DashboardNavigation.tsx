'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, History, Settings, PlusCircle } from 'lucide-react'

interface DashboardNavigationProps {
  onLogClick: () => void;
}

export function DashboardNavigation({ onLogClick }: DashboardNavigationProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path || (path === '/history' && pathname.startsWith('/history'))

  return (
    <nav className="bottom-nav" style={{ 
      borderTop: '1px solid var(--color-border)',
      backgroundColor: 'var(--color-surface)'
    }}>
      <Link href="/dashboard" className={`nav-tab ${isActive('/dashboard') ? 'active' : ''}`}>
        <Home size={22} strokeWidth={isActive('/dashboard') ? 2.5 : 1.5} />
        <span style={{ fontSize: '11px', fontWeight: isActive('/dashboard') ? 600 : 500 }}>Home</span>
      </Link>
      
      <button
        onClick={onLogClick}
        className="nav-tab border-none bg-transparent"
        style={{ color: 'var(--color-primary)' }}
      >
        <PlusCircle size={28} strokeWidth={2} />
      </button>

      <Link href="/history" className={`nav-tab ${isActive('/history') ? 'active' : ''}`}>
        <History size={22} strokeWidth={isActive('/history') ? 2.5 : 1.5} />
        <span style={{ fontSize: '11px', fontWeight: isActive('/history') ? 600 : 500 }}>History</span>
      </Link>
      
      <Link href="/settings" className={`nav-tab ${isActive('/settings') ? 'active' : ''}`}>
        <Settings size={22} strokeWidth={isActive('/settings') ? 2.5 : 1.5} />
        <span style={{ fontSize: '11px', fontWeight: isActive('/settings') ? 600 : 500 }}>Settings</span>
      </Link>
    </nav>
  )
}


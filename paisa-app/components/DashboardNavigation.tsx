'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, History, Settings, Plus, BookOpen } from 'lucide-react'

interface DashboardNavigationProps {
  onLogClick: () => void;
}

export function DashboardNavigation({ onLogClick }: DashboardNavigationProps) {
  const pathname = usePathname()

  const isActive = (path: string) =>
    pathname === path || (path === '/history' && pathname.startsWith('/history'))

  return (
    <nav
      className="bottom-nav"
      style={{
        borderTop: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        overflow: 'visible',
      }}
    >
      {/* Home */}
      <Link href="/dashboard" className={`nav-tab ${isActive('/dashboard') ? 'active' : ''}`}>
        <Home size={22} strokeWidth={isActive('/dashboard') ? 2.5 : 1.5} />
        <span style={{ fontSize: '11px', fontWeight: isActive('/dashboard') ? 600 : 500 }}>
          Home
        </span>
      </Link>

      {/* History */}
      <Link href="/history" className={`nav-tab ${isActive('/history') ? 'active' : ''}`}>
        <History size={22} strokeWidth={isActive('/history') ? 2.5 : 1.5} />
        <span style={{ fontSize: '11px', fontWeight: isActive('/history') ? 600 : 500 }}>
          History
        </span>
      </Link>

      {/* Center FAB */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        }}
      >
        <button
          onClick={onLogClick}
          style={{
            position: 'absolute',
            bottom: '14px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-fab)',
            transition: 'transform 150ms ease, box-shadow 150ms ease',
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.94)'
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
          }}
          onTouchStart={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.94)'
          }}
          onTouchEnd={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
          }}
          aria-label="Log transaction"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      </div>

      {/* Reports */}
      <Link href="/reports" className={`nav-tab ${isActive('/reports') ? 'active' : ''}`}>
        <BookOpen size={22} strokeWidth={isActive('/reports') ? 2.5 : 1.5} />
        <span style={{ fontSize: '11px', fontWeight: isActive('/reports') ? 600 : 500 }}>
          Reports
        </span>
      </Link>

      {/* Settings */}
      <Link href="/settings" className={`nav-tab ${isActive('/settings') ? 'active' : ''}`}>
        <Settings size={22} strokeWidth={isActive('/settings') ? 2.5 : 1.5} />
        <span style={{ fontSize: '11px', fontWeight: isActive('/settings') ? 600 : 500 }}>
          Settings
        </span>
      </Link>
    </nav>
  )
}
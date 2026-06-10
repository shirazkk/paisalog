'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, History, Settings, PlusCircle } from 'lucide-react'

export function DashboardNavigation() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav">
      <Link
        href="/dashboard"
        className={`nav-tab ${pathname === '/dashboard' ? 'active' : ''}`}
      >
        <Home size={22} className={pathname === '/dashboard' ? 'fill-primary/10' : ''} />
        <span>Home</span>
      </Link>
      <button
        // Need to add logic to trigger sheet opening
        className="nav-tab border-none bg-transparent"
      >
        <PlusCircle size={22} />
        <span>Log</span>
      </button>
      <Link
        href="/history"
        className={`nav-tab ${pathname.startsWith('/history') ? 'active' : ''}`}
      >
        <History size={22} />
        <span>History</span>
      </Link>
      <Link
        href="/settings"
        className={`nav-tab ${pathname === '/settings' ? 'active' : ''}`}
      >
        <Settings size={22} />
        <span>Settings</span>
      </Link>
    </nav>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { showToast } from '@/lib/toast'
import { User, LogOut, UserCheck, Copy, Check } from 'lucide-react'

/**
 * Hallmark · macrostructure: Workbench · tone: Utilitarian+Warm · anchor hue: blue
 * Last build: none (new session)
 */
export default function SettingsPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/settings')
        if (!res.ok) throw new Error('Failed to load settings')
        const json = await res.json()
        setData(json)
        setDisplayName(json.profile.display_name)
      } catch (err) {
        showToast("Couldn't load settings.", 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleUpdateProfile = async () => {
    try {
      setIsSaving(true)
      const res = await fetch('/api/profiles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName })
      })
      if (!res.ok) throw new Error('Failed to update')
      showToast('Profile updated ✓', 'success')
    } catch (err) {
      showToast("Couldn't update profile.", 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const copyInviteCode = () => {
    navigator.clipboard.writeText(data.household.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    showToast('Code copied to clipboard', 'info')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="page-content pt-4 space-y-6">
        <div className="h-6 w-32 skeleton"></div>
        <div className="space-y-4 pt-4">
          <div className="h-20 rounded-xl skeleton"></div>
          <div className="h-20 rounded-xl skeleton"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content pt-4 pb-24 space-y-8">
      <h2 className="text-page-title" style={{ color: 'var(--color-text)' }}>Settings</h2>

      {/* Account Section */}
      <section className="space-y-3">
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', paddingLeft: 'var(--space-1)' }}>Account</h3>
        <div className="card p-4" style={{ gap: 'var(--space-4)', display: 'flex', flexDirection: 'column' }}>
          <div className="flex flex-col" style={{ gap: 'var(--space-1)' }}>
            <label className="flex items-center" style={{ fontSize: '13px', color: 'var(--color-text-muted)', gap: 'var(--space-1)' }}>
              <User size={16} /> Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input"
            />
          </div>
          <button
            onClick={handleUpdateProfile}
            disabled={isSaving || displayName === data.profile.display_name}
            className="btn btn-primary"
          >
            {isSaving ? 'Saving...' : 'Update Name'}
          </button>
        </div>
      </section>

      {/* Household Section */}
      <section className="space-y-3">
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', paddingLeft: 'var(--space-1)' }}>Family Wallet</h3>
        <div className="card p-4" style={{ gap: 'var(--space-4)', display: 'flex', flexDirection: 'column' }}>
          <div className="flex flex-col" style={{ gap: 'var(--space-1)' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Invite Code</span>
            <div className="flex items-center justify-between" style={{ padding: 'var(--space-3)', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-primary)' }}>
                {data.household.invite_code}
              </span>
              <button 
                onClick={copyInviteCode}
                style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent', padding: 'var(--space-1)' }}
                className="transition-colors hover:text-[var(--color-primary)]"
              >
                {copied ? <Check size={20} style={{ color: 'var(--color-success)' }} /> : <Copy size={20} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center" style={{ gap: 'var(--space-3)', paddingTop: 'var(--space-1)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <UserCheck size={20} />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                {data.partner ? `${data.partner.display_name} (${data.partner.role})` : 'Partner not joined'}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Household: {data.household.name}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="pt-4">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center border transition-colors"
          style={{ 
            height: 'var(--btn-height)', 
            borderRadius: 'var(--border-radius)', 
            borderColor: 'var(--color-error)', 
            color: 'var(--color-error)', 
            fontWeight: 600 
          }}
        >
          <LogOut size={18} style={{ marginRight: '8px' }} /> Sign Out
        </button>
      </section>
      
      {/* Footer Meta */}
      <footer className="text-center" style={{ fontSize: '13px', color: 'var(--color-text-muted)', paddingTop: 'var(--space-4)' }}>
        <p>PaisaLog v1.0.0</p>
      </footer>
    </div>
  )
}

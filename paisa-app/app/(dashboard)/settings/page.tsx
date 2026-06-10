'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { showToast } from '@/lib/toast'
import { 
  User, 
  LogOut, 
  UserCheck, 
  Copy,
  Check
} from 'lucide-react'

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
        console.error(err)
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
    <div className="page-content pt-4 pb-24 space-y-6">
      <h2 className="text-page-title text-text-primary">Settings</h2>

      {/* Profile Section */}
      <section className="space-y-3">
        <h3 className="text-section-heading text-text-muted px-1 uppercase tracking-wider text-[13px]">Account</h3>
        <div className="card p-4 space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-meta text-text-muted flex items-center gap-1.5">
              <User size={16} /> Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input w-full"
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
        <h3 className="text-section-heading text-text-muted px-1 uppercase tracking-wider text-[13px]">Family Wallet</h3>
        <div className="card p-4 space-y-4">
          <div className="flex flex-col gap-1">
            <span className="text-meta text-text-muted">Invite Code</span>
            <div className="flex items-center justify-between bg-gray-50 border border-border p-3 rounded-xl">
              <span className="text-lg font-bold tracking-widest text-primary">
                {data.household.invite_code}
              </span>
              <button 
                onClick={copyInviteCode}
                className="p-2 text-text-muted hover:text-primary transition-colors"
              >
                {copied ? <Check size={20} className="text-success" /> : <Copy size={20} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pt-2">
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="text-card-title text-text-primary">
                {data.partner ? `${data.partner.display_name} (${data.partner.role})` : 'Partner not joined'}
              </p>
              <p className="text-meta text-text-muted">Household: {data.household.name}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="pt-4">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 h-[52px] rounded-xl border border-error text-error font-semibold active:bg-error/5 transition-colors"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </section>
      
      {/* Footer Meta */}
      <footer className="text-center text-meta text-text-muted pt-4">
        <p>PaisaLog v1.0.0</p>
      </footer>
    </div>
  )
}

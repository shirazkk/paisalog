'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { showToast } from '@/lib/toast'
import { User, LogOut, UserCheck, Copy, Check, Home, Shield } from 'lucide-react'
import { AvatarUploader } from '@/components/settings/AvatarUploader'

export default function SettingsPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
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
        setAvatarUrl(json.profile.avatar_url)
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
        body: JSON.stringify({ displayName, avatarUrl }),
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
      <div
        className="page-content"
        style={{ paddingTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}
      >
        <div className="skeleton" style={{ height: '26px', width: '120px', borderRadius: '8px' }} />
        <div className="skeleton" style={{ height: '140px', borderRadius: '12px' }} />
        <div className="skeleton" style={{ height: '140px', borderRadius: '12px' }} />
        <div className="skeleton" style={{ height: '52px', borderRadius: '12px' }} />
      </div>
    )
  }

  if (!data) return null

  const isDad = data.profile.role === 'dad'
  const hasPartner = !!data.partner
  const nameUnchanged = displayName === data.profile.display_name
  const avatarUnchanged = avatarUrl === data.profile.avatar_url

  return (
    <div
      className="page-content"
      style={{
        paddingTop: 'var(--space-6)',
        paddingBottom: 'calc(var(--nav-height) + var(--space-8))',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
    >
      {/* ── Page Title ── */}
      <h1 className="text-page-title">Settings</h1>

      {/* ── Profile Card ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingLeft: '2px' }}>
          Profile
        </p>
        <div className="card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Avatar + role row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <AvatarUploader 
              currentUrl={avatarUrl} 
              userId={data.profile.id} 
              displayName={displayName}
              onUpload={setAvatarUrl} 
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                {data.profile.display_name}
              </p>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  fontWeight: 500,
                  padding: '2px 8px',
                  borderRadius: 'var(--border-radius-pill)',
                  backgroundColor: isDad ? 'rgba(59,130,246,0.1)' : 'rgba(236,72,153,0.1)',
                  color: isDad ? 'var(--color-dad)' : 'var(--color-mom)',
                  width: 'fit-content',
                }}
              >
                {isDad ? 'Dad' : 'Mom'}
              </span>
            </div>
          </div>

          <div className="card-divider" />

          {/* Name input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="displayName"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}
            >
              <User size={14} color="var(--color-text-muted)" />
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input"
              placeholder="Enter your name"
            />
          </div>

          <button
            onClick={handleUpdateProfile}
            disabled={isSaving || nameUnchanged}
            className="btn btn-primary"
          >
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </section>

      {/* ── Household Card ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingLeft: '2px' }}>
          Family Wallet
        </p>
        <div className="card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Household name row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Home size={18} color="var(--color-primary)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                {data.household.name}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Shared household</p>
            </div>
          </div>

          <div className="card-divider" />

          {/* Invite code */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>Invite Code</p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px var(--space-4)',
                borderRadius: 'var(--border-radius)',
                backgroundColor: 'var(--color-primary-light)',
                border: '1.5px dashed rgba(26, 86, 219, 0.3)',
              }}
            >
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  color: 'var(--color-primary)',
                  fontFamily: 'monospace',
                }}
              >
                {data.household.invite_code}
              </span>
              <button
                onClick={copyInviteCode}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: copied ? 'var(--color-success-light)' : 'var(--color-surface)',
                  border: `1px solid ${copied ? 'var(--color-success)' : 'var(--color-border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 150ms ease',
                }}
                aria-label="Copy invite code"
              >
                {copied
                  ? <Check size={16} color="var(--color-success)" />
                  : <Copy size={16} color="var(--color-text-muted)" />
                }
              </button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Share this code with your partner to join the household.
            </p>
          </div>

          <div className="card-divider" />

          {/* Partner status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: hasPartner ? 'var(--color-success-light)' : 'var(--color-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <UserCheck size={18} color={hasPartner ? 'var(--color-success)' : 'var(--color-text-muted)'} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                {hasPartner ? data.partner.display_name : 'No partner yet'}
              </p>
              <p style={{ fontSize: '12px', color: hasPartner ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                {hasPartner ? `${data.partner.role} · Connected` : 'Share the invite code above'}
              </p>
            </div>

            {hasPartner && (
              <div
                style={{
                  marginLeft: 'auto',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-success)',
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        </div>
      </section>

      {/* ── Security Card ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingLeft: '2px' }}>
          Security
        </p>
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Shield size={18} color="var(--color-primary)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>End-to-end sync</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Your data is encrypted and synced instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sign Out ── */}
      <button
        onClick={handleSignOut}
        className="btn btn-destructive"
        style={{ marginTop: 'var(--space-2)' }}
      >
        <LogOut size={18} />
        Sign Out
      </button>

      {/* ── Footer ── */}
      <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-muted)', paddingTop: 'var(--space-2)' }}>
        PaisaLog v1.0.0
      </p>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { showToast } from '@/lib/toast'
import { ArrowLeft, Copy, Check, Users } from 'lucide-react'

export default function JoinHouseholdPage() {
  const router = useRouter()
  const [familyName, setFamilyName] = useState('')
  const [inviteCodeInput, setInviteCodeInput] = useState('')
  const [createdCode, setCreatedCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [loadingJoin, setLoadingJoin] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  useEffect(() => {
    async function getProfile() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) { router.push('/login'); return }
        const { data: profile } = await supabase.from('profiles').select('display_name, household_id').eq('id', user.id).single()
        if (profile) {
          if (profile.household_id) { router.push('/dashboard'); return }
          setFamilyName(`${profile.display_name} Family`)
        }
      } catch (err) { console.error(err) }
    }
    getProfile()
  }, [router])

  const handleCreateHousehold = async () => {
    try {
      setLoadingCreate(true)
      const res = await fetch('/api/households/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyName }),
      })
      if (!res.ok) { const json = await res.json(); throw new Error(json.error || 'Failed to create family household.') }
      const { household } = await res.json()
      setCreatedCode(household.invite_code)
      showToast('Household initialized ✓', 'success')
    } catch (err: any) { showToast(err.message || "Couldn't create family household.", 'error') }
    finally { setLoadingCreate(false) }
  }

  const handleJoinHousehold = async () => {
    if (!inviteCodeInput.trim()) { showToast('Please enter an invite code.', 'error'); return }
    try {
      setLoadingJoin(true)
      const res = await fetch('/api/households/join', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCodeInput }),
      })
      if (!res.ok) { const json = await res.json(); throw new Error(json.error || 'Failed to join household.') }
      showToast('Linked household successfully ✓', 'success')
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) { showToast(err.message || "Couldn't join household.", 'error') }
    finally { setLoadingJoin(false) }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(createdCode)
    setCopied(true)
    showToast('Code copied to clipboard', 'success')
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div
      style={{
        backgroundColor: '#f9fafb',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          width: '100%',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f9fafb',
          position: 'relative',
        }}
      >
        {/* Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            height: '56px',
            width: '100%',
            backgroundColor: '#faf8ff',
          }}
        >
          <button
            onClick={() => { supabase.auth.signOut(); router.push('/login') }}
            aria-label="Go back"
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              color: '#434654',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.1s',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
            Household Setup
          </h1>
          <div style={{ width: '40px' }} />
        </header>

        {/* Main */}
        <main
          style={{
            flex: 1,
            padding: '32px 16px 48px',
            overflowY: 'auto',
          }}
        >
          {/* Hero */}
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'rgba(26, 86, 219, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <Users size={40} color="#003fb1" />
            </div>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 700,
                lineHeight: 1.3,
                color: '#111827',
                marginBottom: '12px',
              }}
            >
              Sync Your Finances
            </h2>
            <p
              style={{
                fontSize: '15px',
                lineHeight: 1.6,
                color: '#6b7280',
                padding: '0 16px',
              }}
            >
              Link your account with your partner so you both see the same
              transactions and track goals together.
            </p>
          </div>

          {/* Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Create New Family Card */}
            <section
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {/* add_home equivalent */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3L2 12h3v8h5v-5h4v5h5v-8h3L12 3z" fill="#003fb1" opacity="0.15"/>
                  <path d="M12 3L2 12h3v8h5v-5h4v5h5v-8h3L12 3zm0 2.5l7 6.3V19h-3v-5H8v5H5v-7.2L12 5.5z" fill="#003fb1"/>
                  <path d="M15 8h2v2h2v2h-2v2h-2v-2h-2v-2h2V8z" fill="#003fb1"/>
                </svg>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                  Create New Family
                </h3>
              </div>

              {createdCode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    Share this code with your partner to link their account.
                  </p>
                  <div
                    style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1.5px dashed #c3c5d7',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          fontWeight: 700,
                          color: '#6b7280',
                          marginBottom: '4px',
                        }}
                      >
                        Your Code
                      </span>
                      <span
                        style={{
                          fontSize: '24px',
                          fontWeight: 700,
                          letterSpacing: '0.15em',
                          color: '#003fb1',
                        }}
                      >
                        {createdCode}
                      </span>
                    </div>
                    <button
                      onClick={handleCopy}
                      aria-label="Copy code"
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#003fb1',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0, 63, 177, 0.20)',
                        transition: 'transform 0.1s',
                      }}
                      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.90)')}
                      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                  <button
                    onClick={() => { router.push('/dashboard'); router.refresh() }}
                    style={{
                      width: '100%',
                      height: '52px',
                      backgroundColor: '#003fb1',
                      color: '#ffffff',
                      fontSize: '16px',
                      fontWeight: 600,
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.90')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    Start a fresh shared ledger and invite your partner with a unique code.
                  </p>
                  {/* Family Name input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label
                      htmlFor="familyName"
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: focusedField === 'familyName' ? '#1a56db' : '#434654',
                        paddingLeft: '2px',
                        transition: 'color 0.15s',
                      }}
                    >
                      Family Name
                    </label>
                    <input
                      id="familyName"
                      type="text"
                      placeholder="e.g. Ali Family"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      onFocus={() => setFocusedField('familyName')}
                      onBlur={() => setFocusedField(null)}
                      style={{
                        height: '52px',
                        width: '100%',
                        padding: '0 16px',
                        borderRadius: '12px',
                        border: focusedField === 'familyName'
                          ? '1.5px solid #1a56db'
                          : '1.5px solid #c3c5d7',
                        backgroundColor: '#ffffff',
                        fontSize: '15px',
                        color: '#111827',
                        outline: 'none',
                        boxShadow: focusedField === 'familyName'
                          ? '0 0 0 2px rgba(26, 86, 219, 0.10)'
                          : 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <button
                    onClick={handleCreateHousehold}
                    disabled={loadingCreate || !familyName.trim()}
                    style={{
                      width: '100%',
                      height: '52px',
                      backgroundColor: loadingCreate || !familyName.trim() ? '#6b7280' : '#003fb1',
                      color: '#ffffff',
                      fontSize: '16px',
                      fontWeight: 600,
                      borderRadius: '12px',
                      border: 'none',
                      cursor: loadingCreate || !familyName.trim() ? 'not-allowed' : 'pointer',
                      transition: 'opacity 0.15s, background-color 0.15s',
                    }}
                    onMouseEnter={(e) => { if (!loadingCreate && familyName.trim()) e.currentTarget.style.opacity = '0.90' }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                  >
                    {loadingCreate ? 'Initializing...' : 'Initialize Household'}
                  </button>
                </div>
              )}
            </section>

            {/* Join with Code Card */}
            <section
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="#003fb1"/>
                </svg>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                  Join with Code
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Already have a family set up? Enter the code shared by your partner.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label
                    htmlFor="invite-code"
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: focusedField === 'inviteCode' ? '#1a56db' : '#434654',
                      paddingLeft: '2px',
                      transition: 'color 0.15s',
                    }}
                  >
                    Invitation Code
                  </label>
                  <input
                    id="invite-code"
                    type="text"
                    maxLength={7}
                    placeholder="e.g. PX-0000"
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                    onFocus={() => setFocusedField('inviteCode')}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      height: '52px',
                      width: '100%',
                      padding: '0 16px',
                      borderRadius: '12px',
                      border: focusedField === 'inviteCode'
                        ? '1.5px solid #1a56db'
                        : '1.5px solid #c3c5d7',
                      backgroundColor: '#ffffff',
                      fontSize: '18px',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textAlign: 'center',
                      color: '#111827',
                      outline: 'none',
                      boxShadow: focusedField === 'inviteCode'
                        ? '0 0 0 2px rgba(26, 86, 219, 0.10)'
                        : 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxSizing: 'border-box',
                      textTransform: 'uppercase',
                    }}
                  />
                </div>
                <button
                  onClick={handleJoinHousehold}
                  disabled={loadingJoin || !inviteCodeInput.trim()}
                  style={{
                    width: '100%',
                    height: '52px',
                    backgroundColor: loadingJoin || !inviteCodeInput.trim() ? '#dee0e2' : '#e2e1ed',
                    color: loadingJoin || !inviteCodeInput.trim() ? '#9ca3af' : '#111827',
                    fontSize: '16px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    border: 'none',
                    cursor: loadingJoin || !inviteCodeInput.trim() ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingJoin && inviteCodeInput.trim())
                      e.currentTarget.style.backgroundColor = '#c3c5d7'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      loadingJoin || !inviteCodeInput.trim() ? '#dee0e2' : '#e2e1ed'
                  }}
                >
                  {loadingJoin ? 'Linking...' : 'Link Account'}
                </button>
              </div>
            </section>
          </div>

          {/* Decorative bento-style illustration */}
          <div
            style={{
              marginTop: '48px',
              opacity: 0.4,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              height: '128px',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(0, 63, 177, 0.05)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* receipt_long icon */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v14H3v3c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V2l-1.5 1.5zM15 20H6c-.55 0-1-.45-1-1v-1h10v2zm4-1c0 .55-.45 1-1 1s-1-.45-1-1v-3H8V5h11v14z" fill="#003fb1" opacity="0.4"/>
                <path d="M9 7h6v2H9zm0 3h6v2H9zm0 3h4v2H9z" fill="#003fb1" opacity="0.4"/>
              </svg>
            </div>
            <div
              style={{
                backgroundColor: 'rgba(22, 163, 74, 0.05)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* savings icon */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 9c0-2.97-2.16-5.43-5-5.91V2h-2v1.09C9.16 3.57 7 6.03 7 9c0 2.5 1.46 4.67 3.6 5.73L10 17h4l-.6-2.27C15.54 13.67 17 11.5 17 9H19zm-7 5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zM8 18h8v2H8z" fill="#16a34a" opacity="0.4"/>
              </svg>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
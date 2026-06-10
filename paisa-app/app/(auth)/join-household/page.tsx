'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { showToast } from '@/lib/toast'
import { ArrowLeft, Key, Copy, Check, Users, Wallet } from 'lucide-react'

export default function JoinHouseholdPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [inviteCodeInput, setInviteCodeInput] = useState('')
  const [createdCode, setCreatedCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [loadingJoin, setLoadingJoin] = useState(false)
useEffect(() => {
  async function getProfile() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, household_id')
        .eq('id', user.id)
        .single()

      if (profile) {
        if (profile.household_id) {
          router.push('/dashboard')
          return
        }
        setUserName(profile.display_name)
        setFamilyName(`${profile.display_name} Family`)
      }
    } catch (err) {
      console.error(err)
    }
  }
  getProfile()
}, [router])

  const handleCreateHousehold = async () => {
    try {
      setLoadingCreate(true)
      const res = await fetch('/api/households/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyName }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to create family household.')
      }

      const { household } = await res.json()
      setCreatedCode(household.invite_code)
      showToast('Household initialized ✓', 'success')
    } catch (err: any) {
      showToast(err.message || "Couldn't create family household.", 'error')
    } finally {
      setLoadingCreate(false)
    }
  }

  const handleJoinHousehold = async () => {
    if (!inviteCodeInput.trim()) {
      showToast('Please enter an invite code.', 'error')
      return
    }

    try {
      setLoadingJoin(true)
      const res = await fetch('/api/households/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCodeInput }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to join household.')
      }

      showToast('Linked household successfully ✓', 'success')
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      showToast(err.message || "Couldn't join household.", 'error')
    } finally {
      setLoadingJoin(false)
    }
  }

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(createdCode)
    setCopied(true)
    showToast('Code copied to clipboard', 'info')
    setTimeout(() => setCopied(false), 2500)
  }

  const handleBack = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="app-container bg-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 w-full bg-white border-b border-border z-10">
        <button
          onClick={handleBack}
          aria-label="Go back"
          className="w-10 h-10 flex items-center justify-start text-text-muted active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-section-heading text-text-primary">Setup Household</h1>
        <div className="w-10"></div>
      </header>

      <main className="page-content pt-section-gap pb-12">
        {/* Explainer Hero Section */}
        <div className="mb-section-gap text-center space-y-3">
          <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto">
            <Users size={40} className="text-primary" />
          </div>
          <h2 className="text-page-title text-text-primary">Sync Your Finances</h2>
          <p className="text-body text-text-muted">
            Link with your partner to see shared transactions instantly.
          </p>
        </div>

        <div className="space-y-6">
          {/* Create New Family Card */}
          <section className="card p-6 flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <Wallet size={22} className="text-primary" />
              <h3 className="text-card-title text-text-primary">Create New Family</h3>
            </div>
            
            {createdCode ? (
              <div className="space-y-4">
                <p className="text-body text-text-muted">Share this code with your partner.</p>
                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-border">
                  <span className="text-[28px] font-bold tracking-widest text-primary">
                    {createdCode}
                  </span>
                  <button
                    onClick={copyCodeToClipboard}
                    aria-label="Copy code"
                    className="p-2 text-primary hover:bg-primary-light rounded-full transition-colors"
                  >
                    {copied ? <Check size={24} className="text-success" /> : <Copy size={24} />}
                  </button>
                </div>
                <button
                  onClick={() => {
                    router.push('/dashboard')
                    router.refresh()
                  }}
                  className="btn btn-primary"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="familyName" className="label">Family Name</label>
                  <input
                    id="familyName"
                    placeholder="e.g. Ali Family"
                    className="input"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                  />
                </div>
                <button
                  disabled={loadingCreate || !familyName.trim()}
                  onClick={handleCreateHousehold}
                  className="btn btn-primary"
                >
                  {loadingCreate ? 'Initializing...' : 'Initialize Household'}
                </button>
              </div>
            )}
          </section>

          {/* Join with Code Card */}
          <section className="card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Key size={22} className="text-primary" />
              <h3 className="text-card-title text-text-primary">Join with Code</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="label" htmlFor="invite-code">Invitation Code</label>
                <input
                  id="invite-code"
                  maxLength={7}
                  placeholder="e.g. PL-1234"
                  className="input text-center text-[20px] font-bold tracking-widest uppercase"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                />
              </div>
              <button
                disabled={loadingJoin || !inviteCodeInput.trim()}
                onClick={handleJoinHousehold}
                className="btn btn-primary"
              >
                {loadingJoin ? 'Linking...' : 'Link Account'}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

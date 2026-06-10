'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { showToast } from '@/lib/toast'
import { formatPKR } from '@/lib/utils'
import { 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  ShoppingCart, 
  Bolt, 
  User, 
  Package, 
  Calendar, 
  FileText, 
  UserCircle, 
  Clock,
  Trash2,
  AlertCircle
} from 'lucide-react'
import { Transaction, Profile } from '@/types'

const CATEGORY_MAP: Record<string, { label: string; bgClass: string; icon: any }> = {
  home_expenses: { label: 'Home Expenses', bgClass: 'badge-home', icon: Home },
  grocery: { label: 'Grocery', bgClass: 'badge-grocery', icon: ShoppingCart },
  utility: { label: 'Utility', bgClass: 'badge-utility', icon: Bolt },
  personal: { label: 'Personal', bgClass: 'badge-personal', icon: User },
  other: { label: 'Other', bgClass: 'badge-other', icon: Package },
}

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession()
        setCurrentUser(session?.user.id || null)

        if (!session) {
          router.push('/login')
          return
        }

        // Fetch transaction detail
        const { data: txn, error: txnError } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', resolvedParams.id)
          .single()

        if (txnError) throw txnError
        setTransaction(txn)

        // Fetch household members to resolve profile names/roles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('household_id', txn.household_id)

        if (profilesError) throw profilesError
        setMembers(profiles)

      } catch (err: any) {
        console.error('[Detail Fetch Error]', err)
        showToast("Couldn't find this transaction.", 'error')
        router.push('/history')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resolvedParams.id, router])

  const handleDelete = async () => {
    if (!transaction) return
    
    // We use a custom confirm logic later, for now browser confirm matches SADAPAY/EASYPAISA simplicity
    if (!confirm('Are you sure you want to delete this transaction? This cannot be undone.')) return

    try {
      setIsDeleting(true)
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transaction.id)

      if (error) throw error

      showToast('Transaction deleted ✓', 'success')
      router.push('/history')
      router.refresh()
    } catch (err: any) {
      console.error('[Delete Error]', err)
      showToast("Couldn't delete. Please try again.", 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="page-content pt-4 space-y-6">
        <div className="h-6 w-32 skeleton"></div>
        <div className="h-56 rounded-2xl skeleton shadow-sm"></div>
        <div className="space-y-4 pt-4">
          <div className="h-20 rounded-xl skeleton shadow-sm"></div>
          <div className="h-20 rounded-xl skeleton shadow-sm"></div>
          <div className="h-20 rounded-xl skeleton shadow-sm"></div>
        </div>
      </div>
    )
  }

  if (!transaction) return null

  // Resolve specific profiles
  const giver = members.find(m => m.id === transaction.giver_id)
  const receiver = members.find(m => m.id === transaction.receiver_id)
  const logger = members.find(m => m.id === transaction.logged_by)

  const giverRole = giver?.role?.toLowerCase() || 'dad'
  const receiverRole = receiver?.role?.toLowerCase() || 'mom'
  
  const categoryInfo = CATEGORY_MAP[transaction.category] || CATEGORY_MAP.other
  const CategoryIcon = categoryInfo.icon

  // Format dates for display
  const txnDate = new Date(transaction.txn_date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  const loggedDateTime = new Date(transaction.logged_at).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })

  // Only the person who logged the transaction can delete it
  const canDelete = currentUser === transaction.logged_by

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Top Header Bar */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-14 bg-white border-b border-border z-40 flex items-center px-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 -ml-2 flex items-center justify-center text-text-muted active:scale-90 transition-transform"
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-text-primary ml-2">Transaction Detail</h1>
        
        {canDelete && (
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="ml-auto w-10 h-10 flex items-center justify-center text-error active:scale-90 transition-all disabled:opacity-50"
            title="Delete transaction"
          >
            <Trash2 size={20} />
          </button>
        )}
      </header>

      <main className="page-content pt-20 pb-24 space-y-6">
        {/* Large Amount Display Card */}
        <section className="card p-8 flex flex-col items-center text-center space-y-5 shadow-sm border border-border/50">
          <div className="space-y-1">
            <span className="text-[12px] uppercase tracking-wider font-bold text-text-muted">Total Amount</span>
            <h2 className="text-amount text-[36px] text-text-primary leading-none">
              {formatPKR(transaction.amount)}
            </h2>
          </div>

          <div className={`badge ${categoryInfo.bgClass} gap-1.5 py-1.5 px-4`}>
            <CategoryIcon size={14} />
            <span className="font-semibold">{categoryInfo.label}</span>
          </div>

          {/* User Flow Flow: Source -> Destination */}
          <div className="flex items-center gap-6 pt-2 w-full justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className={`avatar w-14 h-14 text-[18px] shadow-sm ${giverRole === 'dad' ? 'avatar-dad' : 'avatar-mom'}`}>
                {giverRole === 'dad' ? 'D' : 'M'}
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-text-primary leading-tight">{giver?.display_name || 'Giver'}</span>
                <span className="text-[11px] text-text-muted uppercase tracking-tighter">Source</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center mb-6">
              <ArrowRight className="text-text-muted opacity-50" size={24} strokeWidth={2.5} />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className={`avatar w-14 h-14 text-[18px] shadow-sm ${receiverRole === 'dad' ? 'avatar-dad' : 'avatar-mom'}`}>
                {receiverRole === 'dad' ? 'D' : 'M'}
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-text-primary leading-tight">{receiver?.display_name || 'Receiver'}</span>
                <span className="text-[11px] text-text-muted uppercase tracking-tighter">Recipient</span>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Information List */}
        <section className="space-y-3">
          <h3 className="text-section-heading text-[13px] text-text-muted font-bold tracking-widest uppercase px-1">Details</h3>
          
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            {/* Transaction Date */}
            <div className="p-4 flex items-start gap-4 border-b border-border/60 active:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0">
                <Calendar size={20} />
              </div>
              <div className="flex flex-col justify-center min-h-[40px]">
                <span className="text-[12px] font-bold text-text-muted uppercase tracking-tight">Given On</span>
                <span className="text-[15px] font-semibold text-text-primary">{txnDate}</span>
              </div>
            </div>

            {/* Note Section */}
            <div className="p-4 flex items-start gap-4 border-b border-border/60 active:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0">
                <FileText size={20} />
              </div>
              <div className="flex flex-col justify-center min-h-[40px]">
                <span className="text-[12px] font-bold text-text-muted uppercase tracking-tight">Note</span>
                <span className="text-[15px] font-medium text-text-primary leading-relaxed">
                  {transaction.note || <span className="text-text-muted/60 italic font-normal">No additional details</span>}
                </span>
              </div>
            </div>

            {/* Logger Metadata */}
            <div className="p-4 flex items-start gap-4 active:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0">
                <UserCircle size={20} />
              </div>
              <div className="flex flex-col justify-center min-h-[40px]">
                <span className="text-[12px] font-bold text-text-muted uppercase tracking-tight">Logged By</span>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold text-text-primary">{logger?.display_name || 'Partner'}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter ${
                    logger?.role === 'Dad' ? 'bg-dad/10 text-dad' : 'bg-mom/10 text-mom'
                  }`}>
                    {logger?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Audit Timestamp */}
        <section className="flex flex-col items-center justify-center gap-1.5 pt-6 pb-4">
          <div className="flex items-center gap-2 text-text-muted">
            <Clock size={14} strokeWidth={2.5} />
            <span className="text-[12px] font-medium">Created on {loggedDateTime}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-border rounded-full shadow-xs">
            <AlertCircle size={12} className="text-text-muted" />
            <span className="text-[11px] text-text-muted font-medium">Securely synced with household</span>
          </div>
        </section>
      </main>
    </div>
  )
}

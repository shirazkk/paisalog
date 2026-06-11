'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsStandalone(true)
      return
    }

    // Check if user dismissed it this session
    const isDismissed = sessionStorage.getItem('pwa-banner-dismissed')
    if (isDismissed) return

    // On desktop browsers, we might want to show it even if beforeinstallprompt hasn't fired yet
    // but we'll wait a bit to see if it does.
    const timer = setTimeout(() => {
      setShowBanner(true)
    }, 2000)

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
      // Update UI notify the user they can install the PWA
      setShowBanner(true)
      clearTimeout(timer)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS and others that don't support beforeinstallprompt
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    if (isIOS && !((window.navigator as any).standalone)) {
      setShowBanner(true)
      clearTimeout(timer)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-banner-dismissed', 'true')
    setShowBanner(false)
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // For iOS/Others, we can show a toast with instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
      if (isIOS) {
        alert("To install PaisaLog:\n1. Tap the 'Share' button in your browser\n2. Scroll down and tap 'Add to Home Screen' ✓")
      } else {
        // Fallback for browsers that don't support install prompts
        alert("To install this app, please use the 'Install' or 'Add to Home Screen' option in your browser's menu.")
      }
      return
    }
    
    // Show the install prompt
    deferredPrompt.prompt()
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)
    setShowBanner(false)
  }

  if (!showBanner || isStandalone) return null

  return (
    <div 
      className="fixed bottom-20 left-4 right-4 z-50 animate-toast-in"
      style={{
        maxWidth: '448px',
        margin: '0 auto',
      }}
    >
      <div 
        className="card p-4 flex items-center justify-between"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-primary)',
          boxShadow: 'var(--shadow-toast)',
          gap: 'var(--space-3)'
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
          >
            <Smartphone size={20} />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
              Recommended to use in mobile
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Install PaisaLog for a better experience
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
            style={{ 
              backgroundColor: 'var(--color-primary)', 
              color: 'white',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Download size={14} /> Download
          </button>
          
          <button
            onClick={handleDismiss}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--color-text-muted)', border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

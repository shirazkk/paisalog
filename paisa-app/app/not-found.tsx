import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="page-content" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '80vh', 
      textAlign: 'center',
      padding: 'var(--space-6)' 
    }}>
      <div style={{ 
        width: '64px', 
        height: '64px', 
        borderRadius: '20px', 
        backgroundColor: 'var(--color-primary-light)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: 'var(--space-4)',
        color: 'var(--color-primary)'
      }}>
        <AlertCircle size={32} />
      </div>
      <h1 className="text-page-title" style={{ marginBottom: 'var(--space-2)' }}>Page not found</h1>
      <p className="text-meta" style={{ marginBottom: 'var(--space-6)', maxWidth: '300px' }}>
        We couldn't find the page you're looking for. Let's get you back to your budget tracker.
      </p>
      <Link href="/dashboard" className="btn btn-primary" style={{ width: 'auto', padding: '0 var(--space-8)' }}>
        Back to Dashboard
      </Link>
    </div>
  )
}

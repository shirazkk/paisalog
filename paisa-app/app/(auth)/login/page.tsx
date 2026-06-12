'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { showToast } from '@/lib/toast'
import { Eye, EyeOff, Wallet, User as UserIcon } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required.').email('Please enter a valid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

/**
 * Hallmark · macrostructure: Workbench · tone: Utilitarian+Warm · anchor hue: blue
 */
export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        showToast(error.message === 'Invalid login credentials' ? 'Incorrect email or password.' : error.message, 'error')
        return
      }

      showToast('Logged in successfully ✓', 'success')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      showToast("Couldn't log in. Please try again.", 'error')
    }
  }

  return (
    <div className="app-container" style={{ maxWidth: '400px', margin: '0 auto', padding: '0 var(--space-4)' }}>
      {/* 1. Header Section */}
      <header className="flex flex-col items-center text-center px-4" style={{ marginTop: 'var(--space-12)', marginBottom: 'var(--space-6)' }}>
        <div className="flex items-center justify-center mb-4" style={{ width: '64px', height: '64px', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--color-primary)', color: '#ffffff' }}>
          <Wallet size={36} />
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text)' }}>PaisaLog</h1>
        <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>Your family's trusted financial ledger</p>
      </header>

      {/* 2. Login Form Section */}
      <main className="px-4">
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)' }}>Welcome Back</h2>
          <p style={{ fontSize: '15px', color: 'var(--color-text-muted)' }}>Sign in to manage your daily logs</p>
        </div>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Email Field */}
          <div className="flex flex-col" style={{ gap: 'var(--space-1)' }}>
            <label style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              className={`input ${form.formState.errors.email ? 'input-error' : ''}`}
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="error-message" style={{ color: 'var(--color-error)' }}>
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col relative" style={{ gap: 'var(--space-1)' }}>
            <label style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`input ${form.formState.errors.password ? 'input-error' : ''}`}
                {...form.register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-[var(--color-primary)]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="error-message" style={{ color: 'var(--color-error)' }}>
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }} href="/forgot-password" className="hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="btn btn-primary"
            style={{ marginTop: 'var(--space-6)' }}
          >
            {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center" style={{ margin: 'var(--space-6) 0' }}>
          <div className="flex-grow h-px" style={{ backgroundColor: 'var(--color-border)' }}></div>
          <span style={{ padding: '0 var(--space-4)', fontSize: '13px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
          <div className="flex-grow h-px" style={{ backgroundColor: 'var(--color-border)' }}></div>
        </div>

        {/* Guest Action */}
        <button
          onClick={() => showToast('Guest mode is for demo. Please create an account.', 'info')}
          className="w-full flex items-center justify-center gap-2 border-[1.5px] border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors"
          style={{ height: 'var(--btn-height)', borderRadius: 'var(--border-radius)', fontWeight: 600, fontSize: '15px', color: 'var(--color-text)' }}
        >
          <UserIcon size={18} /> Continue as Guest
        </button>

        {/* Sign Up Link */}
        <div className="text-center" style={{ marginTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
          <p style={{ fontSize: '15px', color: 'var(--color-text-muted)' }}>
            Don't have an account?{' '}
            <Link style={{ fontWeight: 600, color: 'var(--color-primary)' }} href="/signup" className="hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

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
      console.error('[Login Error]', err)
      showToast("Couldn't log in. Please try again.", 'error')
    }
  }

  const handleGuestSignIn = () => {
    showToast('Guest mode is for demo. Please create an account.', 'info')
  }

  return (
    <div className="app-container bg-bg">
      {/* 1. Header Section */}
      <header className="flex flex-col items-center text-center mt-[48px] mb-[24px] px-4">
        <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mb-4 text-on-primary">
          <Wallet size={36} />
        </div>
        <h1 className="text-page-title text-text-primary">PaisaLog</h1>
        <p className="text-body text-text-muted mt-1">Your family's trusted financial ledger</p>
      </header>

      {/* 2. Login Form Section */}
      <main className="px-4">
        <div className="mb-6">
          <h2 className="text-section-heading text-text-primary">Welcome Back</h2>
          <p className="text-body text-text-muted">Sign in to manage your daily logs</p>
        </div>

        <form className="space-y-[16px]" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Email Field */}
          <div className="flex flex-col gap-[4px]">
            <label className="text-meta text-text-muted">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              className={`input ${form.formState.errors.email ? 'input-error' : ''}`}
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="error-message">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-[4px] relative">
            <label className="text-meta text-text-muted">Password</label>
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="error-message">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link className="text-meta text-primary font-medium hover:underline" href="/forgot-password">
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="btn btn-primary mt-[24px]"
          >
            {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-[24px]">
          <div className="flex-grow h-px bg-border"></div>
          <span className="px-4 text-meta text-text-muted uppercase tracking-wider">or</span>
          <div className="flex-grow h-px bg-border"></div>
        </div>

        {/* Guest Action */}
        <button
          onClick={handleGuestSignIn}
          className="w-full h-[52px] border-[1.5px] border-border rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors font-semibold text-[15px] text-text-primary"
        >
          <UserIcon size={18} /> Continue as Guest
        </button>

        {/* Sign Up Link */}
        <div className="text-center mt-[24px] pb-6">
          <p className="text-body text-text-muted">
            Don't have an account?{' '}
            <Link className="text-primary font-semibold hover:underline" href="/signup">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

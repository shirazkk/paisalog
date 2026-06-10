'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { showToast } from '@/lib/toast'
import { Eye, EyeOff, Wallet } from 'lucide-react'

const signupSchema = z.object({
  displayName: z.string().min(1, 'Display name is required.').max(50, 'Max 50 characters.'),
  email: z.string().min(1, 'Email is required.').email('Please enter a valid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: SignupFormValues) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            display_name: values.displayName,
            role: 'dad',
          },
        },
      })

      if (error) {
        showToast(error.message, 'error')
        return
      }

      if (data.user) {
        showToast('Account created successfully ✓', 'success')
        router.push('/join-household')
        router.refresh()
      }
    } catch (err) {
      console.error('[Signup Error]', err)
      showToast("Couldn't create account. Please try again.", 'error')
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg p-page-margin">
      {/* Header Section */}
      <header className="flex flex-col items-center text-center mt-section-gap mb-section-gap">
        <div className="w-16 h-16 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-4">
          <Wallet size={32} />
        </div>
        <h1 className="text-page-title text-text-primary">PaisaLog</h1>
        <p className="text-body text-text-muted mt-1">Simplify your family's shared expenses.</p>
      </header>

      {/* Main Illustration Section (Placeholder matching layout) */}
      <div className="w-full max-w-[280px] mx-auto mb-section-gap">
        <div className="w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center text-text-muted">
           [Illustration Placeholder]
        </div>
      </div>

      {/* Sign Up Form */}
      <main className="flex-grow">
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Display Name */}
          <div className="flex flex-col gap-1">
            <label className="text-meta text-text-muted transition-colors">Display Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              className={`input ${form.formState.errors.displayName ? 'input-error' : ''}`}
              {...form.register('displayName')}
            />
            {form.formState.errors.displayName && (
              <p className="error-message flex items-center gap-1">
                <span className="text-error">⚠</span>
                {form.formState.errors.displayName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-meta text-text-muted transition-colors">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              className={`input ${form.formState.errors.email ? 'input-error' : ''}`}
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="error-message flex items-center gap-1">
                <span className="text-error">⚠</span>
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1 relative">
            <label className="text-meta text-text-muted transition-colors">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`input pr-12 ${form.formState.errors.password ? 'input-error' : ''}`}
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
              <p className="error-message flex items-center gap-1">
                <span className="text-error">⚠</span>
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="btn btn-primary mt-6 disabled:opacity-50"
          >
            {form.formState.isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Terms & Privacy */}
        <p className="mt-4 text-meta text-text-muted text-center leading-relaxed">
          By creating an account, you agree to our{' '}
          <Link className="text-primary font-semibold hover:underline" href="/terms">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link className="text-primary font-semibold hover:underline" href="/privacy">
            Privacy Policy
          </Link>
          .
        </p>

        {/* Navigation Footer */}
        <div className="text-center mt-section-gap">
          <p className="text-body text-text-muted">
            Already have an account?{' '}
            <Link className="text-primary font-semibold hover:underline" href="/login">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

import { FormEvent, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useSession } from '../../context/SessionContext'
import { supabase } from '../../supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export default function SignUpPage() {
  const { session } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  if (session) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface-900 px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-4">✉️</div>
          <h2 className="text-xl font-bold text-slate-100">Check your email</h2>
          <p className="mt-2 text-sm text-surface-400">
            We sent a confirmation link to <span className="text-slate-200">{email}</span>
          </p>
          <Link to="/auth/sign-in" className="mt-6 inline-block text-sm text-brand-400 hover:text-brand-300">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-3xl">⚡</span>
          <h1 className="mt-2 text-2xl font-bold text-slate-100">
            <span className="text-brand-400">Forge</span>Fit
          </h1>
          <p className="mt-1 text-sm text-surface-400">Start tracking your fitness journey</p>
        </div>

        <div className="rounded-card border border-surface-700 bg-surface-800 p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />

            {error && (
              <p className="rounded-btn bg-red-500/10 px-3 py-2 text-sm text-red-400 border border-red-500/20">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} fullWidth className="mt-1">
              Create account
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-surface-400">
          Already have an account?{' '}
          <Link to="/auth/sign-in" className="text-brand-400 hover:text-brand-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

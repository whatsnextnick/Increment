import { FormEvent, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useSession } from '../../context/SessionContext'
import { supabase } from '../../supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export default function SignInPage() {
  const { session } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (session) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-3xl">⚡</span>
          <h1 className="mt-2 text-2xl font-bold text-slate-100">
            <span className="text-brand-400">Forge</span>Fit
          </h1>
          <p className="mt-1 text-sm text-surface-400">Sign in to track your progress</p>
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
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <p className="rounded-btn bg-red-500/10 px-3 py-2 text-sm text-red-400 border border-red-500/20">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} fullWidth className="mt-1">
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-surface-400">
          Don't have an account?{' '}
          <Link to="/auth/sign-up" className="text-brand-400 hover:text-brand-300 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

import { FormEvent, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useSession } from '../../context/SessionContext'
import { supabase } from '../../supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { BlurFade } from '../../components/magicui/blur-fade'
import { BorderBeam } from '../../components/magicui/border-beam'

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
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <BlurFade delay={0} duration={0.45}>
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl btn-gradient glow-brand mb-4">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17l5-5 4 4 9-9" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gradient-brand">Increm</h1>
            <p className="mt-1.5 text-sm text-surface-400">Sign in to track your progress</p>
          </div>
        </BlurFade>

        {/* Form card */}
        <BlurFade delay={0.1} duration={0.45}>
          <div className="relative glass rounded-card p-6">
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
                <p className="rounded-btn bg-rose-500/10 px-3 py-2 text-sm text-rose-400 border border-rose-500/20">
                  {error}
                </p>
              )}

              <Button type="submit" loading={loading} fullWidth className="mt-1">
                Sign in
              </Button>
            </form>

            <BorderBeam size={100} duration={10} colorFrom="#8b5cf6" colorTo="#22d3ee" borderWidth={1.5} />
          </div>
        </BlurFade>

        <BlurFade delay={0.2} duration={0.45}>
          <p className="mt-4 text-center text-sm text-surface-400">
            Don't have an account?{' '}
            <Link to="/auth/sign-up" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </BlurFade>

      </div>
    </div>
  )
}

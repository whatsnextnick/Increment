import { FormEvent, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useSession } from '../../context/SessionContext'
import { supabase } from '../../supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { BlurFade } from '../../components/magicui/blur-fade'
import { BorderBeam } from '../../components/magicui/border-beam'

export default function SignUpPage() {
  const { session } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [loading, setLoading] = useState(false)

  if (session) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
    } else {
      if (data.user && !data.session) {
        setNeedsConfirmation(true)
      }
    }
    setLoading(false)
  }

  if (needsConfirmation) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <BlurFade delay={0} duration={0.4}>
          <div className="relative w-full max-w-sm text-center glass rounded-card p-8">
            <div className="text-4xl mb-4">✉️</div>
            <h2 className="text-xl font-bold text-slate-100">Check your email</h2>
            <p className="mt-2 text-sm text-surface-400">
              We sent a confirmation link to <span className="text-slate-200">{email}</span>
            </p>
            <p className="mt-4 text-xs text-surface-500">
              Click the link in the email to activate your account
            </p>
            <Link to="/auth/sign-in" className="mt-6 inline-block text-sm text-brand-400 hover:text-brand-300 transition-colors">
              Back to sign in
            </Link>
            <BorderBeam size={120} duration={8} colorFrom="#10b981" colorTo="#22d3ee" borderWidth={1.5} />
          </div>
        </BlurFade>
      </div>
    )
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
            <p className="mt-1.5 text-sm text-surface-400">Start tracking your fitness journey</p>
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
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />

              {error && (
                <p className="rounded-btn bg-rose-500/10 px-3 py-2 text-sm text-rose-400 border border-rose-500/20">
                  {error}
                </p>
              )}

              <Button type="submit" loading={loading} fullWidth className="mt-1">
                Create account
              </Button>
            </form>

            <BorderBeam size={100} duration={10} colorFrom="#8b5cf6" colorTo="#22d3ee" borderWidth={1.5} />
          </div>
        </BlurFade>

        <BlurFade delay={0.2} duration={0.45}>
          <p className="mt-4 text-center text-sm text-surface-400">
            Already have an account?{' '}
            <Link to="/auth/sign-in" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </BlurFade>

      </div>
    </div>
  )
}

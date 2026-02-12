import { Link, Navigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { Button } from '../components/ui/Button'

export default function HomePage() {
  const { session } = useSession()

  if (session) return <Navigate to="/dashboard" replace />

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface-900 px-4">
      <div className="max-w-lg text-center">
        <div className="mb-6 text-5xl">⚡</div>
        <h1 className="text-4xl font-extrabold text-slate-100 sm:text-5xl">
          <span className="text-brand-400">Forge</span>Fit
        </h1>
        <p className="mt-4 text-lg text-surface-400">
          Track workouts, monitor progress, and hit new PRs.
          Built for lifters who take progressive overload seriously.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link to="/auth/sign-up">
            <Button size="lg">Get started free</Button>
          </Link>
          <Link to="/auth/sign-in">
            <Button size="lg" variant="secondary">Sign in</Button>
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '🏋', label: 'Log workouts', desc: 'Sets, reps, weight' },
            { icon: '📈', label: 'Track progress', desc: 'Charts & trends' },
            { icon: '🎯', label: 'Hit PRs', desc: 'Progressive overload' },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="rounded-card border border-surface-700 bg-surface-800 p-4">
              <div className="text-2xl">{icon}</div>
              <p className="mt-2 text-sm font-semibold text-slate-200">{label}</p>
              <p className="text-xs text-surface-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

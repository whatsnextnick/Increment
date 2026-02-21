import { Link, useLocation } from 'react-router-dom'
import { useSession } from '../../context/SessionContext'
import { useProfile } from '../../hooks/useProfile'
import { supabase } from '../../supabase'

const navItems = [
  { to: '/dashboard',  label: 'Dashboard', icon: '▦' },
  { to: '/workouts',   label: 'Workouts',  icon: '🏋' },
  { to: '/weight',     label: 'Weight',    icon: '⚖' },
  { to: '/exercises',  label: 'Exercises', icon: '📋' },
  { to: '/chat',       label: 'AI Coach',  icon: '🤖' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const { session } = useSession()
  const { profile } = useProfile()
  const { pathname } = useLocation()

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-40 h-14 border-b border-surface-700 bg-surface-900/80 backdrop-blur-sm">
        <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-100">
            <span className="text-xl">⚡</span>
            <span className="text-brand-400">Forge</span>Fit
          </Link>

          {session && (
            <nav className="hidden sm:flex items-center gap-1">
              {navItems.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-1.5 rounded-btn text-sm font-medium transition-colors
                    ${pathname.startsWith(to)
                      ? 'bg-brand-600/20 text-brand-400'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-surface-700'
                    }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2">
            {session ? (
              <>
                {profile?.role === 'admin' && (
                  <Link
                    to="/admin/knowledge"
                    className={`text-sm text-slate-400 hover:text-slate-100 px-3 py-1.5 rounded-btn transition-colors hover:bg-surface-700
                      ${pathname.startsWith('/admin') ? 'bg-accent-600/20 text-accent-400' : ''}`}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className={`text-sm text-slate-400 hover:text-slate-100 px-3 py-1.5 rounded-btn transition-colors hover:bg-surface-700
                    ${pathname === '/profile' ? 'bg-brand-600/20 text-brand-400' : ''}`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-slate-400 hover:text-slate-100 px-3 py-1.5 rounded-btn transition-colors hover:bg-surface-700"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/auth/sign-in"
                className="text-sm bg-brand-600 hover:bg-brand-500 text-white px-4 py-1.5 rounded-btn font-medium transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6">
        {children}
      </main>

      {/* Mobile bottom nav */}
      {session && (
        <nav className="sm:hidden sticky bottom-0 z-40 flex border-t border-surface-700 bg-surface-900/95 backdrop-blur-sm">
          {navItems.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors
                ${pathname.startsWith(to)
                  ? 'text-brand-400'
                  : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              <span className="text-lg leading-none">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}

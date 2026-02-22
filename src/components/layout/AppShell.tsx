import { Link, useLocation } from 'react-router-dom'
import { useSession } from '../../context/SessionContext'
import { useProfile } from '../../hooks/useProfile'
import { supabase } from '../../supabase'

const navItems = [
  {
    to: '/dashboard', label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    to: '/workouts', label: 'Workouts',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4v16M18 4v16M2 8h4M18 8h4M2 16h4M18 16h4" />
      </svg>
    ),
  },
  {
    to: '/weight', label: 'Weight',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l5-5 4 4 9-9" />
      </svg>
    ),
  },
  {
    to: '/exercises', label: 'Exercises',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    to: '/chat', label: 'AI Coach',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
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
      <header className="sticky top-0 z-40 h-14 glass-sm border-b border-white/[0.06]">
        <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-bold">
            <div className="w-7 h-7 rounded-lg btn-gradient flex items-center justify-center glow-sm">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17l5-5 4 4 9-9" />
              </svg>
            </div>
            <span className="text-gradient-brand text-lg tracking-tight">Increm</span>
          </Link>

          {/* Desktop nav */}
          {session && (
            <nav className="hidden sm:flex items-center gap-0.5">
              {navItems.map(({ to, label }) => {
                const active = pathname.startsWith(to)
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`px-3.5 py-1.5 rounded-btn text-sm font-medium transition-all duration-200 ${
                      active ? 'nav-pill-active' : 'text-surface-400 hover:text-slate-200 hover:bg-white/[0.05]'
                    }`}
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {session ? (
              <>
                {profile?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`text-xs font-medium px-3 py-1.5 rounded-btn transition-all duration-200 ${
                      pathname.startsWith('/admin')
                        ? 'nav-pill-active'
                        : 'text-surface-400 hover:text-slate-200 hover:bg-white/[0.05]'
                    }`}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className={`text-sm font-medium px-3 py-1.5 rounded-btn transition-all duration-200 ${
                    pathname === '/profile'
                      ? 'nav-pill-active'
                      : 'text-surface-400 hover:text-slate-200 hover:bg-white/[0.05]'
                  }`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-surface-400 hover:text-slate-200 px-3 py-1.5 rounded-btn transition-all duration-200 hover:bg-white/[0.05]"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/auth/sign-in"
                className="btn-gradient text-sm font-semibold text-white px-4 py-1.5 rounded-btn glow-sm"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-7">
        {children}
      </main>

      {/* Mobile bottom nav */}
      {session && (
        <nav className="sm:hidden sticky bottom-0 z-40 flex glass-sm border-t border-white/[0.06]">
          {navItems.map(({ to, label, icon }) => {
            const active = pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                  active ? 'text-brand-400' : 'text-surface-400 hover:text-slate-300'
                }`}
              >
                <span className={active ? 'text-brand-400' : ''}>{icon}</span>
                {label}
              </Link>
            )
          })}
        </nav>
      )}
    </div>
  )
}

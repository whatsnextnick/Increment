import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface-900 px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-brand-600">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-100">Page not found</h1>
        <p className="mt-2 text-sm text-surface-400">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 font-medium"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  )
}

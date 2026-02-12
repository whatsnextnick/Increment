import { Spinner } from '../components/ui/Spinner'

export default function LoadingPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface-900">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-surface-400">Loading…</p>
      </div>
    </div>
  )
}

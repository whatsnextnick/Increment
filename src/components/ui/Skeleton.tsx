interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  count?: number
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const baseStyles = 'bg-surface-700 animate-pulse'

  const variantStyles = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-btn',
  }

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  ))

  return count === 1 ? items[0] : <div className="space-y-3">{items}</div>
}

export function SkeletonCard() {
  return (
    <div className="rounded-card border border-surface-700 bg-surface-800 p-6">
      <Skeleton variant="text" width="60%" className="mb-4" />
      <Skeleton variant="text" width="100%" count={3} />
      <Skeleton variant="rectangular" width="100%" height={200} className="mt-4" />
      <div className="mt-4 flex gap-2">
        <Skeleton variant="rectangular" width={80} height={32} />
        <Skeleton variant="rectangular" width={80} height={32} />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 border-b border-surface-700 pb-3">
        <Skeleton variant="text" width={150} />
        <Skeleton variant="text" width={150} />
        <Skeleton variant="text" width={100} />
        <Skeleton variant="text" width={100} />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-4 items-center py-2">
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={150} />
          <Skeleton variant="text" width={150} />
          <Skeleton variant="text" width={100} />
          <Skeleton variant="rectangular" width={80} height={32} />
        </div>
      ))}
    </div>
  )
}

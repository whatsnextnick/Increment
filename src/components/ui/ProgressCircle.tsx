interface ProgressCircleProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  className?: string
  showValue?: boolean
  label?: string
}

export function ProgressCircle({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className = '',
  showValue = true,
  label,
}: ProgressCircleProps) {
  const percentage = Math.min((value / max) * 100, 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-surface-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-brand-500 transition-all duration-1000 ease-out"
        />
      </svg>

      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-100">
            {Math.round(percentage)}%
          </span>
          {label && (
            <span className="text-xs text-surface-400 mt-1">{label}</span>
          )}
        </div>
      )}
    </div>
  )
}

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  showValue?: boolean
  variant?: 'default' | 'success' | 'warning' | 'danger'
  label?: string
}

export function ProgressBar({
  value,
  max = 100,
  className = '',
  showValue = true,
  variant = 'default',
  label,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  const variantColors = {
    default: 'bg-brand-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  }

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-200">{label}</span>
          {showValue && (
            <span className="text-sm text-surface-400">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${variantColors[variant]} transition-all duration-1000 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  )
}

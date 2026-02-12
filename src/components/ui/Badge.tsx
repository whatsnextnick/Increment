import { HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'accent'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  default:  'bg-surface-700 text-slate-300',
  brand:    'bg-brand-600/20 text-brand-300 border border-brand-500/30',
  success:  'bg-green-500/10 text-green-400 border border-green-500/20',
  warning:  'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  danger:   'bg-red-500/10 text-red-400 border border-red-500/20',
  accent:   'bg-accent-500/10 text-accent-400 border border-accent-500/20',
}

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

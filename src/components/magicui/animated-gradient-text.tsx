import type { CSSProperties } from 'react'

interface AnimatedGradientTextProps {
  children: React.ReactNode
  className?: string
  colorFrom?: string
  colorTo?: string
  /** Relative speed multiplier — higher = faster */
  speed?: number
}

export function AnimatedGradientText({
  children,
  className = '',
  colorFrom = '#c4b5fd',
  colorTo = '#22d3ee',
  speed = 1,
}: AnimatedGradientTextProps) {
  return (
    <span
      style={{
        '--grad-from': colorFrom,
        '--grad-to': colorTo,
        '--grad-speed': `${3 / speed}s`,
      } as CSSProperties}
      className={`animated-gradient-text ${className}`}
    >
      {children}
    </span>
  )
}

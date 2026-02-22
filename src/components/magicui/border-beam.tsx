import type { CSSProperties } from 'react'

interface BorderBeamProps {
  /** Arc size in degrees (0–360) */
  size?: number
  duration?: number
  delay?: number
  colorFrom?: string
  colorTo?: string
  borderWidth?: number
  className?: string
}

export function BorderBeam({
  size = 90,
  duration = 8,
  delay = 0,
  colorFrom = '#8b5cf6',
  colorTo = '#22d3ee',
  borderWidth = 1.5,
  className = '',
}: BorderBeamProps) {
  return (
    <div
      aria-hidden
      style={{
        '--size': size,
        '--duration': duration,
        '--delay': delay,
        '--color-from': colorFrom,
        '--color-to': colorTo,
        '--border-width': borderWidth,
      } as CSSProperties}
      className={`border-beam pointer-events-none absolute inset-0 rounded-[inherit] ${className}`}
    />
  )
}

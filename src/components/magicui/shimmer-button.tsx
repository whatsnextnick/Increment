import type { ButtonHTMLAttributes, CSSProperties } from 'react'

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  shimmerDuration?: string
  background?: string
  borderRadius?: string
}

export function ShimmerButton({
  shimmerColor = 'rgba(255,255,255,0.25)',
  shimmerDuration = '2.5s',
  background = 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
  borderRadius = '0.625rem',
  className = '',
  children,
  style,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      style={
        {
          '--shimmer-color': shimmerColor,
          '--shimmer-duration': shimmerDuration,
          '--shimmer-bg': background,
          borderRadius,
          ...style,
        } as CSSProperties
      }
      className={`shimmer-button ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

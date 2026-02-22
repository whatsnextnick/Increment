import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring, useInView } from 'motion/react'

interface NumberTickerProps {
  value: number
  direction?: 'up' | 'down'
  delay?: number
  decimalPlaces?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function NumberTicker({
  value,
  direction = 'up',
  delay = 0,
  decimalPlaces = 0,
  className,
  prefix = '',
  suffix = '',
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionVal = useMotionValue(direction === 'down' ? value : 0)
  const springVal = useSpring(motionVal, { damping: 60, stiffness: 100 })
  const isInView = useInView(ref, { once: true, margin: '-40px' as `${number}px` })

  useEffect(() => {
    if (!isInView) return
    const t = setTimeout(
      () => motionVal.set(direction === 'down' ? 0 : value),
      delay * 1000
    )
    return () => clearTimeout(t)
  }, [isInView, value, direction, delay, motionVal])

  useEffect(() => {
    return springVal.on('change', (v) => {
      if (!ref.current) return
      ref.current.textContent =
        prefix +
        Intl.NumberFormat('en-US', {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        }).format(Number(v.toFixed(decimalPlaces))) +
        suffix
    })
  }, [springVal, prefix, suffix, decimalPlaces])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {direction === 'down' ? value.toFixed(decimalPlaces) : (0).toFixed(decimalPlaces)}
      {suffix}
    </span>
  )
}

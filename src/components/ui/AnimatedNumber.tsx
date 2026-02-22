import { useEffect, useState, useRef } from 'react'

interface AnimatedNumberProps {
  value: number
  duration?: number
  className?: string
  decimals?: number
  suffix?: string
  prefix?: string
}

export function AnimatedNumber({
  value,
  duration = 1000,
  className = '',
  decimals = 0,
  suffix = '',
  prefix = '',
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView) {
          setIsInView(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [isInView])

  useEffect(() => {
    if (!isInView) return

    const startTime = Date.now()
    const startValue = displayValue
    const difference = value - startValue

    const updateValue = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)

      // Easing function (easeOutQuart)
      const eased = 1 - Math.pow(1 - progress, 4)
      const current = startValue + difference * eased

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(updateValue)
      } else {
        setDisplayValue(value)
      }
    }

    requestAnimationFrame(updateValue)
  }, [value, duration, isInView])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {displayValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}

import { useRef } from 'react'
import { motion, useInView } from 'motion/react'

interface BlurFadeProps {
  children: React.ReactNode
  className?: string
  duration?: number
  delay?: number
  offset?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  inView?: boolean
  blur?: string
}

export function BlurFade({
  children,
  className,
  duration = 0.4,
  delay = 0,
  offset = 8,
  direction = 'up',
  inView: useInViewTrigger = true,
  blur = '8px',
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' as `${number}px` })

  const yOffset = direction === 'up' ? offset : direction === 'down' ? -offset : 0
  const xOffset = direction === 'left' ? offset : direction === 'right' ? -offset : 0

  const initial = { opacity: 0, filter: `blur(${blur})`, y: yOffset, x: xOffset }
  const visible = { opacity: 1, filter: 'blur(0px)', y: 0, x: 0 }

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={useInViewTrigger ? (isInView ? visible : initial) : visible}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

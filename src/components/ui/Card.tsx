import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-6' }

export function Card({ padding = 'md', className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`glass rounded-card ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

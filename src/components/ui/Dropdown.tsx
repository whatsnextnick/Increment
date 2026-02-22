import { ReactNode, useEffect, useRef, useState } from 'react'

interface DropdownProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'left' | 'right'
}

export function Dropdown({ trigger, children, align = 'right' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const alignmentClasses = align === 'left' ? 'left-0' : 'right-0'

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute ${alignmentClasses} mt-2 w-56 rounded-card border border-surface-700 bg-surface-800 shadow-xl z-50 animate-scale-in origin-top-${align}`}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

interface DropdownItemProps {
  children: ReactNode
  onClick?: () => void
  icon?: ReactNode
  variant?: 'default' | 'danger'
  disabled?: boolean
}

export function DropdownItem({
  children,
  onClick,
  icon,
  variant = 'default',
  disabled = false,
}: DropdownItemProps) {
  const variantClasses = {
    default: 'text-slate-200 hover:bg-surface-700 hover:text-slate-100',
    danger: 'text-red-400 hover:bg-red-600/10 hover:text-red-300',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : variantClasses[variant]
      }`}
      role="menuitem"
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}

export function DropdownDivider() {
  return <div className="my-1 border-t border-surface-700" role="separator" />
}

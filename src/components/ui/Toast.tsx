import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, variant: ToastVariant = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = { id, message, variant, duration }

    setToasts(prev => [...prev, newToast])

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const variantStyles = {
    success: 'bg-green-600 border-green-500 text-white',
    error: 'bg-red-600 border-red-500 text-white',
    warning: 'bg-amber-600 border-amber-500 text-white',
    info: 'bg-blue-600 border-blue-500 text-white',
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <div
      className={`pointer-events-auto min-w-[300px] max-w-md rounded-card border px-4 py-3 shadow-lg animate-slide-in-right ${variantStyles[toast.variant]}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl font-bold flex-shrink-0">{icons[toast.variant]}</span>
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

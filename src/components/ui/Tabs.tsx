import { ReactNode, useState, createContext, useContext } from 'react'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within Tabs')
  }
  return context
}

interface TabsProps {
  defaultValue: string
  children: ReactNode
  className?: string
}

export function Tabs({ defaultValue, children, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: ReactNode
  className?: string
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div
      className={`flex gap-1 border-b border-surface-700 ${className}`}
      role="tablist"
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
  disabled?: boolean
}

export function TabsTrigger({ value, children, disabled = false }: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext()
  const isActive = activeTab === value

  return (
    <button
      onClick={() => !disabled && setActiveTab(value)}
      disabled={disabled}
      className={`px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-[1px] ${
        isActive
          ? 'border-brand-500 text-brand-400'
          : 'border-transparent text-surface-400 hover:text-slate-300 hover:border-surface-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  const { activeTab } = useTabsContext()

  if (activeTab !== value) return null

  return (
    <div
      className={`pt-4 animate-fade-in ${className}`}
      role="tabpanel"
    >
      {children}
    </div>
  )
}

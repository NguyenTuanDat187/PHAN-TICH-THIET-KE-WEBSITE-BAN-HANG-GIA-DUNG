import { createContext, useContext, useState, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface TabsContextType {
  active: string;
  setActive: (v: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;

  const setActive = (v: string) => {
    setInternal(v);
    onValueChange?.(v);
  };

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 p-1 rounded-btn',
        'bg-bg-surface border border-border-default',
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger must be inside Tabs');
  const active = ctx.active === value;

  return (
    <button
      onClick={() => ctx.setActive(value)}
      className={cn(
        'h-8 px-3 rounded-md text-sm font-medium transition-all duration-app',
        active
          ? 'bg-bg-elevated text-text-primary shadow-sm'
          : 'text-text-secondary hover:text-text-primary'
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsContent must be inside Tabs');
  if (ctx.active !== value) return null;
  return <div className={cn('mt-4', className)}>{children}</div>;
}
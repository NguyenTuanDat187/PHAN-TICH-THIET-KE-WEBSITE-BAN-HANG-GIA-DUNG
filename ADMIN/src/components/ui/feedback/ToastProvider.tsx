import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { cn } from '../../../utils/cn';

type ToastVariant = 'success' | 'danger' | 'info' | 'warning';

interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (t: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const variantMap: Record<ToastVariant, { icon: ReactNode; color: string }> = {
  success: { icon: <CheckCircle2 size={18} />, color: 'text-status-success' },
  danger: { icon: <AlertCircle size={18} />, color: 'text-status-danger' },
  info: { icon: <Info size={18} />, color: 'text-status-info' },
  warning: { icon: <AlertTriangle size={18} />, color: 'text-status-warning' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  const success = useCallback((title: string, description?: string) => toast({ variant: 'success', title, description }), [toast]);
  const error = useCallback((title: string, description?: string) => toast({ variant: 'danger', title, description }), [toast]);
  const info = useCallback((title: string, description?: string) => toast({ variant: 'info', title, description }), [toast]);
  const warning = useCallback((title: string, description?: string) => toast({ variant: 'warning', title, description }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}

      {/* Toast viewport */}
      <div className="fixed top-4 right-4 z-200 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => {
          const v = variantMap[t.variant];
          return (
            <div
              key={t.id}
              className={cn(
                'flex items-start gap-3 p-4 rounded-card shadow-2xl pointer-events-auto',
                'bg-bg-elevated border border-border-default',
                'animate-in slide-in-from-right-full duration-200'
              )}
            >
              <div className={cn('shrink-0 mt-0.5', v.color)}>{v.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-text-primary text-sm font-medium">{t.title}</p>
                {t.description && (
                  <p className="text-text-muted text-xs mt-0.5">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => remove(t.id)}
                className="shrink-0 w-6 h-6 rounded flex items-center justify-center text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
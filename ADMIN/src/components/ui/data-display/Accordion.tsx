import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface AccordionProps {
  children: ReactNode;
  className?: string;
}

export function Accordion({ children, className }: AccordionProps) {
  return <div className={cn('divide-y divide-border-default', className)}>{children}</div>;
}

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, children, defaultOpen }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center justify-between gap-3 py-4 text-left',
          'text-text-primary font-medium text-sm',
          'transition-colors duration-app hover:text-accent-primary'
        )}
      >
        <span>{title}</span>
        <ChevronDown
          size={18}
          className={cn(
            'text-text-muted transition-transform duration-app shrink-0',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div className="pb-4 text-text-secondary text-sm leading-relaxed animate-in fade-in slide-in-from-top-1 duration-150">
          {children}
        </div>
      )}
    </div>
  );
}
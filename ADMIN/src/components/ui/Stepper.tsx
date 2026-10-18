import { cn } from '../../utils/cn';

interface StepperProps {
  current: 'otp' | 'reset';
}

export function Stepper({ current }: StepperProps) {
  const steps = [
    { key: 'email', label: 'Email' },
    { key: 'otp',   label: 'Xác thực' },
    { key: 'reset', label: 'Đặt lại' },
  ];
  const currentIdx = current === 'otp' ? 1 : 2;

  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                done ? 'bg-accent-primary text-black'
                  : active ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary'
                  : 'bg-bg-elevated text-text-muted border border-border-strong'
              )}>
                {done ? '✓' : ''}
              </div>
              <span className={cn(
                'text-[10px] font-medium',
                active || done ? 'text-text-primary' : 'text-text-muted'
              )}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                'h-0.5 flex-1 mx-2 -mt-5 rounded-full transition-colors',
                done ? 'bg-accent-primary' : 'bg-border-strong'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
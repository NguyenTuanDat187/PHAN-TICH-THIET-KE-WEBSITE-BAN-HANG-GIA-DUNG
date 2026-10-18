import { useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react';
import { cn } from '../../utils/cn';

interface OtpInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  autoFocus?: boolean;
}

export function OtpInput({ value, onChange, autoFocus }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) setTimeout(() => refs.current[0]?.focus(), 100);
  }, [autoFocus]);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...value];
    next[index] = val.slice(-1);
    onChange(next);
    if (val && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) refs.current[index - 1]?.focus();
    if (e.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) refs.current[index + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const next = ['', '', '', '', '', ''];
    text.split('').forEach((ch, i) => (next[i] = ch));
    onChange(next);
    refs.current[Math.min(text.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            'w-12 h-14 rounded-btn text-center',
            'bg-bg-elevated border-2 border-border-strong',
            'text-text-primary text-xl font-bold font-mono',
            'transition-all duration-app',
            'focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30',
            digit && 'border-accent-primary/60'
          )}
        />
      ))}
    </div>
  );
}
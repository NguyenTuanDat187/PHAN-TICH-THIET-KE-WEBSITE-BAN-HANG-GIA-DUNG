import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  label?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function DatePicker({ value, onChange, placeholder = 'Chọn ngày', label }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectDate = (day: number) => {
    onChange(new Date(year, month, day));
    setOpen(false);
  };

  const format = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
  };

  const isSelected = (day: number) =>
    !!value && value.getDate() === day && value.getMonth() === month && value.getFullYear() === year;

  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  return (
    <div className="w-full" ref={ref}>
      {label && (
        <label className="block text-text-secondary text-sm font-medium mb-2">{label}</label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            'w-full h-input px-4 rounded-btn text-sm text-left',
            'flex items-center justify-between gap-2',
            'bg-bg-elevated border border-border-strong',
            'transition-all duration-app',
            'focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary',
            !value && 'text-text-muted',
            value && 'text-text-primary'
          )}
        >
          <span>{value ? format(value) : placeholder}</span>
          <CalendarIcon size={16} className="text-text-muted shrink-0" />
        </button>

        {open && (
          <div className={cn(
            'absolute top-full mt-2 left-0 z-50 p-4 rounded-card w-72',
            'bg-bg-elevated border border-border-default shadow-2xl',
            'animate-in fade-in zoom-in-95 duration-150'
          )}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setViewDate(new Date(year, month - 1, 1))}
                className="w-8 h-8 rounded-btn flex items-center justify-center text-text-secondary hover:bg-bg-hover transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <p className="text-text-primary text-sm font-medium">
                {MONTHS[month]} {year}
              </p>
              <button
                type="button"
                onClick={() => setViewDate(new Date(year, month + 1, 1))}
                className="w-8 h-8 rounded-btn flex items-center justify-center text-text-secondary hover:bg-bg-hover transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-text-muted text-[10px] font-medium py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => (
                <div key={i}>
                  {day ? (
                    <button
                      type="button"
                      onClick={() => selectDate(day)}
                      className={cn(
                        'w-full aspect-square rounded-md text-xs font-medium',
                        'transition-colors duration-app',
                        isSelected(day)
                          ? 'bg-accent-primary text-black'
                          : isToday(day)
                          ? 'bg-accent-primary/15 text-accent-primary'
                          : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                      )}
                    >
                      {day}
                    </button>
                  ) : (
                    <div />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
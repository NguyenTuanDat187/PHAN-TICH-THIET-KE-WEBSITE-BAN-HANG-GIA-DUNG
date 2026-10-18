import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/cn';

type Accent = 'primary' | 'cyan' | 'warning' | 'purple';

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  icon?: LucideIcon;
  accent?: Accent;
}

const accentMap: Record<Accent, string> = {
  primary: 'bg-accent-primary/10 text-accent-primary',
  cyan:    'bg-accent-cyan/10 text-accent-cyan',
  warning: 'bg-status-warning/10 text-status-warning',
  purple:  'bg-status-purple/10 text-status-purple',
};

export default function StatCard({
  label, value, change, icon: Icon, accent = 'primary',
}: StatCardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <div className={cn(
      'p-5 flex flex-col gap-3',
      'bg-bg-surface border border-border-default rounded-card'
    )}>
      <div className="flex items-start justify-between">
        <p className="text-text-secondary text-sm">{label}</p>
        {Icon && (
          <div className={cn(
            'w-9 h-9 rounded-btn flex items-center justify-center',
            accentMap[accent]
          )}>
            <Icon size={18} strokeWidth={2} />
          </div>
        )}
      </div>

      <div>
        <p className="text-text-primary text-2xl font-semibold tracking-tight">{value}</p>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs mt-1.5 font-medium',
            isPositive ? 'text-status-success' : 'text-status-danger'
          )}>
            {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            <span>{isPositive ? '+' : ''}{change}%</span>
            <span className="text-text-muted font-normal ml-1">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
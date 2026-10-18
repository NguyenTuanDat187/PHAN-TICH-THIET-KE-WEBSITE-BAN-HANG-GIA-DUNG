/**
 * Spinner
 * -------
 * Icon loading xoay tròn.
 *
 * @example
 * <Spinner size="lg" />
 */
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

type Size = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: Size;
  className?: string;
}

const sizeMap = {
  sm: 14,
  md: 20,
  lg: 32,
};

export default function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <Loader2
      size={sizeMap[size]}
      className={cn('animate-spin text-accent-primary', className)}
    />
  );
}
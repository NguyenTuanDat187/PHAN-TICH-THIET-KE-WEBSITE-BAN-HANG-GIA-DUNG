/**
 * Skeleton
 * --------
 * Khung loading placeholder khi data chưa về.
 *
 * @example
 * <Skeleton className="w-full h-8" />
 * <Skeleton variant="circular" className="w-10 h-10" />
 */
import { cn } from '../../../utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export default function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-bg-elevated',
        variant === 'text' && 'h-4 rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-btn',
        className
      )}
    />
  );
}
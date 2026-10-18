/**
 * Card
 * ----
 * Khung nội dung bo tròn. Có 3 sub-component:
 * CardHeader, CardBody, CardFooter.
 *
 * @example
 * <Card>
 *   <CardHeader>Tiêu đề</CardHeader>
 *   <CardBody>Nội dung</CardBody>
 * </Card>
 */
import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-card',
        variant === 'default' && 'bg-bg-surface border border-border-default',
        variant === 'elevated' && 'bg-bg-elevated border border-border-default',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4 border-b border-border-default', className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4 border-t border-border-default', className)} {...props} />;
}
/**
 * Avatar
 * ------
 * Ảnh đại diện. Nếu không có `src` thì hiển thị chữ cái đầu của tên.
 *
 * @example
 * <Avatar name="Nguyen Van A" size="md" />
 * <Avatar src="/me.jpg" size="lg" />
 */
import { cn } from '../../utils/cn';

type Size = 'sm' | 'md' | 'lg';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: Size;
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

export default function Avatar({ src, name = '?', size = 'md', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={cn(
        'relative shrink-0 rounded-full overflow-hidden',
        'bg-bg-elevated border border-border-strong',
        'flex items-center justify-center font-semibold text-text-primary',
        sizeMap[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
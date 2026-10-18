/**
 * Tooltip
 * -------
 * Chú thích hiện khi hover. Hướng hiển thị: top/bottom/left/right.
 *
 * @example
 * <Tooltip content="Xoá" side="top"><button><Trash /></button></Tooltip>
 */
import { useState, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const [show, setShow] = useState(false);

  const sideMap = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={cn(
            'absolute z-50 px-2.5 py-1.5 rounded-md whitespace-nowrap',
            'bg-bg-elevated border border-border-strong text-text-primary text-xs',
            'shadow-lg pointer-events-none',
            'animate-in fade-in duration-150',
            sideMap[side]
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
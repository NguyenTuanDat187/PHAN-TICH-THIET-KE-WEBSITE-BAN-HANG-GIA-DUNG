/**
 * Table
 * -----
 * Shared table components.
 * Table, TableHeader, TableBody, TableRow, TableHead, TableCell.
 */

import {
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
  forwardRef,
} from 'react';

import { cn } from '../../../utils/cn';

export const Table = forwardRef<
  HTMLTableElement,
  HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <table
    ref={ref}
    className={cn('w-full min-w-0 table-fixed border-collapse', className)}
    {...props}
  />
));

Table.displayName = 'Table';

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('bg-bg-surface', className)}
    {...props}
  />
));

TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('divide-y divide-border-default', className)}
    {...props}
  />
));

TableBody.displayName = 'TableBody';

export const TableRow = forwardRef<
  HTMLTableRowElement,
  HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'h-12 transition-colors duration-app hover:bg-bg-hover/50',
      className
    )}
    {...props}
  />
));

TableRow.displayName = 'TableRow';

export const TableHead = forwardRef<
  HTMLTableCellElement,
  ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    className={cn(
      'px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted sm:px-4',
      className
    )}
    ref={ref}
    {...props}
  />
));

TableHead.displayName = 'TableHead';

export const TableCell = forwardRef<
  HTMLTableCellElement,
  TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'wrap-break-word px-3 py-2 text-sm text-text-secondary sm:px-4',
      className
    )}
    {...props}
  />
));

TableCell.displayName = 'TableCell';

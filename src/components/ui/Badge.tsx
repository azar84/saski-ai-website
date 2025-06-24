'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-200 select-none',
  {
    variants: {
      variant: {
        default: [
          'border-transparent bg-[#5243E9] text-white shadow-sm',
          'hover:bg-[#4338CA]'
        ],
        secondary: [
          'border-transparent bg-[#E2E8F0] text-[#475569]',
          'hover:bg-[#CBD4E1] dark:bg-[#27364B] dark:text-[#94A3B8] dark:hover:bg-[#475569]'
        ],
        success: [
          'border-transparent bg-[#10B981] text-white',
          'hover:bg-green-600'
        ],
        warning: [
          'border-transparent bg-[#F59E0B] text-white',
          'hover:bg-amber-600'
        ],
        error: [
          'border-transparent bg-[#EF4444] text-white',
          'hover:bg-red-600'
        ],
        info: [
          'border-transparent bg-[#3B82F6] text-white',
          'hover:bg-blue-600'
        ],
        outline: [
          'text-[#475569] border-[#E2E8F0] bg-transparent',
          'hover:bg-[#F6F8FC] dark:border-[#27364B] dark:text-[#94A3B8] dark:hover:bg-[#1E2A3B]'
        ],
        gradient: [
          'border-transparent bg-gradient-to-r from-[#5243E9] to-[#7C3AED] text-white shadow-sm',
          'hover:shadow-md hover:shadow-[#5243E9]/25'
        ],
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
      dot: {
        true: 'relative pl-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onRemove?: () => void;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, dot, children, icon, onRemove, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, dot, className }))}
        {...props}
      >
        {dot && (
          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-current opacity-75" />
        )}
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
        {onRemove && (
          <button
            onClick={onRemove}
            className="ml-1 flex-shrink-0 h-3 w-3 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors"
            aria-label="Remove"
          >
            <svg
              className="h-2 w-2"
              viewBox="0 0 8 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L7 7M7 1L1 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants }; 

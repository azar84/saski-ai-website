'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none relative overflow-hidden',
  {
    variants: {
      variant: {
        primary: [
          'bg-gradient-to-r from-[#5243E9] to-[#7C3AED] text-white shadow-lg shadow-[#5243E9]/25',
          'hover:shadow-xl hover:shadow-[#5243E9]/40 hover:scale-[1.02]',
          'active:scale-[0.98] focus-visible:ring-[#5243E9]',
          'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100'
        ],
        secondary: [
          'bg-[#E2E8F0] text-[#1E2A3B] shadow-sm',
          'hover:bg-[#CBD4E1] hover:shadow-md hover:scale-[1.02]',
          'active:scale-[0.98] focus-visible:ring-[#5243E9]',
          'dark:bg-[#27364B] dark:text-[#E2E8F0] dark:hover:bg-[#475569]'
        ],
        outline: [
          'border-2 border-[#5243E9] text-[#5243E9] bg-transparent',
          'hover:bg-[#5243E9] hover:text-white hover:shadow-lg hover:shadow-[#5243E9]/25',
          'active:scale-[0.98] focus-visible:ring-[#5243E9]',
          'dark:border-[#6366F1] dark:text-[#6366F1] dark:hover:bg-[#6366F1]'
        ],
        ghost: [
          'text-[#475569] bg-transparent',
          'hover:bg-[#F6F8FC] hover:text-[#1E2A3B]',
          'active:scale-[0.98] focus-visible:ring-[#5243E9]',
          'dark:text-[#94A3B8] dark:hover:bg-[#1E2A3B] dark:hover:text-[#E2E8F0]'
        ],
        destructive: [
          'bg-[#EF4444] text-white shadow-lg shadow-red-500/25',
          'hover:bg-red-600 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02]',
          'active:scale-[0.98] focus-visible:ring-red-500'
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    isLoading = false, 
    disabled,
    leftIcon, 
    rightIcon, 
    children, 
    ...props 
  }, ref) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2">Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants }; 

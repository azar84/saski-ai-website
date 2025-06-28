'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Custom styles for dynamic hover effects using CSS variables
const dynamicButtonStyles = `
  .btn-primary {
    background-color: var(--color-primary);
    color: white;
    border: none;
  }
  .btn-primary:hover:not(:disabled) {
    background-color: var(--color-primary-light, var(--color-primary));
    transform: scale(1.02);
  }
  .btn-primary:active:not(:disabled) {
    background-color: var(--color-primary-dark, var(--color-primary));
    transform: scale(0.98);
  }

  .btn-secondary {
    background-color: var(--color-bg-secondary, #EEE7F9);
    color: var(--color-primary);
    border: 1px solid var(--color-primary);
  }
  .btn-secondary:hover:not(:disabled) {
    background-color: var(--color-primary-light, var(--color-primary));
    color: white;
    transform: scale(1.02);
  }

  .btn-accent {
    background-color: var(--color-accent);
    color: white;
    border: none;
  }
  .btn-accent:hover:not(:disabled) {
    background-color: var(--color-accent-dark, var(--color-accent));
    transform: scale(1.02);
  }

  .btn-ghost {
    background-color: transparent;
    color: var(--color-text-primary);
    border: 1px solid transparent;
  }
  .btn-ghost:hover:not(:disabled) {
    background-color: var(--color-primary-light, rgba(99, 102, 241, 0.1));
    opacity: 0.1;
    transform: scale(1.02);
  }

  .btn-destructive {
    background-color: var(--color-error);
    color: white;
    border: none;
  }
  .btn-destructive:hover:not(:disabled) {
    background-color: var(--color-error-dark, var(--color-error));
    transform: scale(1.02);
  }

  .btn-success {
    background-color: var(--color-success);
    color: white;
    border: none;
  }
  .btn-success:hover:not(:disabled) {
    background-color: var(--color-success-dark, var(--color-success));
    transform: scale(1.02);
  }

  .btn-info {
    background-color: var(--color-info);
    color: white;
    border: none;
  }
  .btn-info:hover:not(:disabled) {
    background-color: var(--color-info-dark, var(--color-info));
    transform: scale(1.02);
  }

  .btn-outline {
    background-color: transparent;
    color: var(--color-primary);
    border: 2px solid var(--color-primary);
  }
  .btn-outline:hover:not(:disabled) {
    background-color: var(--color-primary-light, rgba(99, 102, 241, 0.1));
    transform: scale(1.02);
  }

  .btn-muted {
    background-color: var(--color-bg-secondary);
    color: var(--color-text-muted);
    border: 1px solid var(--color-border-medium);
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none select-none relative overflow-hidden',
  {
    variants: {
      variant: {
        primary: [
          'btn-primary focus-visible:ring-blue-500',
          'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100'
        ],
        secondary: [
          'btn-secondary focus-visible:ring-blue-500'
        ],
        accent: [
          'btn-accent focus-visible:ring-purple-500',
          'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100'
        ],
        ghost: [
          'btn-ghost focus-visible:ring-blue-500'
        ],
        destructive: [
          'btn-destructive focus-visible:ring-red-500'
        ],
        success: [
          'btn-success focus-visible:ring-green-500'
        ],
        info: [
          'btn-info focus-visible:ring-blue-400'
        ],
        outline: [
          'btn-outline focus-visible:ring-blue-500'
        ],
        muted: [
          'btn-muted'
        ],
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-6',
        xl: 'h-14 px-8',
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
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'success' | 'info' | 'outline' | 'muted';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary',
    size = 'md',
    fullWidth,
    isLoading = false, 
    disabled,
    leftIcon, 
    rightIcon, 
    children, 
    ...props 
  }, ref) => {
    const isDisabled = disabled || isLoading || variant === 'muted';

    // Get typography styles from design system
    const getTypographyStyles = () => {
      return {
        fontSize: 'var(--font-size-base)',
        fontWeight: 'var(--font-weight-medium)',
        fontFamily: 'var(--font-family-sans)',
      };
    };

    // Get size styles
    const getSizeStyles = () => {
      const baseSize = 16; // Assuming 16px base
      switch (size) {
        case 'sm':
          return { fontSize: `${baseSize * 0.875}px` };
        case 'md':
          return { fontSize: 'var(--font-size-base)' };
        case 'lg':
          return { fontSize: `${baseSize * 1.125}px` };
        case 'xl':
          return { fontSize: `${baseSize * 1.25}px` };
        default:
          return { fontSize: 'var(--font-size-base)' };
      }
    };

    const combinedStyles = {
      ...getTypographyStyles(),
      ...getSizeStyles(),
      ...props.style
    };

    return (
      <>
        {/* Inject dynamic styles */}
        <style dangerouslySetInnerHTML={{ __html: dynamicButtonStyles }} />
        
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
          style={combinedStyles}
          aria-disabled={isDisabled}
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
      </>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants }; 

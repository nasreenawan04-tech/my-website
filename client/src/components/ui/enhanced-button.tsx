import { forwardRef } from 'react';
import { InlineSpinner } from './loading-spinner';
import { cn } from '@/lib/utils';

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    variant = 'default', 
    size = 'md', 
    isLoading = false, 
    loadingText, 
    children, 
    className,
    disabled,
    'aria-label': ariaLabel,
    ...props 
  }, ref) => {
    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline'
    };

    const sizes = {
      sm: 'h-9 rounded-md px-3 text-sm',
      md: 'h-10 px-4 py-2 text-base',
      lg: 'h-11 rounded-md px-8 text-lg'
    };

    const isDisabled = disabled || isLoading;
    const displayText = isLoading && loadingText ? loadingText : children;

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'active:scale-95 transition-transform duration-75',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isDisabled}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <InlineSpinner 
            size="sm" 
            className="mr-2" 
          />
        )}
        <span className={isLoading ? 'opacity-75' : ''}>
          {displayText}
        </span>
      </button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

export default EnhancedButton;
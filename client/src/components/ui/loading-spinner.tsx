import { useLocation } from 'wouter';
import logoImage from '@assets/logo.svg';
import { 
  HomePageSkeleton, 
  CategoryPageSkeleton, 
  ToolPageSkeleton, 
  EnhancedLoadingSpinner,
  InlineSpinner,
  CalculationSpinner
} from '@/components/ui/skeletons';

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function LoadingSpinner({ size = "md", className, label = "Loading" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  const logoSizeClasses = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-7 h-7"
  };

  return (
    <div className="flex items-center justify-center p-8" data-testid="loading-spinner" role="status" aria-live="polite">
      <div className={`relative ${sizeClasses[size]} ${className || ''}`}>
        <div
          className="absolute inset-0 animate-spin rounded-full border-2 border-gray-300 dark:border-neutral-700 border-t-blue-600 dark:border-t-blue-500"
          aria-hidden="true"
        />
        {/* Logo in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={logoImage}
            alt=""
            aria-hidden="true"
            className={`${logoSizeClasses[size]} object-contain animate-pulse`}
          />
        </div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

// Smart page loading component that shows appropriate skeleton based on route
export function PageLoadingSpinner() {
  const [location] = useLocation();
  
  // Determine which skeleton to show based on the current route
  if (location === '/') {
    return <HomePageSkeleton />;
  }
  
  if (location.includes('/finance-tools') || location.includes('/text-tools') || location.includes('/health-tools') || location === '/all-tools') {
    return <CategoryPageSkeleton />;
  }
  
  if (location.startsWith('/tools/')) {
    return <ToolPageSkeleton />;
  }
  
  // Fallback for other pages - show enhanced spinner
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900" data-testid="page-loading">
      <EnhancedLoadingSpinner size="lg" message="Loading..." />
    </div>
  );
}

// Export additional spinners for use throughout the app
export { InlineSpinner, CalculationSpinner };
import { useLocation } from 'wouter';
import { 
  HomePageSkeleton, 
  CategoryPageSkeleton, 
  ToolPageSkeleton, 
  EnhancedLoadingSpinner 
} from '@/components/ui/skeletons';

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function LoadingSpinner({ size = "md", className, label = "Loading" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className="flex items-center justify-center p-8" data-testid="loading-spinner" role="status" aria-live="polite">
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className || ''}`}
        aria-hidden="true"
      />
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
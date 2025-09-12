interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className="flex items-center justify-center p-8" data-testid="loading-spinner">
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className || ''}`}
      />
    </div>
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" data-testid="page-loading">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
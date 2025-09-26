import { Skeleton } from "@/components/ui/skeleton";

// Skeleton for individual tool cards in grids
export function ToolCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-md p-6 border border-neutral-100 dark:border-neutral-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-16 mb-2" /> {/* Category badge */}
          <Skeleton className="h-6 w-3/4 mb-2" /> {/* Tool name */}
          <Skeleton className="h-4 w-full mb-1" /> {/* Description line 1 */}
          <Skeleton className="h-4 w-2/3" /> {/* Description line 2 */}
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" /> {/* Icon */}
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" /> {/* Usage count */}
        <Skeleton className="h-8 w-8 rounded-full" /> {/* Favorite button */}
      </div>
    </div>
  );
}

// Skeleton for tool/calculator pages with forms
export function ToolPageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col" data-testid="tool-page-skeleton">
      {/* Header skeleton */}
      <div className="border-b bg-white dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Skeleton className="h-8 w-32" /> {/* Logo */}
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" /> {/* Theme toggle */}
              <Skeleton className="h-8 w-20" /> {/* Menu button */}
            </div>
          </div>
        </div>
      </div>

      {/* Hero section skeleton */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Skeleton className="h-16 w-16 rounded-2xl mx-auto mb-6 bg-white/20" />
          <Skeleton className="h-10 w-80 mx-auto mb-4 bg-white/20" />
          <Skeleton className="h-6 w-96 mx-auto bg-white/20" />
        </div>
      </div>

      <main className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left column - Form skeleton */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm">
                <Skeleton className="h-8 w-48 mb-6" /> {/* Form title */}
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" /> {/* Label */}
                      <Skeleton className="h-10 w-full" /> {/* Input */}
                    </div>
                  ))}
                  <Skeleton className="h-12 w-full" /> {/* Calculate button */}
                </div>
              </div>
            </div>

            {/* Right column - Results skeleton */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm">
                <Skeleton className="h-8 w-32 mb-6" /> {/* Results title */}
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-5 w-32" /> {/* Label */}
                      <Skeleton className="h-6 w-24" /> {/* Value */}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm">
                <Skeleton className="h-6 w-20 mb-4" /> {/* Chart title */}
                <Skeleton className="h-64 w-full" /> {/* Chart area */}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer skeleton */}
      <div className="bg-neutral-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-24 bg-neutral-700" />
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full bg-neutral-700" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton for category pages with tool grids
export function CategoryPageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col" data-testid="category-page-skeleton">
      {/* Header skeleton */}
      <div className="border-b bg-white dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Hero section with search */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Skeleton className="h-16 w-16 rounded-2xl mx-auto mb-6 bg-white/20" />
          <Skeleton className="h-12 w-64 mx-auto mb-4 bg-white/20" />
          <Skeleton className="h-6 w-96 mx-auto mb-8 bg-white/20" />
          {/* Search bar skeleton */}
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-16 w-full rounded-2xl bg-white/20" />
          </div>
        </div>
      </div>

      <main className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tools count skeleton */}
          <div className="mb-8">
            <Skeleton className="h-6 w-32" />
          </div>
          
          {/* Tools grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <ToolCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>

      {/* Footer skeleton */}
      <div className="bg-neutral-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-24 bg-neutral-700" />
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full bg-neutral-700" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton for home page with multiple sections
export function HomePageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col" data-testid="home-page-skeleton">
      {/* Header skeleton */}
      <div className="border-b bg-white dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Hero section skeleton */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Skeleton className="h-16 w-96 mx-auto mb-6 bg-white/20" />
          <Skeleton className="h-6 w-128 mx-auto mb-8 bg-white/20" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton className="h-12 w-40 bg-white/20" />
            <Skeleton className="h-12 w-32 bg-white/20" />
          </div>
        </div>
      </div>

      <main className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        {/* Popular tools section skeleton */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Skeleton className="h-10 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ToolCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>

        {/* Categories section skeleton */}
        <section className="py-16 bg-white dark:bg-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Skeleton className="h-10 w-48 mx-auto mb-4" />
              <Skeleton className="h-6 w-80 mx-auto" />
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center p-8 rounded-2xl border border-neutral-100 dark:border-neutral-700">
                  <Skeleton className="h-16 w-16 rounded-2xl mx-auto mb-6" />
                  <Skeleton className="h-8 w-32 mx-auto mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mx-auto mb-6" />
                  <Skeleton className="h-10 w-24 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer skeleton */}
      <div className="bg-neutral-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-24 bg-neutral-700" />
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full bg-neutral-700" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced loading spinner with better animations
export function EnhancedLoadingSpinner({ size = "md", className, message }: {
  size?: "sm" | "md" | "lg";
  className?: string;
  message?: string;
}) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10", 
    lg: "w-16 h-16"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8" data-testid="enhanced-loading-spinner">
      <div className={`relative ${sizeClasses[size]} ${className || ''}`}>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin"></div>
        {/* Inner pulse */}
        <div className="absolute inset-2 rounded-full bg-blue-100 dark:bg-blue-900 animate-pulse"></div>
      </div>
      {message && (
        <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
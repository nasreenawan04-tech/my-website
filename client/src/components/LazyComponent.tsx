import { lazy, Suspense, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

const DefaultFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]" data-testid="loading-spinner">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

export const createLazyComponent = (
  importFunc: () => Promise<{ default: ComponentType<any> }>,
  fallback?: React.ReactNode
) => {
  const LazyComp = lazy(importFunc);
  
  return (props: any) => (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <LazyComp {...props} />
    </Suspense>
  );
};

export default createLazyComponent;
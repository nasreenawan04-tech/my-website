import { useState, useEffect, ReactNode } from 'react';
import { EnhancedLoadingSpinner } from '@/components/ui/skeletons';

interface ProgressiveLoaderProps {
  children: ReactNode;
  loadingComponent?: ReactNode;
  delay?: number; // Delay before showing loading state (to prevent flash)
  timeout?: number; // Max time to show loading before forcing content
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
}

export function ProgressiveLoader({
  children,
  loadingComponent,
  delay = 100,
  timeout = 10000,
  onLoadStart,
  onLoadComplete
}: ProgressiveLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(false);
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    onLoadStart?.();

    // Delay showing the loader to prevent flash for fast loads
    const delayTimer = setTimeout(() => {
      setShowLoader(true);
    }, delay);

    // Force show content after timeout
    const timeoutTimer = setTimeout(() => {
      setForceShow(true);
      setIsLoading(false);
      onLoadComplete?.();
    }, timeout);

    // Check if content is already loaded immediately
    const checkContentLoaded = () => {
      const contentElements = document.querySelectorAll('[data-testid*="page-"], main [data-testid], .tool-content');
      if (contentElements.length > 0) {
        setIsLoading(false);
        onLoadComplete?.();
        return true;
      }
      return false;
    };

    let loadCheckInterval: NodeJS.Timeout | null = null;

    // Immediate check for already loaded content
    if (!checkContentLoaded()) {
      // If not loaded, set up periodic checks
      loadCheckInterval = setInterval(() => {
        if (checkContentLoaded()) {
          if (loadCheckInterval) {
            clearInterval(loadCheckInterval);
            loadCheckInterval = null;
          }
        }
      }, 100);
    }

    // Comprehensive cleanup function that always clears all timers
    return () => {
      clearTimeout(delayTimer);
      clearTimeout(timeoutTimer);
      if (loadCheckInterval) {
        clearInterval(loadCheckInterval);
      }
    };
  }, [delay, timeout, onLoadStart, onLoadComplete]);

  // Auto-detect when content is ready
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      const hasContent = mutations.some(mutation => 
        mutation.addedNodes.length > 0 && 
        Array.from(mutation.addedNodes).some(node => 
          node.nodeType === Node.ELEMENT_NODE
        )
      );
      
      if (hasContent && !forceShow) {
        setIsLoading(false);
        onLoadComplete?.();
      }
    });

    const targetNode = document.querySelector('[data-testid*="page-"], main, #root > div');
    if (targetNode) {
      observer.observe(targetNode, { 
        childList: true, 
        subtree: true 
      });
    }

    return () => observer.disconnect();
  }, [forceShow, onLoadComplete]);

  if (isLoading && showLoader) {
    return (
      <div data-testid="progressive-loader">
        {loadingComponent || <EnhancedLoadingSpinner size="lg" message="Loading..." />}
      </div>
    );
  }

  return <>{children}</>;
}

export default ProgressiveLoader;
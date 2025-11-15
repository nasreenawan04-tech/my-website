import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

const PerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  
  useEffect(() => {
    // Only run performance measurements in development for debugging
    if (!import.meta.env.DEV || !window.PerformanceObserver) {
      return;
    }

    // Measure Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry;
      setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
    });

    // Measure Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Only count layout shifts without recent user input
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      setMetrics(prev => ({ ...prev, cls: clsValue }));
    });

    // Measure First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
        }
      }
    });

    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      fcpObserver.observe({ type: 'paint', buffered: true });
    } catch (e) {
      // Silently fail if observer types are not supported
      console.debug('Performance observers not supported:', e);
    }

    // Measure Time to First Byte (TTFB)
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      setMetrics(prev => ({ 
        ...prev, 
        ttfb: navEntry.responseStart - navEntry.requestStart 
      }));
    }

    // Cleanup observers
    return () => {
      lcpObserver.disconnect();
      clsObserver.disconnect();
      fcpObserver.disconnect();
    };
  }, []);

  // Only render performance metrics in development for debugging
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs font-mono">
      <h3 className="font-bold mb-2">Core Web Vitals</h3>
      <div className="space-y-1">
        <div>LCP: {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : '-'}</div>
        <div>FCP: {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : '-'}</div>
        <div>CLS: {metrics.cls ? metrics.cls.toFixed(3) : '-'}</div>
        <div>TTFB: {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : '-'}</div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
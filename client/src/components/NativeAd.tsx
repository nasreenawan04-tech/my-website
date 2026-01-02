import { useEffect, useRef } from 'react';

interface NativeAdProps {
  placement: 'top' | 'side' | 'bottom' | 'middle';
  layout?: '4x1' | '1x1' | '1x2' | '1x3' | '1x4';
  className?: string;
}

const NativeAd = ({ placement, layout = '4x1', className = "" }: NativeAdProps) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current && !adRef.current.firstChild) {
      console.log(`NativeAd: Loading ${placement} placement...`);
      
      // Placeholder for actual Adsterra Native Ad script integration
      // In a real scenario, each placement/layout would have a specific ID
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = `//pl28380697.effectivegatecpm.com/native-${placement}-${layout}/invoke.js`; // Simulated URL
      
      adRef.current.appendChild(script);
    }
  }, [placement, layout]);

  return (
    <div className={`native-ad-container my-6 ${className}`}>
      <div 
        ref={adRef}
        className="w-full bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700 p-4 flex flex-col items-center justify-center min-h-[100px]"
      >
        <span className="text-xs text-neutral-400 mb-2 uppercase tracking-widest">Sponsored Content</span>
        {/* Ad content will be injected here */}
      </div>
    </div>
  );
};

export default NativeAd;

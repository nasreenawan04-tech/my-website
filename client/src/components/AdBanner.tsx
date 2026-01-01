import { useEffect, useRef } from 'react';

interface AdBannerProps {
  className?: string;
}

const AdBanner = ({ className = "" }: AdBannerProps) => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only load if not already loaded and container exists
    if (adContainerRef.current) {
      console.log('AdBanner: Loading script...');
      const script = document.createElement('script');
      script.async = true;
      script.dataset.cfasync = 'false';
      script.src = 'https://pl28380697.effectivegatecpm.com/30af918923a2ff0c5565292f19d5f422/invoke.js';
      
      script.onload = () => console.log('AdBanner: Script loaded');
      script.onerror = (e) => console.error('AdBanner: Script failed to load', e);
      
      adContainerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className={`ad-container my-8 flex justify-center min-h-[100px] border border-dashed border-gray-200 ${className}`}>
      <div 
        id="container-30af918923a2ff0c5565292f19d5f422" 
        ref={adContainerRef}
        className="w-full max-w-4xl mx-auto"
      />
    </div>
  );
};

export default AdBanner;

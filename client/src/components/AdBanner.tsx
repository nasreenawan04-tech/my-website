import { useEffect, useRef } from 'react';

interface AdBannerProps {
  className?: string;
}

const AdBanner = ({ className = "" }: AdBannerProps) => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only load if container exists and hasn't been populated
    if (adContainerRef.current && !adContainerRef.current.firstChild) {
      console.log('AdBanner: Loading Adsterra scripts...');
      
      const containerId = 'container-30af918923a2ff0c5565292f19d5f422';
      const containerDiv = document.createElement('div');
      containerDiv.id = containerId;
      adContainerRef.current.appendChild(containerDiv);

      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.async = true;
      invokeScript.setAttribute('data-cfasync', 'false');
      invokeScript.src = 'https://pl28380697.effectivegatecpm.com/30af918923a2ff0c5565292f19d5f422/invoke.js';
      invokeScript.onerror = () => {
        console.warn('AdBanner: Adsterra script failed to load. This might be due to an ad blocker.');
      };
      
      adContainerRef.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div className={`ad-container my-8 flex justify-center min-h-[90px] ${className}`}>
      <div 
        ref={adContainerRef}
        className="w-full max-w-4xl mx-auto flex justify-center"
      />
    </div>
  );
};

export default AdBanner;

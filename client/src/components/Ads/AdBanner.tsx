import { useEffect, useRef } from 'react';

const AdBanner = () => {
  const adRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (adRef.current && !scriptLoaded.current) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `
        atOptions = {
          'key' : '96ca3f2bcdbfe335d73817d7b1169868',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      adRef.current.appendChild(script);

      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = 'https://www.highperformanceformat.com/96ca3f2bcdbfe335d73817d7b1169868/invoke.js';
      adRef.current.appendChild(invokeScript);

      scriptLoaded.current = true;
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 flex justify-center min-h-[90px]">
      <div ref={adRef}></div>
    </div>
  );
};

export default AdBanner;

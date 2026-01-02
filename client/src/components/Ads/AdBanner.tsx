import { useEffect, useRef } from 'react';

const AdBanner = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear existing content to avoid duplicates during HMR or re-renders
    containerRef.current.innerHTML = '';

    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.text = `
      atOptions = {
        'key' : '96ca3f2bcdbfe335d73817d7b1169868',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;

    const script2 = document.createElement('script');
    script2.type = 'text/javascript';
    script2.src = 'https://www.highperformanceformat.com/96ca3f2bcdbfe335d73817d7b1169868/invoke.js';

    containerRef.current.appendChild(script1);
    containerRef.current.appendChild(script2);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 flex justify-center min-h-[100px]">
      <div 
        ref={containerRef} 
        style={{ width: '728px', height: '90px' }} 
        className="bg-gray-50/50 rounded flex items-center justify-center border border-gray-100"
      >
        <span className="text-xs text-gray-400 italic">Advertisement</span>
      </div>
    </div>
  );
};

export default AdBanner;

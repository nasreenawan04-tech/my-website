import { useState, useEffect } from 'react';
import { WifiOff, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? window.navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className="flex items-center gap-1.5 bg-yellow-100 text-yellow-900 border-yellow-300 py-1 px-3 hover:bg-yellow-200 transition-colors cursor-help dark:bg-yellow-900/40 dark:text-yellow-100 dark:border-yellow-700"
            data-testid="status-offline"
          >
            <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider">Offline Mode</span>
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3 bg-white dark:bg-slate-900 border shadow-lg">
          <p className="text-sm font-medium mb-1">You are currently offline</p>
          <ul className="text-xs space-y-1 text-slate-500 dark:text-slate-400">
            <li>• Calculations and text tools work fully offline</li>
            <li>• Cloud sync and favorites are temporarily paused</li>
            <li>• Changes will sync automatically when you reconnect</li>
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

import { Zap } from 'lucide-react';

export const TopBar = () => {
  return (
    <div className="hidden sm:flex h-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-b border-blue-100 dark:border-blue-900/30 items-center justify-between px-4 md:px-6 lg:px-8 text-xs gap-4">
      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium">
        <Zap className="w-3 h-3" aria-hidden="true" />
        <span>100% Free • 180+ Tools • Works Offline</span>
      </div>
    </div>
  );
};

import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { useRecentTools } from '@/hooks/use-recent-tools';

const RecentToolsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { recentTools, clearRecent } = useRecentTools();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors relative"
        data-testid="button-recent-tools"
        title="Recent Tools"
      >
        <i className="fas fa-history text-lg"></i>
        {recentTools.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {recentTools.length > 9 ? '9+' : recentTools.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-gray-200 dark:border-neutral-700 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between">
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 flex items-center">
              <i className="fas fa-history text-green-500 mr-2"></i>
              Recent Tools
            </h3>
            {recentTools.length > 0 && (
              <button
                onClick={() => {
                  clearRecent();
                  setIsOpen(false);
                }}
                className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                data-testid="button-clear-recent"
                title="Clear history"
              >
                <i className="fas fa-trash mr-1"></i>
                Clear
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {recentTools.length > 0 ? (
              recentTools.slice(0, 8).map((recentTool, index) => (
                <Link
                  key={`${recentTool.tool.id}-${recentTool.timestamp}`}
                  href={recentTool.tool.href}
                  className="block p-3 hover:bg-gray-50 dark:hover:bg-neutral-700 border-b border-gray-100 dark:border-neutral-600 last:border-b-0 transition-colors"
                  onClick={() => setIsOpen(false)}
                  data-testid={`recent-tool-${recentTool.tool.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${recentTool.tool.icon} text-white text-xs`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-neutral-800 dark:text-neutral-100 text-sm truncate">
                        {recentTool.tool.name}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {formatTimeAgo(recentTool.timestamp)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                <i className="fas fa-history text-3xl mb-3 text-neutral-300 dark:text-neutral-600"></i>
                <p className="text-sm">No recent tools</p>
                <p className="text-xs mt-1">Start using tools to see your history here</p>
              </div>
            )}
          </div>

          {recentTools.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-750">
              <Link
                href="/tools"
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                onClick={() => setIsOpen(false)}
                data-testid="link-browse-tools"
              >
                Browse all tools →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentToolsDropdown;
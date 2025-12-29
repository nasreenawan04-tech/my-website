import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { searchTools } from '@/lib/search';
import { tools } from '@/data/tools';
import { useLocation } from 'wouter';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  onToolSelect?: (toolHref: string) => void;
}

export const SearchBar = ({ isOpen, onClose, onToolSelect }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(tools);
  const [, setLocation] = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      const results = searchTools(debouncedSearchQuery);
      setSearchResults(results);
    } else {
      setSearchResults(tools);
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleToolClick = useCallback((toolHref: string) => {
    setSearchQuery('');
    onToolSelect?.(toolHref);
    setLocation(toolHref);
    onClose();
  }, [setLocation, onToolSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-xl z-50 flex items-start justify-center pt-12 sm:pt-16 md:pt-20 px-3 sm:px-4 animate-in fade-in duration-200"
      onClick={onClose}
      data-testid="search-overlay"
    >
      <div 
        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-8rem)] overflow-hidden animate-in slide-in-from-top-2 duration-300 ease-out border border-gray-200/80 dark:border-neutral-700/80"
        role="dialog"
        aria-label="Search tools"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Section */}
        <div className="p-4 sm:p-5 md:p-6 border-b border-gray-200/60 dark:border-neutral-700/60 bg-gradient-to-br from-gray-50/70 to-blue-50/30 dark:from-neutral-800/50 dark:to-blue-950/20">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 pointer-events-none">
              <Search className="w-5 h-5" aria-hidden="true" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search 180+ tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 sm:py-3.5 pl-12 pr-12 text-base sm:text-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-full hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent focus:shadow-xl transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-neutral-500"
              data-testid="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="overflow-y-auto max-h-[calc(100vh-16rem)] p-2 sm:p-3 md:p-4">
          {searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool.href)}
                  className="w-full text-left p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all group focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid={`search-result-${tool.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 whitespace-nowrap ml-2 mt-1">
                      {tool.category === 'finance' ? 'Finance' : tool.category === 'text' ? 'Text' : 'Health'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" aria-hidden="true" />
              <p className="text-gray-600 dark:text-gray-400">No tools found for "{searchQuery}"</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Try searching with different keywords</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, X, Command } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { searchTools } from '@/lib/search';
import { tools } from '@/data/tools';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  onToolSelect?: (toolHref: string) => void;
}

export const SearchBar = ({ isOpen, onClose, onToolSelect }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(tools);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, setLocation] = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 200);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      const results = searchTools(debouncedSearchQuery);
      setSearchResults(results);
    } else {
      setSearchResults(tools);
    }
    setSelectedIndex(0);
  }, [debouncedSearchQuery]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter' && searchResults[selectedIndex]) {
      handleToolClick(searchResults[selectedIndex].href);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    const activeItem = document.getElementById(`search-result-${selectedIndex}`);
    if (activeItem && scrollContainerRef.current) {
      activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  const handleToolClick = useCallback((toolHref: string) => {
    setSearchQuery('');
    onToolSelect?.(toolHref);
    setLocation(toolHref);
    onClose();
  }, [setLocation, onToolSelect, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-16 md:pt-20 px-3 sm:px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-8rem)] overflow-hidden border border-gray-200/80 dark:border-neutral-800"
            role="dialog"
            aria-label="Search tools"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Section */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 transition-colors group-focus-within:text-blue-500">
                  <Search className="w-5 h-5" aria-hidden="true" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search tools, calculators, or guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full py-3.5 pl-12 pr-24 text-base sm:text-lg bg-gray-50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 dark:placeholder:text-neutral-600"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="hidden sm:flex items-center gap-1 px-1.5 py-1 rounded border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                      <Command className="w-3 h-3" />
                      <span>K</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Search Results */}
            <div 
              ref={scrollContainerRef}
              className="overflow-y-auto max-h-[calc(100vh-18rem)] p-2"
            >
              {searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((tool, index) => (
                    <button
                      key={tool.id}
                      id={`search-result-${index}`}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => handleToolClick(tool.href)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-4 group ${
                        index === selectedIndex 
                          ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-100 dark:ring-blue-900/30' 
                          : 'hover:bg-gray-50 dark:hover:bg-neutral-800/50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg transition-colors ${
                        index === selectedIndex 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400'
                      }`}>
                        <Search className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={`font-medium text-sm sm:text-base truncate ${
                            index === selectedIndex ? 'text-blue-700 dark:text-blue-400' : 'text-neutral-900 dark:text-neutral-100'
                          }`}>
                            {tool.name}
                          </h3>
                          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400">
                            {tool.category}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-500 mt-0.5 line-clamp-1">
                          {tool.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-neutral-800/50 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-gray-300 dark:text-gray-700" />
                  </div>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">No tools found for "{searchQuery}"</p>
                  <p className="text-sm text-gray-500 mt-1">Try using different keywords or categories.</p>
                </div>
              )}
            </div>
            
            <div className="px-4 py-3 border-t border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-sans shadow-sm">↵</kbd>
                  <span>to select</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <div className="flex gap-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-sans shadow-sm">↑</kbd>
                    <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-sans shadow-sm">↓</kbd>
                  </div>
                  <span>to navigate</span>
                </div>
              </div>
              <div className="text-[11px] text-gray-400 dark:text-neutral-600">
                {searchResults.length} results
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { searchTools } from '@/lib/search';
import { tools } from '@/data/tools';
import { Search, TrendingUp, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState(tools.slice(0, 8));
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Perform search with debounced query
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      setIsSearching(true);
      const results = searchTools(debouncedSearchQuery);
      setSearchResults(results.slice(0, 8));
      setIsSearching(false);
      setIsSearchOpen(true);
    } else {
      setSearchResults(tools.slice(0, 8));
      setIsSearchOpen(false);
    }
    setSelectedIndex(-1);
  }, [debouncedSearchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
    }
  };

  const handleSearch = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/tools?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      setLocation('/tools');
    }
    setIsSearchOpen(false);
    inputRef.current?.blur();
  }, [searchQuery, setLocation]);

  const handleToolClick = useCallback((toolHref: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setLocation(toolHref);
  }, [setLocation]);

  const handleInputFocus = () => {
    if (searchResults.length > 0 || searchQuery.trim()) {
      setIsSearchOpen(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setIsSearchOpen(false), 200);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleToolClick(searchResults[selectedIndex].href);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsSearchOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section className="gradient-hero text-white py-20 lg:py-28" data-testid="hero-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in" data-testid="text-hero-title">
          Free Tools to Make Everything Simple
        </h1>
        <p className="text-xl lg:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-delay" data-testid="text-hero-subtitle">
          We offer finance, text, and health online tools to make your life easier. No sign-up required.
        </p>
        
        {/* Enhanced Search Bar */}
        <div className="max-w-2xl mx-auto mb-16 relative">
          <form onSubmit={handleSearch} className="relative group">
            <div className="relative">
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Search for tools..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                className="w-full py-4 px-6 pr-16 text-lg text-neutral-800 bg-white rounded-2xl shadow-lg focus:outline-none focus:shadow-2xl transition-all duration-300 hover:shadow-xl"
                data-testid="input-search-tools"
                autoComplete="off"
              />
              {isSearching && (
                <div className="absolute right-20 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                </div>
              )}
            </div>
            <button 
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
              data-testid="button-search-tools"
            >
              <Search size={20} />
            </button>
          </form>

          {/* Enhanced Search Results Dropdown */}
          {isSearchOpen && (
            <div 
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[32rem] overflow-hidden animate-slide-down"
            >
              {searchResults.length > 0 ? (
                <div className="overflow-y-auto max-h-[28rem] custom-scrollbar">
                  {searchResults.map((tool, index) => (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.href)}
                      className={`w-full px-5 py-4 text-left transition-all duration-200 border-b border-gray-100 last:border-b-0 group ${
                        index === selectedIndex 
                          ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                          : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                      }`}
                      data-testid={`hero-search-result-${tool.id}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold truncate transition-colors ${
                            index === selectedIndex ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-600'
                          }`}>
                            {tool.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate mt-0.5">
                            {tool.description}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {tool.isPopular && (
                            <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shadow-sm">
                              <TrendingUp size={12} />
                              Popular
                            </div>
                          )}
                          <div className={`text-gray-400 transition-transform ${
                            index === selectedIndex ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                          }`}>
                            →
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {searchQuery.trim() && (
                    <div className="px-5 py-4 border-t-2 border-gray-200 bg-gray-50">
                      <button
                        onClick={handleSearch}
                        className="w-full text-center text-blue-600 hover:text-blue-700 font-semibold text-sm py-2 px-4 rounded-lg hover:bg-blue-50 transition-all duration-200"
                        data-testid="hero-search-view-all"
                      >
                        View all results for "{searchQuery}" →
                      </button>
                    </div>
                  )}
                </div>
              ) : searchQuery.trim() ? (
                <div className="p-10 text-center text-gray-500 animate-fade-in">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-2">No tools found</p>
                  <p className="text-sm mb-4">No results matching "{searchQuery}"</p>
                  <button
                    onClick={() => setLocation('/tools')}
                    className="mt-2 text-blue-600 hover:text-blue-700 font-semibold text-sm py-2 px-6 rounded-lg hover:bg-blue-50 transition-all duration-200"
                  >
                    Browse all tools →
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center transform hover:scale-105 transition-transform duration-300" data-testid="stat-active-users">
            <div className="text-3xl lg:text-4xl font-bold mb-2">1M+</div>
            <div className="text-blue-100 text-sm lg:text-base">Active Users</div>
          </div>
          <div className="text-center transform hover:scale-105 transition-transform duration-300" data-testid="stat-tools-available">
            <div className="text-3xl lg:text-4xl font-bold mb-2">180+</div>
            <div className="text-blue-100 text-sm lg:text-base">Tools Available</div>
          </div>
          <div className="text-center transform hover:scale-105 transition-transform duration-300" data-testid="stat-categories">
            <div className="text-3xl lg:text-4xl font-bold mb-2">3</div>
            <div className="text-blue-100 text-sm lg:text-base">Categories</div>
          </div>
          <div className="text-center transform hover:scale-105 transition-transform duration-300" data-testid="stat-calculations-done">
            <div className="text-3xl lg:text-4xl font-bold mb-2">500K+</div>
            <div className="text-blue-100 text-sm lg:text-base">Calculations Done</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

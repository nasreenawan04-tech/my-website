import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { searchTools } from '@/lib/search';
import { tools } from '@/data/tools';
import { Search, TrendingUp, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof tools>([]);
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
      setSearchResults([]);
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
      setIsSearchOpen(false);
      inputRef.current?.blur();
    }
    // Don't navigate if search is empty
  }, [searchQuery, setLocation]);

  const handleToolClick = useCallback((toolHref: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setLocation(toolHref);
  }, [setLocation]);

  const handleInputFocus = () => {
    if (searchQuery.trim() && searchResults.length > 0) {
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

  // Animated floating shapes data
  const floatingShapes = [
    { size: 80, top: '10%', left: '5%', delay: 0, duration: 20, rotate: 360 },
    { size: 60, top: '20%', right: '8%', delay: 2, duration: 25, rotate: -360 },
    { size: 100, bottom: '15%', left: '10%', delay: 1, duration: 30, rotate: 180 },
    { size: 40, top: '60%', right: '15%', delay: 3, duration: 22, rotate: -180 },
    { size: 70, top: '40%', left: '15%', delay: 1.5, duration: 28, rotate: 360 },
    { size: 50, bottom: '25%', right: '10%', delay: 2.5, duration: 26, rotate: -360 },
    { size: 90, top: '15%', left: '45%', delay: 0.5, duration: 24, rotate: 180 },
    { size: 55, bottom: '30%', left: '40%', delay: 1.8, duration: 27, rotate: -180 },
  ];

  // Cache random dot positions to prevent re-generation on every render
  const animatedDots = useMemo(() => 
    [...Array(12)].map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
    })),
    []
  );

  return (
    <section 
      className="gradient-hero text-white py-12 sm:py-16 md:py-20 lg:py-28 relative overflow-hidden" 
      data-testid="hero-section"
    >
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingShapes.map((shape, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full bg-white/5 backdrop-blur-sm"
            style={{
              width: shape.size,
              height: shape.size,
              top: shape.top,
              bottom: shape.bottom,
              left: shape.left,
              right: shape.right,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              rotate: [0, shape.rotate],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: shape.delay,
            }}
          />
        ))}
        
        {/* Additional decorative circles */}
        <motion.div
          className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-400/10 blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        
        {/* Animated dots */}
        {animatedDots.map((dot) => (
          <motion.div
            key={`dot-${dot.id}`}
            className="absolute w-2 h-2 rounded-full bg-white/20"
            style={{
              top: `${dot.top}%`,
              left: `${dot.left}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: dot.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: dot.delay,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.h1 
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight"
          data-testid="text-hero-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Free Tools to Make Everything Simple
        </motion.h1>
        <motion.p 
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 mb-8 sm:mb-10 md:mb-12 max-w-4xl mx-auto leading-relaxed px-2"
          data-testid="text-hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          We offer finance, text, and health online tools to make your life easier. No sign-up required.
        </motion.p>
        
        {/* Enhanced Search Bar */}
        <motion.div 
          className="max-w-2xl mx-auto mb-8 sm:mb-12 md:mb-16 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
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
              className="w-full py-4 px-6 pr-16 text-lg text-neutral-800 bg-white rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
              data-testid="input-search-tools"
              autoComplete="off"
            />
            <div className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl flex items-center pointer-events-none">
              <Search className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>

          {/* Enhanced Search Results Dropdown */}
          {isSearchOpen && (
            <div 
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[28rem] sm:max-h-[32rem] overflow-hidden animate-slide-down"
            >
              {searchResults.length > 0 ? (
                <div className="overflow-y-auto max-h-[24rem] sm:max-h-[28rem] custom-scrollbar">
                  {searchResults.map((tool, index) => (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.href)}
                      className={`w-full px-3 sm:px-5 py-3 sm:py-4 text-left transition-all duration-200 border-b border-gray-100 last:border-b-0 group ${
                        index === selectedIndex 
                          ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                          : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                      }`}
                      data-testid={`hero-search-result-${tool.id}`}
                    >
                      <div className="flex items-center justify-between gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm sm:text-base font-semibold truncate transition-colors ${
                            index === selectedIndex ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-600'
                          }`}>
                            {tool.name}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">
                            {tool.description}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                          {tool.isPopular && (
                            <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium flex items-center gap-1 shadow-sm">
                              <TrendingUp size={10} className="sm:w-3 sm:h-3" />
                              <span className="hidden sm:inline">Popular</span>
                            </div>
                          )}
                          <div className={`text-gray-400 transition-transform hidden sm:block ${
                            index === selectedIndex ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                          }`}>
                            →
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {searchQuery.trim() && (
                    <div className="px-3 sm:px-5 py-3 sm:py-4 border-t-2 border-gray-200 bg-gray-50">
                      <button
                        onClick={handleSearch}
                        className="w-full text-center text-blue-600 hover:text-blue-700 font-semibold text-xs sm:text-sm py-2 px-3 sm:px-4 rounded-lg hover:bg-blue-50 transition-all duration-200"
                        data-testid="hero-search-view-all"
                      >
                        View all results for "{searchQuery}" →
                      </button>
                    </div>
                  )}
                </div>
              ) : searchQuery.trim() ? (
                <div className="p-6 sm:p-10 text-center text-gray-500 animate-fade-in">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Search size={24} className="sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                  <p className="text-base sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">No tools found</p>
                  <p className="text-xs sm:text-sm mb-3 sm:mb-4">No results matching "{searchQuery}"</p>
                  <button
                    onClick={() => setLocation('/tools')}
                    className="mt-2 text-blue-600 hover:text-blue-700 font-semibold text-xs sm:text-sm py-2 px-4 sm:px-6 rounded-lg hover:bg-blue-50 transition-all duration-200"
                  >
                    Browse all tools →
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </motion.div>
        
        {/* Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          <motion.div 
            className="text-center"
            data-testid="stat-active-users"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">1M+</div>
            <div className="text-blue-100 text-xs sm:text-sm md:text-sm lg:text-base">Active Users</div>
          </motion.div>
          <motion.div 
            className="text-center"
            data-testid="stat-tools-available"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">180+</div>
            <div className="text-blue-100 text-xs sm:text-sm md:text-sm lg:text-base">Tools Available</div>
          </motion.div>
          <motion.div 
            className="text-center"
            data-testid="stat-categories"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">3</div>
            <div className="text-blue-100 text-xs sm:text-sm md:text-sm lg:text-base">Categories</div>
          </motion.div>
          <motion.div 
            className="text-center"
            data-testid="stat-calculations-done"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">500K+</div>
            <div className="text-blue-100 text-xs sm:text-sm md:text-sm lg:text-base">Calculations Done</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

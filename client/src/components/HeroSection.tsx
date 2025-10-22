import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { searchTools } from '@/lib/search';
import { tools } from '@/data/tools';
import { Search, TrendingUp, Loader2, Command, ArrowRight, Sparkles } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { motion, AnimatePresence } from 'framer-motion';

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
        
        {/* Professional Search Bar */}
        <motion.div 
          className="max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16 relative px-2 sm:px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <div className="relative group">
            {/* Search Icon - Left Side */}
            <div className="absolute left-3 sm:left-4 md:left-5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              {isSearching ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" aria-hidden="true" />
              )}
            </div>

            {/* Search Input */}
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Search 180+ tools... (Try 'loan', 'BMI', 'text')"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              className="w-full py-3.5 pl-11 pr-24 sm:py-4 sm:pl-12 sm:pr-28 md:py-5 md:pl-14 md:pr-32 text-sm sm:text-base md:text-lg text-neutral-800 placeholder:text-gray-400 bg-white rounded-xl sm:rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.16)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:shadow-[0_8px_40px_rgba(59,130,246,0.3)] transition-all duration-300 ease-in-out border border-white/20"
              data-testid="input-search-tools"
              autoComplete="off"
            />

            {/* Keyboard Shortcut Hint */}
            <div className="absolute right-3 sm:right-4 md:right-5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-1.5 opacity-60 group-focus-within:opacity-0 transition-opacity duration-200">
              <div className="px-2 py-1 bg-gray-100 rounded border border-gray-200 flex items-center gap-1">
                <Command className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-500">K</span>
              </div>
            </div>

            {/* Sparkle Effect on Focus */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl opacity-0 group-focus-within:opacity-20 blur-xl transition-opacity duration-500" />
          </div>

          {/* Professional Search Results Dropdown */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div 
                ref={dropdownRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-full left-2 right-2 sm:left-0 sm:right-0 mt-3 sm:mt-4 bg-white rounded-xl sm:rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-gray-100 z-50 max-h-[22rem] sm:max-h-[30rem] md:max-h-[36rem] overflow-hidden backdrop-blur-xl"
              >
                {searchResults.length > 0 ? (
                  <div className="overflow-y-auto max-h-[20rem] sm:max-h-[26rem] md:max-h-[32rem] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {/* Results Header */}
                    <div className="sticky top-0 bg-gradient-to-b from-gray-50 to-gray-50/80 backdrop-blur-sm px-4 py-2 sm:px-5 sm:py-3 border-b border-gray-200 z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-600">
                          Found {searchResults.length} tool{searchResults.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-gray-400 hidden sm:block">↑↓ Navigate • Enter Select • Esc Close</span>
                      </div>
                    </div>

                    {/* Search Results */}
                    {searchResults.map((tool, index) => (
                      <motion.button
                        key={tool.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        onClick={() => handleToolClick(tool.href)}
                        className={`w-full px-3 py-3 sm:px-5 sm:py-4 text-left transition-all duration-150 border-b border-gray-50 last:border-b-0 group relative ${
                          index === selectedIndex 
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50' 
                            : 'hover:bg-gray-50/80 active:bg-gray-100/80'
                        }`}
                        data-testid={`hero-search-result-${tool.id}`}
                      >
                        {/* Selection Indicator */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 transition-all duration-200 ${
                          index === selectedIndex ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                        }`} />

                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Tool Name */}
                            <div className={`text-sm sm:text-base font-semibold flex items-center gap-2 mb-1 transition-colors ${
                              index === selectedIndex ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-600'
                            }`}>
                              <span className="truncate">{tool.name}</span>
                              {tool.category && (
                                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-normal flex-shrink-0 hidden sm:inline-block">
                                  {tool.category}
                                </span>
                              )}
                            </div>
                            
                            {/* Tool Description */}
                            <div className="text-xs sm:text-sm text-gray-500 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                              {tool.description}
                            </div>
                          </div>

                          {/* Right Side Icons & Badges */}
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                            {tool.isPopular && (
                              <div className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1 shadow-sm">
                                <Sparkles className="w-3 h-3" />
                                <span className="hidden sm:inline">Popular</span>
                              </div>
                            )}
                            <ArrowRight className={`w-4 h-4 text-gray-400 transition-all duration-200 ${
                              index === selectedIndex 
                                ? 'translate-x-0 opacity-100' 
                                : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                            }`} />
                          </div>
                        </div>
                      </motion.button>
                    ))}
                    
                    {/* View All Results Button */}
                    {searchQuery.trim() && (
                      <div className="sticky bottom-0 bg-gradient-to-t from-gray-50 to-gray-50/80 backdrop-blur-sm px-3 py-3 sm:px-5 sm:py-4 border-t border-gray-200">
                        <button
                          onClick={handleSearch}
                          className="w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm py-2.5 sm:py-3 px-4 rounded-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                          data-testid="hero-search-view-all"
                        >
                          <span>View all results for "{searchQuery.length > 20 ? searchQuery.slice(0, 20) + '...' : searchQuery}"</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : searchQuery.trim() ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 sm:p-8 md:p-12 text-center"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
                      <Search className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-400" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2">No tools found</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                      We couldn't find any tools matching "<span className="font-semibold text-gray-700">{searchQuery}</span>"
                    </p>
                    <button
                      onClick={() => setLocation('/tools')}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm py-2.5 px-5 sm:px-7 rounded-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200"
                    >
                      <span>Browse all tools</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
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

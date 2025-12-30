import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { searchTools } from '@/lib/search';
import { tools } from '@/data/tools';
import { Search, TrendingUp, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof tools>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
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
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-5 lg:mb-6 leading-tight tracking-tight"
          style={{
            fontSize: 'clamp(24px, 5vw, 48px)',
            marginBottom: 'clamp(12px, 2vw, 24px)'
          }}
          data-testid="text-hero-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Free Tools to Make Everything Simple
        </motion.h1>
        <motion.p 
          className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-7 md:mb-8 lg:mb-10 max-w-4xl mx-auto leading-relaxed px-2"
          style={{
            fontSize: 'clamp(14px, 3vw, 20px)',
            marginBottom: 'clamp(24px, 4vw, 40px)'
          }}
          data-testid="text-hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          We offer finance, text, and health online tools to make your life easier. No sign-up required.
        </motion.p>
        
        {/* Enhanced Search Bar - Google Chrome Style */}
        <motion.div 
          className="max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16 relative px-2 sm:px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          role="search"
        >
          <form onSubmit={handleSearch} className="relative flex items-center">
            <label htmlFor="hero-search-input" className="sr-only">Search for tools</label>
            <input 
              id="hero-search-input"
              ref={inputRef}
              type="text" 
              placeholder="Search tools..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              className="w-full py-3.5 pl-5 pr-12 sm:py-4 sm:pl-8 sm:pr-16 md:py-5 md:pl-10 md:pr-20 text-xs sm:text-base md:text-lg text-neutral-800 bg-gray-50 hover:bg-white focus:bg-white rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:shadow-[0_0_20px_rgba(96,165,250,0.4)] transition-all duration-200 ease-in-out border border-transparent focus:border-transparent placeholder:text-gray-400 placeholder:text-xs sm:placeholder:text-sm"
              data-testid="input-search-tools"
              autoComplete="off"
            />
            <button
              type="submit"
              className="absolute right-1.5 sm:right-2 md:right-2.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full px-3 py-2.5 sm:px-6 sm:py-3 md:px-7 md:py-3.5 transition-all duration-200 z-10 cursor-pointer shadow-md hover:shadow-lg hover:shadow-blue-400/30 active:scale-95 flex items-center justify-center gap-1.5 min-h-10"
              data-testid="button-search-submit"
              aria-label="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5" strokeWidth={2.5} />
              <span className="hidden sm:inline text-sm font-medium">Search</span>
            </button>
          </form>
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
            <div className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">23</div>
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

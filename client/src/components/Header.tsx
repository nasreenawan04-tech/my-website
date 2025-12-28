import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDebounce } from '@/hooks/use-debounce';
import { searchTools } from '@/lib/search';
import { tools } from '@/data/tools';
import Logo from './Logo';
import { QuickAccessBar } from './QuickAccessBar';
import { OfflineStatus } from './ui/OfflineStatus';
import { Menu, X, Search, User, LogOut, Scale } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useComparison } from '@/context/ComparisonContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import defaultAvatarUrl from '@assets/jhj_1761976221112.png';

// Add custom CSS for smooth transitions
const headerStyle = `
  @media (max-width: 768px) {
    [data-header-sticky] {
      height: auto;
    }
  }
  
  [data-header-sticky] {
    will-change: background-color, box-shadow, border-color;
  }
  
  [data-mobile-nav-link] {
    will-change: transform, opacity;
  }
`;

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(tools);
  const [location, setLocation] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { user, logout, loading } = useAuth();
  const { toast } = useToast();
  const { selectedTools } = useComparison();
  
  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Handle scroll effect with smooth transition
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    };
    
    // Throttle scroll handler for better performance
    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
    return () => window.removeEventListener('scroll', scrollHandler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  // Close search on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false);
          setSearchQuery('');
        } else if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isSearchOpen, isMobileMenuOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      // Small delay to ensure smooth animation before focus
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Perform search only when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      const results = searchTools(debouncedSearchQuery);
      setSearchResults(results);
    } else {
      setSearchResults(tools);
    }
  }, [debouncedSearchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleToolClick = useCallback((toolHref: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setLocation(toolHref);
  }, [setLocation]);

  // Memoize nav links to prevent recreating on every render
  const navLinks = useMemo(() => [
    { href: '/finance-tools', label: 'Finance Tools' },
    { href: '/text-tools', label: 'Text Tools' },
    { href: '/health-tools', label: 'Health Tools' },
    { href: '/blog', label: 'Blog' },
    { href: '/favorite-tools', label: 'Favorites' },
    { href: '/recently-used-tools', label: 'Recently Used' }
  ], []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.'
      });
      setLocation('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to log out',
        variant: 'destructive'
      });
    }
  }, [logout, toast, setLocation]);

  return (
    <>
      <header 
        className={`sticky top-0 z-1000 w-full backdrop-blur-xl transition-all duration-300 ease-out min-h-[64px] sm:min-h-[72px] md:min-h-[80px] lg:min-h-[88px] ${
          isScrolled 
            ? 'bg-white/95 dark:bg-neutral-900/95 shadow-2xl border-b border-gray-200/60 dark:border-neutral-700/60' 
            : 'bg-white/85 dark:bg-neutral-900/85 shadow-md border-b border-gray-100/50 dark:border-neutral-800/30'
        }`}
        data-testid="header-main"
        data-header-sticky
      >
        <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-2 sm:gap-3 md:gap-4 h-16 sm:h-18 md:h-20 lg:h-24">
            {/* Logo Section */}
            <div className="flex-shrink-0 z-10">
              <Logo />
            </div>

            {/* Desktop Navigation - Show on md screens and above */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2 px-2 lg:px-6 flex-1 justify-center" aria-label="Main Navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 md:px-3.5 lg:px-4 py-2 text-xs md:text-sm lg:text-base font-medium rounded-lg transition-all duration-200 ease-out relative group whitespace-nowrap ${
                    location === link.href 
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 shadow-sm' 
                      : 'text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100/70 dark:hover:bg-neutral-800/60'
                  }`}
                  data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  aria-current={location === link.href ? 'page' : undefined}
                >
                  {link.label}
                  <span 
                    className={`absolute -bottom-0.5 left-3 right-3 h-1 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 transition-all duration-300 ease-out rounded-full ${
                      location === link.href ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-40 group-hover:scale-x-95'
                    }`}
                  />
                </Link>
              ))}
            </nav>

            {/* Right Section - Search, Auth, and Mobile Menu */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 ml-auto">
              {/* Offline Status */}
              <OfflineStatus />

              {/* Compare Button */}
              {selectedTools.length > 0 && (
                <Link href="/compare-tools">
                  <button 
                    className="p-2 md:p-2.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-all duration-200 ease-out hover:scale-110 active:scale-95 relative group shadow-sm hover:shadow-md"
                    data-testid="button-header-compare"
                    aria-label="View comparison"
                    title="View comparison"
                  >
                    <Scale className="w-5 h-5 md:w-5.5 md:h-5.5" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-[10px] font-bold text-white shadow-md">
                      {selectedTools.length}
                    </span>
                  </button>
                </Link>
              )}

              {/* Search Button */}
              <button 
                className="p-2 md:p-2.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-neutral-800/60 transition-all duration-200 ease-out hover:scale-110 active:scale-95"
                onClick={() => setIsSearchOpen(true)}
                data-testid="button-search"
                aria-label="Search tools"
                title="Search tools"
              >
                <Search className="w-5 h-5 md:w-5.5 md:h-5.5" aria-hidden="true" />
              </button>

              {/* Desktop Auth Buttons - Hidden below md */}
              {!loading && (
                <div className="hidden md:flex items-center gap-2">
                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-200"
                          data-testid="button-user-menu"
                        >
                          <Avatar className="h-8 w-8 transition-transform duration-200 hover:scale-105">
                            <AvatarImage src={user.photoURL || defaultAvatarUrl} alt={user.displayName || user.email || 'User'} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm font-bold shadow-sm">
                              {user.displayName
                                ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                : user.email?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium max-w-[120px] xl:max-w-[160px] truncate" data-testid="text-header-user-email">
                            {user.displayName || user.email}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 animate-in fade-in-0 zoom-in-95 duration-200">
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                            <p className="text-xs leading-none text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="cursor-pointer" data-testid="link-profile">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleLogout}
                          className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                          data-testid="button-dropdown-logout"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link href="/login">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-200"
                          data-testid="button-header-login"
                        >
                          Login
                        </Button>
                      </Link>
                      <Link href="/signup">
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-sm transition-all duration-200 hover:shadow-md px-4"
                          data-testid="button-header-signup"
                          aria-label="Sign up for DapsiWow"
                        >
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Button - Show on mobile only */}
              <button
                className="md:hidden p-3 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors duration-200 ease-in-out min-h-11 min-w-11"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                data-testid="button-mobile-menu"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                title="Toggle navigation menu"
              >
                <div className="relative w-6 h-6">
                  <Menu 
                    className={`absolute inset-0 w-6 h-6 transition-all duration-300 ease-in-out ${
                      isMobileMenuOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                    }`}
                    aria-hidden="true"
                  />
                  <X 
                    className={`absolute inset-0 w-6 h-6 transition-all duration-300 ease-in-out ${
                      isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                    }`}
                    aria-hidden="true"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Smooth slide-in animation */}
        {/* Semi-transparent backdrop overlay */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-lg z-40 top-12 sm:top-14 transition-all duration-300 ease-out"
            onClick={() => setIsMobileMenuOpen(false)}
            data-testid="mobile-menu-backdrop"
            aria-hidden="true"
          />
        )}
        <div 
          className={`md:hidden absolute top-full left-0 right-0 bg-white/98 dark:bg-neutral-900/98 backdrop-blur-xl border-t border-gray-200/70 dark:border-neutral-700/70 shadow-2xl transition-all duration-300 ease-out overflow-hidden z-999 ${
            isMobileMenuOpen 
              ? 'max-h-[calc(100vh-3.5rem)] opacity-100 visible translate-y-0' 
              : 'max-h-0 opacity-0 invisible translate-y-1'
          }`}
          data-testid="mobile-menu"
          aria-label="Mobile navigation"
          data-mobile-nav
        >
          <nav className="px-4 py-3 space-y-1 overflow-y-auto max-h-[calc(100vh-3.5rem)] scrollbar-thin">
            {/* Navigation Links */}
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block font-medium text-base py-3 px-4 rounded-lg transition-all duration-200 ease-in-out ${
                  location === link.href
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-neutral-800/50 active:scale-98'
                } ${
                  isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                }`}
                style={{ 
                  transitionDelay: isMobileMenuOpen ? `${index * 40}ms` : '0ms',
                  transitionProperty: 'transform, opacity, background-color, color, box-shadow'
                }}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid={`mobile-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Auth Section */}
            {!loading && (
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-neutral-700 space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-100 dark:border-blue-900/50">
                      <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-neutral-800">
                        <AvatarImage src={user.photoURL || defaultAvatarUrl} alt={user.displayName || user.email || 'User'} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
                          {user.displayName
                            ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                            : user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Logged in as</p>
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate" data-testid="text-mobile-user-email">
                          {user.displayName || user.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-gray-200 dark:border-neutral-700 hover:border-blue-200 dark:hover:border-blue-800 active:scale-98"
                      data-testid="link-mobile-profile"
                    >
                      <User className="w-5 h-5" />
                      <span>My Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 text-neutral-700 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-950/30 border border-gray-200 dark:border-neutral-700 hover:border-red-200 dark:hover:border-red-800 active:scale-98"
                      data-testid="button-mobile-logout"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-center text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700 active:scale-98"
                      data-testid="link-mobile-login"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-center bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-98"
                      data-testid="link-mobile-signup"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Search Modal - Optimized for all screen sizes */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-xl z-50 flex items-start justify-center pt-12 sm:pt-16 md:pt-20 px-3 sm:px-4 animate-in fade-in duration-200"
          onClick={() => {
            setIsSearchOpen(false);
            setSearchQuery('');
          }}
        >
          <div 
            className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-8rem)] overflow-hidden animate-in slide-in-from-top-2 duration-300 ease-out border border-gray-200/80 dark:border-neutral-700/80"
            role="dialog"
            aria-label="Search tools"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Section - Google Chrome Style */}
            <div className="p-4 sm:p-5 md:p-6 border-b border-gray-200/60 dark:border-neutral-700/60 bg-gradient-to-br from-gray-50/70 to-blue-50/30 dark:from-neutral-800/50 dark:to-blue-950/20">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 pointer-events-none">
                  <Search className="w-5 h-5" aria-hidden="true" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for tools..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full py-3 sm:py-3.5 pl-12 pr-12 text-base sm:text-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-full hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent focus:shadow-xl transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                  data-testid="search-modal-input"
                  aria-label="Search for tools"
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 transition-all duration-200 hover:scale-110 active:scale-95 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700"
                  data-testid="search-modal-close"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Results */}
            <div 
              className="max-h-[calc(100vh-16rem)] sm:max-h-96 overflow-y-auto scrollbar-thin"
              role="listbox"
              aria-label="Search results"
            >
              {searchResults.length > 0 ? (
                searchResults.slice(0, 10).map((tool, index) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.href)}
                    className="w-full p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-neutral-800/70 border-b border-gray-100 dark:border-neutral-800 last:border-0 transition-all duration-200 ease-in-out animate-in fade-in slide-in-from-bottom-2 active:bg-gray-100 dark:active:bg-neutral-800"
                    style={{ animationDelay: `${index * 30}ms` }}
                    data-testid={`search-result-${tool.id}`}
                    role="option"
                    aria-selected="false"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-neutral-100 truncate text-sm sm:text-base">
                          {tool.name}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 truncate mt-0.5">
                          {tool.description}
                        </div>
                      </div>
                      {tool.isPopular && (
                        <div className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 animate-in zoom-in duration-200">
                          Popular
                        </div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 sm:p-12 text-center text-gray-500 dark:text-neutral-400 animate-in fade-in duration-200">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                    <Search size={32} className="text-gray-400 dark:text-neutral-500" />
                  </div>
                  <p className="text-base font-medium">No tools found</p>
                  <p className="text-sm mt-1">Try searching with different keywords</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDebounce } from '@/hooks/use-debounce';
import { searchTools } from '@/lib/search';
import { tools } from '@/data/tools';
import Logo from './Logo';
import { Menu, X, Search, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  
  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close search on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isSearchOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
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
        className={`sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-neutral-900/95 border-b transition-all duration-300 ease-in-out ${
          isScrolled 
            ? 'shadow-lg border-gray-300/50 dark:border-neutral-700/50' 
            : 'shadow-sm border-gray-200/50 dark:border-neutral-800/50'
        }`}
        data-testid="header-main"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 md:h-[4.5rem]">
            {/* Logo Section */}
            <div className="flex-shrink-0">
              <Logo />
            </div>

            {/* Desktop Navigation - Hidden on mobile and tablet */}
            <nav className="hidden xl:flex items-center space-x-1 2xl:space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm 2xl:text-base font-medium rounded-lg transition-all duration-200 relative group ${
                    location === link.href 
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50' 
                      : 'text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-neutral-800/50'
                  }`}
                  data-testid={`link-${link.label.toLowerCase().replace(' ', '-')}`}
                >
                  {link.label}
                  <span 
                    className={`absolute bottom-1 left-3 right-3 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 rounded-full ${
                      location === link.href ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-50 group-hover:scale-x-100'
                    }`}
                  />
                </Link>
              ))}
            </nav>

            {/* Right Section - Search, Auth, and Mobile Menu */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              {/* Search Button */}
              <button 
                className="p-2 sm:p-2.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
                onClick={() => setIsSearchOpen(true)}
                data-testid="button-search"
                aria-label="Search tools"
                title="Search tools"
              >
                <Search size={20} className="sm:w-5 sm:h-5" />
              </button>

              {/* Desktop Auth Buttons - Hidden below lg */}
              {!loading && (
                <div className="hidden lg:flex items-center gap-2">
                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-neutral-800"
                          data-testid="button-user-menu"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
                              {user.displayName
                                ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                : user.email?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium max-w-[120px] xl:max-w-[180px] truncate" data-testid="text-header-user-email">
                            {user.displayName || user.email}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
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
                          className="hover:bg-gray-100 dark:hover:bg-neutral-800"
                          data-testid="button-header-login"
                        >
                          Login
                        </Button>
                      </Link>
                      <Link href="/signup">
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-sm"
                          data-testid="button-header-signup"
                        >
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Button - Show on tablet and mobile */}
              <button
                className="xl:hidden p-2 sm:p-2.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                data-testid="button-mobile-menu"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
              >
                <div className="relative w-5 h-5 sm:w-6 sm:h-6">
                  <Menu 
                    size={20} 
                    className={`absolute inset-0 transition-all duration-300 sm:w-6 sm:h-6 ${
                      isMobileMenuOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                    }`}
                  />
                  <X 
                    size={20} 
                    className={`absolute inset-0 transition-all duration-300 sm:w-6 sm:h-6 ${
                      isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Menu */}
        <div 
          className={`xl:hidden bg-white/98 dark:bg-neutral-900/98 backdrop-blur-lg border-t border-gray-200 dark:border-neutral-700 transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4rem)] opacity-100' : 'max-h-0 opacity-0'
          }`}
          data-testid="mobile-menu"
          aria-label="Mobile navigation"
        >
          <nav className="px-3 sm:px-4 md:px-6 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4rem)]">
            {/* Navigation Links */}
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block font-medium py-3 px-4 rounded-lg transition-all duration-200 touch-manipulation ${
                  location === link.href
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-neutral-800/50'
                } ${
                  isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                }`}
                style={{ 
                  transitionDelay: isMobileMenuOpen ? `${index * 30}ms` : '0ms' 
                }}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid={`mobile-link-${link.label.toLowerCase().replace(' ', '-')}`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Auth Section */}
            {!loading && (
              <div className="pt-3 mt-3 border-t border-gray-200 dark:border-neutral-700 space-y-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
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
                      className="w-full flex items-center justify-center gap-2 text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-gray-200 dark:border-neutral-700 hover:border-blue-200 dark:hover:border-blue-800 touch-manipulation"
                      data-testid="link-mobile-profile"
                    >
                      <User size={18} />
                      <span>My Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 text-neutral-700 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-950/30 border border-gray-200 dark:border-neutral-700 hover:border-red-200 dark:hover:border-red-800 touch-manipulation"
                      data-testid="button-mobile-logout"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-center text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700 touch-manipulation"
                      data-testid="link-mobile-login"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-center bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-sm touch-manipulation"
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

      {/* Search Modal */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-16 sm:pt-20 md:pt-24 px-3 sm:px-4 animate-in fade-in duration-200"
          onClick={() => {
            setIsSearchOpen(false);
            setSearchQuery('');
          }}
        >
          <div 
            className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-8rem)] sm:max-h-[calc(100vh-10rem)] overflow-hidden animate-in slide-in-from-top-4 duration-300 border border-gray-200 dark:border-neutral-700"
            role="dialog"
            aria-label="Search tools"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Section */}
            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-800/30">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 pointer-events-none" size={20} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for tools..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full py-3 sm:py-3.5 pl-11 sm:pl-12 pr-11 sm:pr-12 text-base sm:text-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                  data-testid="search-modal-input"
                  aria-label="Search for tools"
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 transition-all duration-200 hover:scale-110 active:scale-95 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 touch-manipulation"
                  data-testid="search-modal-close"
                  aria-label="Close search"
                >
                  <X size={20} />
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
                    className="w-full p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-neutral-800/70 border-b border-gray-100 dark:border-neutral-800 last:border-0 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 active:bg-gray-100 dark:active:bg-neutral-800 touch-manipulation"
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

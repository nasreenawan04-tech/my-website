import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useIsMobile } from '@/hooks/use-mobile';
import { searchTools } from '@/lib/search';
import { tools } from '@/data/tools';
import Logo from './Logo';
import { Menu, X, Search, User, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

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

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const results = searchTools(query);
    setSearchResults(results);
  };

  const handleToolClick = (toolHref: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setLocation(toolHref);
  };

  const navLinks = [
    { href: '/finance-tools', label: 'Finance Tools' },
    { href: '/text-tools', label: 'Text Tools' },
    { href: '/health-tools', label: 'Health Tools' },
    { href: '/favorite-tools', label: 'Favorites' },
    { href: '/recently-used-tools', label: 'Recently Used' }
  ];

  const handleLogout = async () => {
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
  };

  return (
    <>
      <header 
        className={`sticky top-0 z-50 transition-all duration-500 ease-out ${
          isScrolled 
            ? 'backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 shadow-xl shadow-blue-500/5 dark:shadow-blue-400/10 border-b border-blue-100/50 dark:border-blue-900/30' 
            : 'backdrop-blur-lg bg-white/70 dark:bg-neutral-900/70 shadow-lg shadow-blue-500/5 border-b border-gray-200/30 dark:border-neutral-800/30'
        }`}
        data-testid="header-main"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-400/5 dark:via-purple-400/5 dark:to-pink-400/5 opacity-50" />
        
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-[4.5rem] md:h-20">
            <div className="flex-shrink-0 transform transition-all duration-300 hover:scale-105">
              <Logo />
            </div>

            <nav className="hidden xl:flex items-center gap-1.5 2xl:gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative px-4 py-2.5 text-sm 2xl:text-base font-semibold rounded-xl transition-all duration-300 overflow-hidden ${
                    location === link.href 
                      ? 'text-white dark:text-white' 
                      : 'text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  data-testid={`link-${link.label.toLowerCase().replace(' ', '-')}`}
                >
                  {location === link.href && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 dark:from-blue-500 dark:via-blue-600 dark:to-purple-600 rounded-xl shadow-lg shadow-blue-500/30 dark:shadow-blue-400/20 animate-in fade-in zoom-in duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                    </>
                  )}
                  {location !== link.href && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-neutral-800 dark:to-neutral-700/50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100" />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {link.label}
                    {location === link.href && (
                      <Sparkles size={14} className="animate-pulse" />
                    )}
                  </span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                className="group relative p-2.5 sm:p-3 rounded-xl text-neutral-600 dark:text-neutral-300 transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation overflow-hidden"
                onClick={() => setIsSearchOpen(true)}
                data-testid="button-search"
                aria-label="Search tools"
                title="Search tools"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-400/10 dark:to-purple-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Search size={20} className="sm:w-5 sm:h-5 relative z-10 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
              </button>

              {!loading && (
                <div className="hidden lg:flex items-center gap-2.5">
                  {user ? (
                    <div className="flex items-center gap-2.5 xl:gap-3 animate-in fade-in slide-in-from-right-5 duration-500">
                      <div className="flex items-center gap-2.5 px-4 py-2 xl:py-2.5 rounded-xl bg-gradient-to-br from-blue-50 via-blue-50/80 to-purple-50/50 dark:from-blue-950/70 dark:via-blue-900/50 dark:to-purple-950/40 border border-blue-200/50 dark:border-blue-800/50 shadow-lg shadow-blue-500/10 dark:shadow-blue-400/5 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 dark:hover:shadow-blue-400/10 hover:scale-105">
                        <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-500 dark:to-purple-600 flex items-center justify-center shadow-md">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                          <User size={16} className="text-white relative z-10" />
                        </div>
                        <span className="text-sm font-semibold bg-gradient-to-r from-blue-700 via-blue-600 to-purple-600 dark:from-blue-400 dark:via-blue-300 dark:to-purple-400 bg-clip-text text-transparent max-w-[120px] xl:max-w-[180px] truncate" data-testid="text-header-user-email">
                          {user.email}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        className="relative overflow-hidden group border-red-200/50 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                        data-testid="button-header-logout"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                        <LogOut size={14} className="relative z-10 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300" />
                        <span className="hidden xl:inline relative z-10 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">Logout</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 animate-in fade-in slide-in-from-right-5 duration-500">
                      <Link href="/login">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="relative overflow-hidden group rounded-xl transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                          data-testid="button-header-login"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-neutral-800 dark:to-neutral-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <span className="relative z-10">Login</span>
                        </Button>
                      </Link>
                      <Link href="/signup">
                        <Button 
                          size="sm" 
                          className="relative overflow-hidden group rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 dark:shadow-blue-400/20 dark:hover:shadow-blue-400/30 transition-all duration-300 hover:scale-105"
                          data-testid="button-header-signup"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 dark:from-blue-600 dark:via-blue-500 dark:to-purple-600" />
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                          <span className="relative z-10 text-white font-semibold">Sign Up</span>
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <button
                className="xl:hidden group relative p-2.5 sm:p-3 rounded-xl text-neutral-600 dark:text-neutral-300 transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation overflow-hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                data-testid="button-mobile-menu"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-400/10 dark:to-purple-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 w-5 h-5 sm:w-6 sm:h-6">
                  <Menu 
                    size={20} 
                    className={`absolute inset-0 transition-all duration-500 sm:w-6 sm:h-6 group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                      isMobileMenuOpen ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'
                    }`}
                  />
                  <X 
                    size={20} 
                    className={`absolute inset-0 transition-all duration-500 sm:w-6 sm:h-6 group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                      isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div 
        className={`xl:hidden relative backdrop-blur-xl bg-white/95 dark:bg-neutral-900/95 border-b border-gray-200/50 dark:border-neutral-700/50 transition-all duration-500 ease-out overflow-hidden ${
          isMobileMenuOpen ? 'max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-4.5rem)] opacity-100 shadow-2xl' : 'max-h-0 opacity-0 shadow-none'
        }`}
        data-testid="mobile-menu"
        aria-label="Mobile navigation"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-400/5 dark:via-purple-400/5 dark:to-pink-400/5" />
        <nav className="relative px-3 sm:px-4 md:px-6 py-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-4.5rem)]">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={`group relative block font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 touch-manipulation overflow-hidden ${
                location === link.href
                  ? 'text-white shadow-lg'
                  : 'text-neutral-700 dark:text-neutral-300 hover:scale-[1.02]'
              } ${
                isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
              }`}
              style={{ 
                transitionDelay: isMobileMenuOpen ? `${index * 40}ms` : '0ms' 
              }}
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid={`mobile-link-${link.label.toLowerCase().replace(' ', '-')}`}
            >
              {location === link.href && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 dark:from-blue-500 dark:via-blue-600 dark:to-purple-600 rounded-xl shadow-lg shadow-blue-500/30" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                </>
              )}
              {location !== link.href && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-neutral-800 dark:to-neutral-700/50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100" />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {link.label}
                {location === link.href && (
                  <Sparkles size={14} className="animate-pulse" />
                )}
              </span>
            </Link>
          ))}
          
          {!loading && (
            <div className="pt-4 mt-4 border-t border-gray-200/50 dark:border-neutral-700/50 space-y-2.5 animate-in fade-in slide-in-from-bottom-5 duration-500" style={{ animationDelay: '200ms' }}>
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-br from-blue-50 via-blue-50/80 to-purple-50/50 dark:from-blue-950/70 dark:via-blue-900/50 dark:to-purple-950/40 border border-blue-200/50 dark:border-blue-800/50 shadow-lg shadow-blue-500/10">
                    <div className="relative flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-500 dark:to-purple-600 flex items-center justify-center shadow-md">
                      <User size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Logged in as</p>
                      <p className="text-sm font-bold bg-gradient-to-r from-blue-700 via-blue-600 to-purple-600 dark:from-blue-400 dark:via-blue-300 dark:to-purple-400 bg-clip-text text-transparent truncate" data-testid="text-mobile-user-email">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="relative overflow-hidden group w-full flex items-center justify-center gap-2.5 text-neutral-700 dark:text-neutral-300 font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 border border-red-200/50 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700 touch-manipulation shadow-md hover:shadow-lg hover:scale-[1.02]"
                    data-testid="button-mobile-logout"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                    <LogOut size={18} className="relative z-10 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300" />
                    <span className="relative z-10 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">Logout</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="relative overflow-hidden group text-center text-neutral-700 dark:text-neutral-300 font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 border border-gray-200/50 dark:border-neutral-700/50 touch-manipulation shadow-md hover:shadow-lg hover:scale-105"
                    data-testid="link-mobile-login"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-neutral-800 dark:to-neutral-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10">Login</span>
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="relative overflow-hidden group text-center font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 touch-manipulation hover:scale-105"
                    data-testid="link-mobile-signup"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 dark:from-blue-600 dark:via-blue-500 dark:to-purple-600" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                    <span className="relative z-10 text-white">Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>

      {isSearchOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-start justify-center pt-16 sm:pt-20 md:pt-24 px-3 sm:px-4 animate-in fade-in duration-300"
          onClick={() => {
            setIsSearchOpen(false);
            setSearchQuery('');
          }}
        >
          <div 
            className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-500/20 dark:shadow-blue-400/10 w-full max-w-2xl max-h-[calc(100vh-8rem)] sm:max-h-[calc(100vh-10rem)] overflow-hidden animate-in slide-in-from-top-8 zoom-in-95 duration-500 border border-blue-200/30 dark:border-blue-800/30"
            role="dialog"
            aria-label="Search tools"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-5 sm:p-6 border-b border-gray-200/50 dark:border-neutral-700/50 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/20 dark:from-blue-950/30 dark:via-purple-950/20 dark:to-pink-950/10">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-md" />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 pointer-events-none z-10 transition-colors duration-300 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400" size={22} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for tools..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="relative w-full py-4 pl-12 pr-12 text-base sm:text-lg border-2 border-gray-300/50 dark:border-neutral-600/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 placeholder:text-gray-400 dark:placeholder:text-neutral-500 shadow-lg hover:shadow-xl"
                  data-testid="search-modal-input"
                  aria-label="Search for tools"
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 transition-all duration-300 hover:scale-110 active:scale-95 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 z-10 touch-manipulation"
                  data-testid="search-modal-close"
                  aria-label="Close search"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="max-h-[calc(100vh-18rem)] sm:max-h-[28rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-neutral-500">
              {searchResults.length > 0 ? (
                searchResults.slice(0, 10).map((tool, index) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.href)}
                    className="group relative w-full p-5 sm:p-6 text-left hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-purple-50/30 dark:hover:from-blue-950/30 dark:hover:to-purple-950/20 border-b border-gray-100/50 dark:border-neutral-800/50 last:border-0 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 active:scale-[0.98] touch-manipulation"
                    style={{ animationDelay: `${index * 40}ms` }}
                    data-testid={`search-result-${tool.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 dark:text-neutral-100 truncate text-sm sm:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                          {tool.name}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 truncate mt-1">
                          {tool.description}
                        </div>
                      </div>
                      {tool.isPopular && (
                        <div className="relative overflow-hidden bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/50 dark:to-orange-900/40 text-yellow-800 dark:text-yellow-200 text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 animate-in zoom-in duration-300 shadow-md">
                          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 animate-pulse" />
                          <span className="relative z-10">Popular</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-12 sm:p-16 text-center text-gray-500 dark:text-neutral-400 animate-in fade-in zoom-in duration-300">
                  <div className="relative w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-neutral-800 dark:to-neutral-700/50 flex items-center justify-center shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl blur-md" />
                    <Search size={36} className="text-gray-400 dark:text-neutral-500 relative z-10" />
                  </div>
                  <p className="text-lg font-bold text-gray-700 dark:text-neutral-300">No tools found</p>
                  <p className="text-sm mt-2">Try searching with different keywords</p>
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

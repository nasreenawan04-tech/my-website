import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Logo from '../Logo';
import { SearchBar } from './SearchBar';
import { OfflineStatus } from '../ui/OfflineStatus';
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
import { Menu, X, Search, User, LogOut } from 'lucide-react';
import defaultAvatarUrl from '@assets/jhj_1761976221112.png';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const { user, logout, loading } = useAuth();
  const { toast } = useToast();

  // Handle scroll effect with smooth transition
  useEffect(() => {
    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 10;
          setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
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

  // Memoize nav links to prevent recreating on every render
  const navLinks = useMemo(() => [
    { href: '/finance-tools', label: 'Finance' },
    { href: '/text-tools', label: 'Text Tools' },
    { href: '/health-tools', label: 'Health' },
    { href: '/favorite-tools', label: 'Favorites' },
    { href: '/blog', label: 'Blog' },
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

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header 
        className={`sticky top-0 z-40 w-full backdrop-blur-xl transition-all duration-300 ease-out min-h-[64px] sm:min-h-[72px] md:min-h-[80px] ${
          isScrolled 
            ? 'bg-white/95 dark:bg-neutral-900/95 shadow-2xl border-b border-gray-200/60 dark:border-neutral-700/60' 
            : 'bg-white/85 dark:bg-neutral-900/85 shadow-md border-b border-gray-100/50 dark:border-neutral-800/30'
        }`}
        data-testid="header-main"
      >
        <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-2 sm:gap-3 md:gap-4 h-16 sm:h-18 md:h-20">
            {/* Logo Section */}
            <div className="flex-shrink-0 z-10">
              <Logo />
            </div>

            {/* Desktop Navigation - Show on md screens and above */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2 px-2 lg:px-6 flex-1 justify-center relative" aria-label="Main Navigation">
              {navLinks.map((link) => (
                <div key={link.href} className="relative group">
                  <Link
                    href={link.href}
                    className={`px-3 md:px-3.5 lg:px-4 py-2 text-xs md:text-sm lg:text-base font-medium rounded-lg transition-all duration-200 ease-out ${
                      location === link.href 
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 shadow-sm' 
                        : 'text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100/70 dark:hover:bg-neutral-800/60'
                    }`}
                    data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    aria-current={location === link.href ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Right Section - Search, Auth, and Mobile Menu */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 ml-auto">
              {/* Offline Status */}
              <OfflineStatus />


              {/* Search Button */}
              <button 
                className="p-2 md:p-2.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-neutral-800/60 transition-all duration-200 hover:scale-110 active:scale-95"
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
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-lg z-30 top-24 sm:top-28 transition-all duration-300 ease-out"
            onClick={() => setIsMobileMenuOpen(false)}
            data-testid="mobile-menu-backdrop"
            aria-hidden="true"
          />
        )}
        <div 
          className={`md:hidden absolute top-full left-0 right-0 bg-white dark:bg-neutral-900/98 backdrop-blur-xl border-t border-gray-200/70 dark:border-neutral-700/70 shadow-2xl transition-all duration-300 ease-out overflow-hidden z-999 ${
            isMobileMenuOpen 
              ? 'max-h-[calc(100vh-3.5rem)] opacity-100 visible translate-y-0' 
              : 'max-h-0 opacity-0 invisible translate-y-1'
          }`}
          data-testid="mobile-menu"
          aria-label="Mobile navigation"
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
            
            <Link
              href="/all-tools"
              className={`block font-medium text-base py-3 px-4 rounded-lg transition-all duration-200 ease-in-out text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-neutral-800/50 active:scale-98 ${
                isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}
              style={{ 
                transitionDelay: isMobileMenuOpen ? `${navLinks.length * 40}ms` : '0ms',
                transitionProperty: 'transform, opacity, background-color, color, box-shadow'
              }}
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="mobile-link-all-tools"
            >
              All Tools
            </Link>
            
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

      <SearchBar 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
        onToolSelect={(href) => setLocation(href)}
      />
    </>
  );
};

export default Header;

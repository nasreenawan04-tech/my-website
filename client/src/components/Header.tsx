
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useIsMobile } from '@/hooks/use-mobile';
import { searchTools } from '@/lib/search';
import { tools } from '@/data/tools';
import Logo from './Logo';
import { Menu, X, Search } from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(tools);
  const [location, setLocation] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <>
      <header 
        className={`sticky top-0 z-50 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700 transition-all duration-300 ease-in-out ${
          isScrolled ? 'shadow-lg' : 'shadow-sm'
        }`}
        data-testid="header-main"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <Logo />

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-neutral-600 dark:text-neutral-300 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 font-medium relative group ${
                    location === link.href ? 'text-blue-500 dark:text-blue-400' : ''
                  }`}
                  data-testid={`link-${link.label.toLowerCase().replace(' ', '-')}`}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 dark:bg-blue-400 transition-all duration-300 group-hover:w-full ${
                    location === link.href ? 'w-full' : ''
                  }`}></span>
                </Link>
              ))}
            </nav>

            {/* Search and Mobile Menu */}
            <div className="flex items-center space-x-2">
              {/* Search */}
              <button 
                className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110 active:scale-95"
                onClick={() => setIsSearchOpen(true)}
                data-testid="button-search"
                aria-label="Search tools"
                title="Search tools"
              >
                <Search size={18} />
              </button>

              {/* Mobile Menu */}
              <button
                className="lg:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110 active:scale-95"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                data-testid="button-mobile-menu"
                aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
                aria-expanded={isMobileMenuOpen}
              >
                <div className="relative w-5 h-5">
                  <Menu 
                    size={18} 
                    className={`absolute inset-0 transition-all duration-300 ${
                      isMobileMenuOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                    }`}
                  />
                  <X 
                    size={18} 
                    className={`absolute inset-0 transition-all duration-300 ${
                      isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`lg:hidden bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-700 overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
          data-testid="mobile-menu"
          aria-label="Mobile navigation"
        >
          <nav className="px-4 py-3 space-y-2">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block text-neutral-600 dark:text-neutral-300 hover:text-blue-500 dark:hover:text-blue-400 font-medium py-2 px-3 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-neutral-800 transform ${
                  isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                }`}
                style={{ 
                  transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms' 
                }}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid={`mobile-link-${link.label.toLowerCase().replace(' ', '-')}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Search Modal */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 animate-in fade-in duration-200"
          onClick={() => {
            setIsSearchOpen(false);
            setSearchQuery('');
          }}
        >
          <div 
            className="bg-white dark:bg-neutral-900 rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-96 overflow-hidden animate-in slide-in-from-top-4 duration-300"
            role="dialog"
            aria-label="Search tools"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500" size={20} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for tools..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full py-3 pl-12 pr-12 text-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
                  data-testid="search-modal-input"
                  aria-label="Search for tools"
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 transition-all duration-200 hover:scale-110 active:scale-95 p-1"
                  data-testid="search-modal-close"
                  aria-label="Close search"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent">
              {searchResults.length > 0 ? (
                searchResults.slice(0, 10).map((tool, index) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.href)}
                    className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-neutral-800 border-b border-gray-100 dark:border-neutral-700 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 30}ms` }}
                    data-testid={`search-result-${tool.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-neutral-100 truncate">{tool.name}</div>
                        <div className="text-sm text-gray-500 dark:text-neutral-400 truncate">{tool.description}</div>
                      </div>
                      {tool.isPopular && (
                        <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex-shrink-0 animate-in zoom-in duration-200">
                          Popular
                        </div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-neutral-400 animate-in fade-in duration-200">
                  <p>No tools found matching "{searchQuery}"</p>
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

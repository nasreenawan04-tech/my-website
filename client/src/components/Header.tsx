import { useState } from 'react';
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
  const isMobile = useIsMobile();

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
    { href: '/finance', label: 'Finance Tools' },
    { href: '/text', label: 'Text Tools' },
    { href: '/health', label: 'Health Tools' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-neutral-900 shadow-sm border-b border-gray-200 dark:border-neutral-700 transition-colors duration-200" data-testid="header-main">
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
                className={`text-neutral-600 dark:text-neutral-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200 font-medium ${
                  location === link.href ? 'text-blue-500 dark:text-blue-400' : ''
                }`}
                data-testid={`link-${link.label.toLowerCase().replace(' ', '-')}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search and Mobile Menu */}
          <div className="flex items-center space-x-2">

            {/* Search */}
            <button 
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              onClick={() => setIsSearchOpen(true)}
              data-testid="button-search"
              aria-label="Search tools"
              title="Search tools"
            >
              <Search size={18} />
            </button>

            {/* Mobile Menu */}
            <button
              className="lg:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
              aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <nav 
          className="lg:hidden bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-700" 
          data-testid="mobile-menu"
          aria-label="Mobile navigation"
        >
          <div className="px-4 py-3 space-y-3">

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-neutral-600 dark:text-neutral-300 hover:text-blue-500 dark:hover:text-blue-400 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid={`mobile-link-${link.label.toLowerCase().replace(' ', '-')}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div 
            className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-96 overflow-hidden"
            role="dialog"
            aria-label="Search tools"
            aria-modal="true"
          >
            <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for tools..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full py-3 px-4 pr-12 text-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  autoFocus
                  data-testid="search-modal-input"
                  aria-label="Search for tools"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-3 top-3 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300"
                  data-testid="search-modal-close"
                  aria-label="Close search"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.slice(0, 10).map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.href)}
                    className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-neutral-800 border-b border-gray-100 dark:border-neutral-700 transition-colors"
                    data-testid={`search-result-${tool.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-neutral-100 truncate">{tool.name}</div>
                        <div className="text-sm text-gray-500 dark:text-neutral-400 truncate">{tool.description}</div>
                      </div>
                      {tool.isPopular && (
                        <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex-shrink-0">
                          Popular
                        </div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-neutral-400">
                  <p>No tools found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
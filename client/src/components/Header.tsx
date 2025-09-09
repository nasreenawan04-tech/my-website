import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useIsMobile } from '@/hooks/use-mobile';
import { searchTools } from '@/lib/search';
import { tools } from '@/data/tools';
import FavoritesDropdown from '@/components/FavoritesDropdown';
import RecentToolsDropdown from '@/components/RecentToolsDropdown';

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
    { href: '/pdf', label: 'PDF Tools' },
    { href: '/text', label: 'Text Tools' },
    { href: '/health', label: 'Health Tools' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-neutral-900 shadow-sm border-b border-gray-200 dark:border-neutral-700 transition-colors duration-200" data-testid="header-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-tools text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold text-neutral-800 dark:text-neutral-100">DapsiWow</span>
          </Link>
          
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
          
          {/* Search, Favorites, Recent, and Mobile Menu */}
          <div className="flex items-center space-x-2">
            {/* Recent Tools - Hidden on mobile */}
            <div className="hidden sm:block">
              <RecentToolsDropdown />
            </div>
            
            {/* Favorites - Hidden on mobile */}
            <div className="hidden sm:block">
              <FavoritesDropdown />
            </div>
            
            {/* Search */}
            <button 
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              onClick={() => setIsSearchOpen(true)}
              data-testid="button-search"
              title="Search tools"
            >
              <i className="fas fa-search text-lg"></i>
            </button>
            
            {/* Mobile Menu */}
            <button
              className="lg:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <i className="fas fa-bars text-lg"></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-700" data-testid="mobile-menu">
          <div className="px-4 py-3 space-y-3">
            {/* Quick access section for mobile */}
            <div className="pb-3 border-b border-gray-200 dark:border-neutral-700">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <RecentToolsDropdown />
                </div>
                <div className="flex-1">
                  <FavoritesDropdown />
                </div>
              </div>
            </div>
            
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
        </div>
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-96 overflow-hidden">
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
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-3 top-3 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300"
                  data-testid="search-modal-close"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.slice(0, 10).map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.href)}
                    className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors"
                    data-testid={`search-result-${tool.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className={`${tool.icon} text-white text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{tool.name}</div>
                        <div className="text-sm text-gray-500 truncate">{tool.description}</div>
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
                <div className="p-8 text-center text-gray-500">
                  <i className="fas fa-search text-3xl mb-4"></i>
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

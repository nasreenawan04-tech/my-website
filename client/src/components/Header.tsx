
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useIsMobile } from '@/hooks/use-mobile';
import { searchTools } from '@/lib/search';
import { tools } from '@/data/tools';
import Logo from './Logo';
import { Menu, X, Search, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './ui/navigation-menu';

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
    { href: '/finance-tools', label: 'Finance Tools' },
    { href: '/text-tools', label: 'Text Tools' },
    { href: '/health-tools', label: 'Health Tools' },
    { href: '/recently-used-tools', label: 'Recently Used' }
  ];

  const toolsMenuItems = [
    { 
      category: 'Finance', 
      items: [
        { name: 'Loan Calculator', href: '/tools/loan-calculator' },
        { name: 'Mortgage Calculator', href: '/tools/mortgage-calculator' },
        { name: 'EMI Calculator', href: '/tools/emi-calculator' },
      ]
    },
    { 
      category: 'Text', 
      items: [
        { name: 'Word Counter', href: '/tools/word-counter' },
        { name: 'Case Converter', href: '/tools/case-converter' },
        { name: 'Password Generator', href: '/tools/password-generator' },
      ]
    },
    { 
      category: 'Health', 
      items: [
        { name: 'BMI Calculator', href: '/tools/bmi-calculator' },
        { name: 'Calorie Calculator', href: '/tools/calorie-calculator' },
        { name: 'BMR Calculator', href: '/tools/bmr-calculator' },
      ]
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-neutral-900/95 dark:supports-[backdrop-filter]:bg-neutral-900/80 transition-all duration-200" data-testid="header-main">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {/* Tools Dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-10 bg-transparent hover:bg-accent/50 data-[state=open]:bg-accent/50 text-neutral-700 dark:text-neutral-200 font-medium">
                    All Tools
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[800px] grid-cols-3">
                      {toolsMenuItems.map((category) => (
                        <div key={category.category}>
                          <h4 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100 border-b pb-2">
                            {category.category}
                          </h4>
                          <ul className="space-y-2">
                            {category.items.map((item) => (
                              <li key={item.href}>
                                <Link href={item.href}>
                                  <span className="block select-none rounded-md p-2 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                                    {item.name}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Regular Nav Links */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
              >
                <Button
                  variant="ghost"
                  className={`h-10 font-medium transition-colors ${
                    location === link.href 
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30' 
                      : 'text-neutral-700 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-accent/50'
                  }`}
                  data-testid={`link-${link.label.toLowerCase().replace(' ', '-')}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Search and Mobile Menu */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-accent/50"
              onClick={() => setIsSearchOpen(true)}
              data-testid="button-search"
              aria-label="Search tools"
              title="Search tools"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10 text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-accent/50"
              onClick={() => setIsMobileMenuOpen(true)}
              data-testid="button-mobile-menu"
              aria-label="Open mobile menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle className="text-left">Navigation</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col space-y-1 mt-6" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
              >
                <Button
                  variant="ghost"
                  className={`w-full justify-start h-12 font-medium text-base ${
                    location === link.href 
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30' 
                      : 'text-neutral-700 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  data-testid={`mobile-link-${link.label.toLowerCase().replace(' ', '-')}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            
            <div className="pt-4 mt-4 border-t">
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 px-3">QUICK ACCESS</p>
              <Link href="/all-tools">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 font-medium text-base text-neutral-700 dark:text-neutral-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  All Tools
                </Button>
              </Link>
              <Link href="/help-center">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 font-medium text-base text-neutral-700 dark:text-neutral-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Help Center
                </Button>
              </Link>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4" onClick={() => setIsSearchOpen(false)}>
          <div 
            className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-neutral-200 dark:border-neutral-700"
            role="dialog"
            aria-label="Search tools"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search for tools..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full py-4 pl-12 pr-12 text-base sm:text-lg border-2 border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                  autoFocus
                  data-testid="search-modal-input"
                  aria-label="Search for tools"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  data-testid="search-modal-close"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.slice(0, 10).map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.href)}
                    className="w-full p-4 sm:p-5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0 transition-colors group"
                    data-testid={`search-result-${tool.id}`}
                  >
                    <div className="flex items-center justify-between space-x-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {tool.name}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400 truncate mt-1">
                          {tool.description}
                        </div>
                      </div>
                      {tool.isPopular && (
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs px-3 py-1 rounded-full flex-shrink-0 font-medium">
                          Popular
                        </div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-12 text-center text-neutral-500 dark:text-neutral-400">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No tools found</p>
                  <p className="text-sm mt-1">Try searching with different keywords</p>
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

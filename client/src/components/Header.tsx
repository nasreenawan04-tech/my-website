
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useIsMobile } from '@/hooks/use-mobile';
import { searchTools } from '@/lib/search';
import { tools } from '@/data/tools';
import Logo from './Logo';
import { Menu, X, Search, ChevronDown } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  const toolCategories = [
    {
      title: 'Finance Tools',
      href: '/finance-tools',
      description: 'Calculate loans, investments, and financial planning',
      tools: [
        { name: 'Loan Calculator', href: '/loan-calculator' },
        { name: 'Mortgage Calculator', href: '/mortgage-calculator' },
        { name: 'EMI Calculator', href: '/emi-calculator' },
        { name: 'SIP Calculator', href: '/sip-calculator' },
      ]
    },
    {
      title: 'Text Tools',
      href: '/text-tools',
      description: 'Transform and analyze text content',
      tools: [
        { name: 'Case Converter', href: '/case-converter' },
        { name: 'Text Cleaner', href: '/text-cleaner-formatter' },
        { name: 'Word Counter', href: '/word-counter' },
        { name: 'Character Counter', href: '/character-counter' },
      ]
    },
    {
      title: 'Health Tools',
      href: '/health-tools',
      description: 'Track fitness, nutrition, and wellness',
      tools: [
        { name: 'BMI Calculator', href: '/bmi-calculator' },
        { name: 'Calorie Calculator', href: '/calorie-calculator' },
        { name: 'TDEE Calculator', href: '/tdee-calculator' },
        { name: 'Sleep Calculator', href: '/sleep-calculator' },
      ]
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-neutral-900/80" data-testid="header-main">
      <div className="max-w-7xl mx-auto">
        {/* Top Bar */}
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center">
            <Logo size="md" showText={true} />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <NavigationMenu>
              <NavigationMenuList>
                {toolCategories.map((category) => (
                  <NavigationMenuItem key={category.href}>
                    <NavigationMenuTrigger className="h-9 bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent/50">
                      {category.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[400px] p-4">
                        <Link href={category.href}>
                          <div className="mb-3 p-3 rounded-md hover:bg-accent transition-colors">
                            <h4 className="text-sm font-semibold text-foreground mb-1">
                              {category.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {category.description}
                            </p>
                          </div>
                        </Link>
                        <div className="grid gap-1">
                          {category.tools.map((tool) => (
                            <Link key={tool.href} href={tool.href}>
                              <div className="block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                                <div className="text-sm font-medium">{tool.name}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
                
                <NavigationMenuItem>
                  <Link href="/recently-used-tools">
                    <NavigationMenuLink className={cn(
                      "group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                      location === '/recently-used-tools' && 'bg-accent text-accent-foreground'
                    )}>
                      Recently Used
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setIsSearchOpen(true)}
              data-testid="button-search"
              aria-label="Search tools"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t" data-testid="mobile-menu">
            <nav className="px-4 py-4 space-y-3">
              {toolCategories.map((category) => (
                <div key={category.href} className="space-y-2">
                  <Link href={category.href}>
                    <div className="font-semibold text-sm text-foreground hover:text-primary transition-colors py-2">
                      {category.title}
                    </div>
                  </Link>
                  <div className="pl-4 space-y-2">
                    {category.tools.map((tool) => (
                      <Link key={tool.href} href={tool.href}>
                        <div 
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {tool.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <Link href="/recently-used-tools">
                <div 
                  className="font-semibold text-sm text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Recently Used
                </div>
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4">
          <div 
            className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[500px] overflow-hidden"
            role="dialog"
            aria-label="Search tools"
            aria-modal="true"
          >
            <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for tools..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full py-3 pl-12 pr-12 text-base border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  autoFocus
                  data-testid="search-modal-input"
                  aria-label="Search for tools"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                  data-testid="search-modal-close"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.slice(0, 10).map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.href)}
                    className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-neutral-800 border-b border-gray-100 dark:border-neutral-700 transition-colors"
                    data-testid={`search-result-${tool.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-neutral-100 truncate">{tool.name}</div>
                        <div className="text-sm text-gray-500 dark:text-neutral-400 truncate mt-1">{tool.description}</div>
                      </div>
                      {tool.isPopular && (
                        <div className="ml-3 bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded-full flex-shrink-0 font-medium">
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

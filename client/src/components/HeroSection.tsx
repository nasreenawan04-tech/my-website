import { useState } from 'react';
import { useLocation } from 'wouter';
import { searchTools } from '@/lib/search';
import { tools } from '@/data/tools';
import { Search } from 'lucide-react';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState(tools.slice(0, 8));
  const [, setLocation] = useLocation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      const results = searchTools(query);
      setSearchResults(results.slice(0, 8));
      setIsSearchOpen(true);
    } else {
      setSearchResults(tools.slice(0, 8));
      setIsSearchOpen(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/tools?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      setLocation('/tools');
    }
    setIsSearchOpen(false);
  };

  const handleToolClick = (toolHref: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setLocation(toolHref);
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setIsSearchOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding to allow clicks on results
    setTimeout(() => setIsSearchOpen(false), 200);
  };

  return (
    <section className="gradient-hero text-white py-20 lg:py-28" data-testid="hero-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="text-hero-title">
          Free Tools to Make Everything Simple
        </h1>
        <p className="text-xl lg:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed" data-testid="text-hero-subtitle">
          We offer finance, text, and health online tools to make your life easier. No sign-up required.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16 relative">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              placeholder="Search for tools..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className="w-full py-4 px-6 pr-16 text-lg text-neutral-800 bg-white rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
              data-testid="input-search-tools"
            />
            <button 
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              data-testid="button-search-tools"
            >
              <Search size={20} />
            </button>
          </form>

          {/* Search Results Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
              {searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.href)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      data-testid={`hero-search-result-${tool.id}`}
                    >
                      <div className="flex items-center justify-between">
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
                  ))}
                  
                  {searchQuery.trim() && (
                    <div className="px-4 py-3 border-t border-gray-200">
                      <button
                        onClick={handleSearch}
                        className="w-full text-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                        data-testid="hero-search-view-all"
                      >
                        View all results for "{searchQuery}" →
                      </button>
                    </div>
                  )}
                </div>
              ) : searchQuery.trim() ? (
                <div className="p-8 text-center text-gray-500">
                  <Search size={48} className="mx-auto mb-4" />
                  <p>No tools found matching "{searchQuery}"</p>
                  <button
                    onClick={() => setLocation('/tools')}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Browse all tools →
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center" data-testid="stat-active-users">
            <div className="text-3xl lg:text-4xl font-bold mb-2">1M+</div>
            <div className="text-blue-100 text-sm lg:text-base">Active Users</div>
          </div>
          <div className="text-center" data-testid="stat-tools-available">
            <div className="text-3xl lg:text-4xl font-bold mb-2">180+</div>
            <div className="text-blue-100 text-sm lg:text-base">Tools Available</div>
          </div>
          <div className="text-center" data-testid="stat-categories">
            <div className="text-3xl lg:text-4xl font-bold mb-2">3</div>
            <div className="text-blue-100 text-sm lg:text-base">Categories</div>
          </div>
          <div className="text-center" data-testid="stat-calculations-done">
            <div className="text-3xl lg:text-4xl font-bold mb-2">500K+</div>
            <div className="text-blue-100 text-sm lg:text-base">Calculations Done</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { tools } from '@/data/tools';
import { searchAndFilterTools } from '@/lib/search';

// Custom hook for debounced value
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const FinanceTools = () => {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Debounce search query to avoid excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const searchParam = urlParams.get('search') || '';
    setSearchQuery(searchParam);
  }, [location]);

  // Memoize filtered tools for better performance
  const filteredTools = useMemo(() => {
    setIsLoading(true);
    const filtered = searchAndFilterTools(debouncedSearchQuery, 'finance');
    setIsLoading(false);
    return filtered;
  }, [debouncedSearchQuery]);

  // Memoize popular finance tools from actual data
  const popularFinanceTools = useMemo(() => {
    return tools
      .filter(tool => tool.category === 'finance' && tool.isPopular)
      .slice(0, 4);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
    <>
      <Helmet>
        <title>Finance Tools - 30+ Free Financial Calculators | DapsiWow</title>
        <meta name="description" content="Free finance tools including loan calculator, mortgage calculator, currency converter, ROI calculator, and 25+ more financial calculators. No sign-up required." />
        <meta name="keywords" content="finance tools, loan calculator, mortgage calculator, currency converter, ROI calculator, financial calculators" />
        <meta property="og:title" content="Finance Tools - 30+ Free Financial Calculators | DapsiWow" />
        <meta property="og:description" content="Free finance tools including loan calculator, mortgage calculator, currency converter, and 25+ more financial calculators." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://dapsiwow.com/finance" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-finance-tools">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-700 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-calculator text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="text-page-title">
                Finance Tools
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                30+ free financial calculators and tools to help you make smart money decisions
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search finance tools..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full py-4 px-6 pr-16 text-lg text-neutral-800 bg-white rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                    data-testid="input-search-finance-tools"
                  />
                  <div className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl flex items-center">
                    <i className="fas fa-search"></i>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tools Section */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Results Info */}
              <div className="mb-8">
                <p className="text-neutral-600 text-center" data-testid="text-results-count">
                  Showing {filteredTools.length} finance tools
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center py-8" data-testid="loading-state">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}

              {/* Tools Grid */}
              {!isLoading && filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="grid-finance-tools">
                  {filteredTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              ) : !isLoading ? (
                <div className="text-center py-16" data-testid="empty-state-no-tools">
                  <i className="fas fa-search text-6xl text-neutral-300 mb-4"></i>
                  <h3 className="text-2xl font-bold text-neutral-600 mb-2">No finance tools found</h3>
                  <p className="text-neutral-500">
                    Try adjusting your search query.
                  </p>
                </div>
              ) : null}

              {/* Popular Tools Section - Dynamic from actual data */}
              {popularFinanceTools.length > 0 && (
                <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-neutral-800 mb-6 text-center">Popular Finance Tools</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {popularFinanceTools.map((tool) => (
                      <div 
                        key={tool.id}
                        className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => window.location.href = tool.href}
                        data-testid={`popular-tool-${tool.id}`}
                      >
                        <i className={`${tool.icon} text-2xl text-blue-600 mb-2`}></i>
                        <h3 className="font-semibold text-neutral-800 mb-1">{tool.name}</h3>
                        <p className="text-sm text-neutral-600 line-clamp-2">{tool.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default FinanceTools;
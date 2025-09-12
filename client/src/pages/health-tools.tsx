import { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { tools } from '@/data/tools';
import { searchAndFilterTools } from '@/lib/search';
import { useDebounce } from '@/hooks/use-debounce';

const HealthTools = () => {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debounce search query to avoid excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Derive loading state from debounce without causing re-renders
  const isLoading = searchQuery !== debouncedSearchQuery;

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const searchParam = urlParams.get('search') || '';
    setSearchQuery(searchParam);
  }, [location]);

  // Memoize filtered tools for better performance
  const filteredTools = useMemo(() => {
    return searchAndFilterTools(debouncedSearchQuery, 'health');
  }, [debouncedSearchQuery]);

  // Memoize popular health tools from actual data
  const popularHealthTools = useMemo(() => {
    return tools
      .filter(tool => tool.category === 'health' && tool.isPopular)
      .slice(0, 4);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
    <>
      <Helmet>
        <title>Health Tools - 30+ Free Health & Fitness Calculators | ToolsHub</title>
        <meta name="description" content="Free health tools including BMI calculator, calorie calculator, pregnancy calculator, and 25+ more health and fitness calculators. No sign-up required." />
        <meta name="keywords" content="health tools, BMI calculator, calorie calculator, pregnancy calculator, fitness tools, health calculators" />
        <meta property="og:title" content="Health Tools - 30+ Free Health & Fitness Calculators | ToolsHub" />
        <meta property="og:description" content="Free health tools including BMI calculator, calorie calculator, pregnancy calculator, and 25+ more health and fitness calculators." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/health" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-health-tools">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-pink-600 via-rose-500 to-red-700 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-heartbeat text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="text-page-title">
                Health Tools
              </h1>
              <p className="text-xl text-pink-100 mb-8 max-w-3xl mx-auto">
                30+ free health and fitness tools to track, calculate, and improve your wellbeing
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search health tools..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full py-4 px-6 pr-16 text-lg text-neutral-800 bg-white rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-200 transition-all duration-200"
                    data-testid="input-search-health-tools"
                  />
                  <div className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl flex items-center">
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
                  Showing {filteredTools.length} health tools
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center py-8" data-testid="loading-state">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                </div>
              )}

              {/* Tools Grid */}
              {!isLoading && filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="grid-health-tools">
                  {filteredTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              ) : !isLoading ? (
                <div className="text-center py-16" data-testid="empty-state-no-tools">
                  <i className="fas fa-search text-6xl text-neutral-300 mb-4"></i>
                  <h3 className="text-2xl font-bold text-neutral-600 mb-2">No health tools found</h3>
                  <p className="text-neutral-500">
                    Try adjusting your search query.
                  </p>
                </div>
              ) : null}

              {/* Popular Tools Section - Dynamic from actual data */}
              {popularHealthTools.length > 0 && (
                <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-neutral-800 mb-6 text-center">Popular Health Tools</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {popularHealthTools.map((tool) => (
                      <div 
                        key={tool.id}
                        className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setLocation(tool.href)}
                        data-testid={`popular-tool-${tool.id}`}
                      >
                        <i className={`${tool.icon} text-2xl text-pink-600 mb-2`}></i>
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

export default HealthTools;
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { tools, categories } from '@/data/tools';
import { searchAndFilterTools } from '@/lib/search';
import { Search, Calculator, FileText, Heart, Zap, Users, Target, TrendingUp } from 'lucide-react';

const AllTools = () => {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredTools, setFilteredTools] = useState(tools);

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search') || '';
    const categoryParam = urlParams.get('category') || 'all';
    
    setSearchQuery(searchParam);
    setSelectedCategory(categoryParam);
  }, [location]);

  // Filter tools based on search and category
  useEffect(() => {
    const filtered = searchAndFilterTools(searchQuery, selectedCategory);
    setFilteredTools(filtered);
  }, [searchQuery, selectedCategory]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    updateURL(query, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateURL(searchQuery, category);
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateURL(searchQuery, selectedCategory);
  };

  const updateURL = (search: string, category: string) => {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set('search', search.trim());
    }
    params.set('category', category);
    const newURL = `/tools${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newURL);
  };

  const categoryTabs = [
    { key: 'all', label: 'All Tools', count: tools.length },
    { key: 'finance', label: 'Finance', count: tools.filter(t => t.category === 'finance').length },
    { key: 'text', label: 'Text', count: tools.filter(t => t.category === 'text').length },
    { key: 'health', label: 'Health', count: tools.filter(t => t.category === 'health').length }
  ];

  const quickCategories = [
    { 
      key: 'finance', 
      label: 'Finance Tools', 
      icon: Calculator, 
      color: 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      textColor: 'text-blue-600 dark:text-blue-400',
      count: tools.filter(t => t.category === 'finance').length
    },
    { 
      key: 'text', 
      label: 'Text Tools', 
      icon: FileText, 
      color: 'from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30', 
      textColor: 'text-purple-600 dark:text-purple-400',
      count: tools.filter(t => t.category === 'text').length
    },
    { 
      key: 'health', 
      label: 'Health Tools', 
      icon: Heart, 
      color: 'from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700',
      bgColor: 'bg-pink-50 dark:bg-pink-950/30',
      textColor: 'text-pink-600 dark:text-pink-400',
      count: tools.filter(t => t.category === 'health').length
    }
  ];

  return (
    <>
      <Helmet>
        <title>DapsiWow Tools Directory - 150+ Free Online Tools | Finance, Text, Health</title>
        <meta name="description" content="Browse all 150+ professional-grade free online tools including Finance Calculators, Text Analyzers, Health Trackers, and Productivity Tools. No registration required." />
        <meta name="keywords" content="online tools directory, free tools, calculator tools, text tools, finance tools, health tools" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="/tools" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-all-tools">
        <Header />
        
        <main className="flex-1 bg-neutral-50 dark:bg-neutral-900">
          {/* Modern Hero Section */}
          <section className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 dark:from-blue-700 dark:via-blue-600 dark:to-purple-700 text-white py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden" aria-label="Page header">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 dark:from-blue-900/30 to-transparent" aria-hidden="true" />
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Main Content */}
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                {/* Icon Badge */}
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl mb-4 sm:mb-5 md:mb-6">
                  <Zap className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-5 md:mb-6 leading-tight px-2" data-testid="text-page-title">
                  Complete Tools Directory
                </h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 mb-6 sm:mb-7 md:mb-8 max-w-4xl mx-auto leading-relaxed px-2">
                  Access our complete collection of 150+ professional-grade tools. Everything you need for finance, text processing, and health calculations in one place.
                </p>

                {/* Trust Indicators */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-2xl lg:max-w-4xl mx-auto mb-8 sm:mb-10 md:mb-12 px-2">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold mb-1">{tools.length}+</div>
                    <div className="text-blue-100 text-xs sm:text-sm">Free Tools</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold mb-1">1M+</div>
                    <div className="text-blue-100 text-xs sm:text-sm">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold mb-1">24/7</div>
                    <div className="text-blue-100 text-xs sm:text-sm">Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold mb-1">100%</div>
                    <div className="text-blue-100 text-xs sm:text-sm">Free</div>
                  </div>
                </div>
                
                {/* Enhanced Search Bar - Pill Shaped with Button */}
                <div className="max-w-3xl mx-auto px-2 sm:px-0">
                  <form onSubmit={handleSearch} className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Search through 150+ tools..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full py-3.5 pl-6 pr-14 sm:py-4 sm:pl-8 sm:pr-16 md:py-5 md:pl-10 md:pr-20 text-sm sm:text-base md:text-lg text-neutral-800 bg-gray-50 hover:bg-white focus:bg-white rounded-full shadow-md hover:shadow-lg focus:outline-none focus:shadow-xl transition-all duration-200 ease-in-out border border-transparent focus:border-transparent placeholder:text-gray-500"
                      data-testid="input-search-all-tools"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 sm:right-2 md:right-2.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full px-5 py-2.5 sm:px-6 sm:py-3 md:px-7 md:py-3.5 transition-all duration-200 z-10 cursor-pointer shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
                      data-testid="button-search-all-tools"
                    >
                      <Search className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5" strokeWidth={2.5} />
                    </button>
                  </form>
                </div>

                
              </div>
            </div>
          </section>

          {/* Tools Section */}
          <section className="py-20" aria-label="Tools grid">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Category Filters */}
              <div className="mb-16">
                <h2 className="sr-only">Filter tools by category</h2>
                <div className="flex flex-wrap gap-3 sm:gap-4 justify-center px-2" role="group" aria-label="Category filters">
                  {categoryTabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => handleCategoryChange(tab.key)}
                      className={`px-4 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-200 text-sm sm:text-base whitespace-nowrap ${
                        selectedCategory === tab.key
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white shadow-lg hover:shadow-xl scale-105'
                          : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 shadow-md hover:shadow-lg border border-neutral-200 dark:border-neutral-700'
                      }`}
                      data-testid={`button-filter-${tab.key}`}
                      aria-label={`Filter by ${tab.label}`}
                      aria-pressed={selectedCategory === tab.key}
                    >
                      <span className="hidden sm:inline">{tab.label} ({tab.count})</span>
                      <span className="sm:hidden">{tab.label.split(' ')[0]} ({tab.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Info */}
              <div className="mb-10">
                <p className="text-neutral-700 dark:text-neutral-300 text-center text-lg font-medium" data-testid="text-results-count" role="status" aria-live="polite">
                  Showing {filteredTools.length} tools{selectedCategory !== 'all' && ` in ${categories[selectedCategory as keyof typeof categories]} category`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>

              {/* Tools Grid */}
              {filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10" data-testid="grid-all-tools" role="list">
                  {filteredTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20" data-testid="empty-state-no-tools" role="status">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-6">
                    <Search className="w-12 h-12 text-neutral-400 dark:text-neutral-500" aria-hidden="true" />
                  </div>
                  <h3 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">No tools found</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-md mx-auto">
                    Try adjusting your search query or selecting a different category.
                  </p>
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

export default AllTools;

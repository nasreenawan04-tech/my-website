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
    if (category !== 'all') {
      params.set('category', category);
    }
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
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      count: tools.filter(t => t.category === 'finance').length
    },
    { 
      key: 'text', 
      label: 'Text Tools', 
      icon: FileText, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50', 
      textColor: 'text-purple-600',
      count: tools.filter(t => t.category === 'text').length
    },
    { 
      key: 'health', 
      label: 'Health Tools', 
      icon: Heart, 
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      count: tools.filter(t => t.category === 'health').length
    }
  ];

  return (
    <>
      <Helmet>
        <title>DapsiWow Tools Directory - 150+ Free Online Tools | Finance, Text, Health</title>
        <meta name="description" content="Browse all 150+ professional-grade free online tools including Finance Calculators, Text Analyzers, Health Trackers, and Productivity Tools. No registration required." />
        <meta name="keywords" content="online tools directory, free tools, calculator tools, text tools, finance tools, health tools" />
        <link rel="canonical" href="/tools" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-all-tools">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Modern Hero Section */}
          <section className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 text-white py-20 lg:py-24 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent" />
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Main Content */}
              <div className="text-center mb-12">
                {/* Icon Badge */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="text-page-title">
                  Complete Tools Directory
                </h1>
                <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
                  Access our complete collection of 150+ professional-grade tools. Everything you need for finance, text processing, and health calculations in one place.
                </p>

                {/* Trust Indicators */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 max-w-2xl lg:max-w-4xl mx-auto mb-12">
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold mb-1">{tools.length}+</div>
                    <div className="text-blue-100 text-sm">Free Tools</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold mb-1">1M+</div>
                    <div className="text-blue-100 text-sm">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold mb-1">24/7</div>
                    <div className="text-blue-100 text-sm">Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold mb-1">100%</div>
                    <div className="text-blue-100 text-sm">Free</div>
                  </div>
                </div>
                
                {/* Enhanced Search Bar */}
                <div className="max-w-3xl mx-auto mb-12">
                  <div className="relative group">
                    <form onSubmit={handleSearch} className="relative">
                      <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
                        <Search size={22} />
                      </div>
                      <input
                        type="text"
                        placeholder="Search through 150+ tools... (e.g., calculator, BMI, converter)"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full py-5 pl-14 pr-32 text-lg text-neutral-800 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-white/30 focus:outline-none focus:ring-4 focus:ring-white/40 focus:border-white/50 focus:bg-white focus:shadow-3xl transition-all duration-300 placeholder:text-gray-400"
                        data-testid="input-search-all-tools"
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                        data-testid="button-search-all-tools"
                      >
                        <span className="text-sm font-medium hidden sm:inline">Search</span>
                        <Search size={18} className="sm:hidden" />
                      </button>
                    </form>
                    
                    {/* Search Enhancement Features */}
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-blue-100">
                      <span className="opacity-75">Popular searches:</span>
                      <button 
                        onClick={() => {
                          setSearchQuery('calculator'); 
                          updateURL('calculator', selectedCategory);
                        }}
                        className="px-3 py-1 bg-white/20 rounded-full hover:bg-white/30 transition-all duration-200 cursor-pointer"
                      >
                        Calculator
                      </button>
                      <button 
                        onClick={() => {
                          setSearchQuery('BMI'); 
                          updateURL('BMI', selectedCategory);
                        }}
                        className="px-3 py-1 bg-white/20 rounded-full hover:bg-white/30 transition-all duration-200 cursor-pointer"
                      >
                        BMI
                      </button>
                      <button 
                        onClick={() => {
                          setSearchQuery('converter'); 
                          updateURL('converter', selectedCategory);
                        }}
                        className="px-3 py-1 bg-white/20 rounded-full hover:bg-white/30 transition-all duration-200 cursor-pointer"
                      >
                        Converter
                      </button>
                      <button 
                        onClick={() => {
                          setSearchQuery('generator'); 
                          updateURL('generator', selectedCategory);
                        }}
                        className="px-3 py-1 bg-white/20 rounded-full hover:bg-white/30 transition-all duration-200 cursor-pointer"
                      >
                        Generator
                      </button>
                    </div>
                    
                    {/* Search Tips */}
                    {searchQuery.length === 0 && (
                      <div className="mt-3 text-center text-blue-100/80 text-sm">
                        💡 Try searching by category (finance, health, text) or function (calculate, convert, generate)
                      </div>
                    )}
                  </div>
                </div>

                
              </div>
            </div>
          </section>

          {/* Tools Section */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Category Filters */}
              <div className="mb-12">
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center px-2">
                  {categoryTabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => handleCategoryChange(tab.key)}
                      className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base whitespace-nowrap ${
                        selectedCategory === tab.key
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                          : 'bg-white text-neutral-600 hover:bg-neutral-50 shadow-sm border border-neutral-200'
                      }`}
                      data-testid={`button-filter-${tab.key}`}
                    >
                      <span className="hidden sm:inline">{tab.label} ({tab.count})</span>
                      <span className="sm:hidden">{tab.label.split(' ')[0]} ({tab.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Info */}
              <div className="mb-8">
                <p className="text-neutral-600 text-center" data-testid="text-results-count">
                  Showing {filteredTools.length} tools
                  {selectedCategory !== 'all' && ` in ${categories[selectedCategory as keyof typeof categories]} category`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>

              {/* Tools Grid */}
              {filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="grid-all-tools">
                  {filteredTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16" data-testid="empty-state-no-tools">
                  <i className="fas fa-search text-6xl text-neutral-300 mb-4"></i>
                  <h3 className="text-2xl font-bold text-neutral-600 mb-2">No tools found</h3>
                  <p className="text-neutral-500">
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

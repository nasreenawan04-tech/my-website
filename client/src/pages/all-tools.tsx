import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { tools, categories } from '@/data/tools';
import { searchAndFilterTools } from '@/lib/search';
import { 
  Search, 
  Calculator, 
  FileText, 
  Heart, 
  Zap, 
  SlidersHorizontal,
  Grid3x3,
  List,
  Star,
  TrendingUp,
  ArrowUpDown,
  Filter,
  X,
  BarChart3,
  Sparkles,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type SortOption = 'name-asc' | 'name-desc' | 'popular' | 'category';
type ViewMode = 'grid' | 'list';

const AllTools = () => {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('finance');
  const [filteredTools, setFilteredTools] = useState(tools);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showOnlyPopular, setShowOnlyPopular] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search') || '';
    const categoryParam = urlParams.get('category') || 'finance';
    const sortParam = urlParams.get('sort') as SortOption || 'popular';
    const viewParam = urlParams.get('view') as ViewMode || 'grid';
    
    setSearchQuery(searchParam);
    setSelectedCategory(categoryParam);
    setSortBy(sortParam);
    setViewMode(viewParam);
  }, [location]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTools = tools.length;
    const popularTools = tools.filter(t => t.isPopular).length;
    const financeTools = tools.filter(t => t.category === 'finance').length;
    const textTools = tools.filter(t => t.category === 'text').length;
    const healthTools = tools.filter(t => t.category === 'health').length;
    
    return {
      total: totalTools,
      popular: popularTools,
      finance: financeTools,
      text: textTools,
      health: healthTools
    };
  }, []);

  // Filter and sort tools
  useEffect(() => {
    let filtered = searchAndFilterTools(searchQuery, selectedCategory);
    
    // Apply popular filter
    if (showOnlyPopular) {
      filtered = filtered.filter(tool => tool.isPopular);
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'popular':
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    
    setFilteredTools(sorted);
  }, [searchQuery, selectedCategory, sortBy, showOnlyPopular]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    updateURL(query, selectedCategory, sortBy, viewMode);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateURL(searchQuery, category, sortBy, viewMode);
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateURL(searchQuery, selectedCategory, sortBy, viewMode);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    updateURL(searchQuery, selectedCategory, value, viewMode);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    updateURL(searchQuery, selectedCategory, sortBy, mode);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('finance');
    setShowOnlyPopular(false);
    setSortBy('popular');
    updateURL('', 'finance', 'popular', viewMode);
  };

  const updateURL = (search: string, category: string, sort: SortOption, view: ViewMode) => {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set('search', search.trim());
    }
    params.set('category', category);
    params.set('sort', sort);
    params.set('view', view);
    const newURL = `/tools${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newURL);
  };

  const categoryTabs = [
    { key: 'finance', label: 'Finance', count: stats.finance, icon: Calculator },
    { key: 'text', label: 'Text', count: stats.text, icon: FileText },
    { key: 'health', label: 'Health', count: stats.health, icon: Heart }
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular', icon: Star },
    { value: 'name-asc', label: 'A to Z', icon: ArrowUpDown },
    { value: 'name-desc', label: 'Z to A', icon: ArrowUpDown },
    { value: 'category', label: 'By Category', icon: Filter }
  ];

  const activeFiltersCount = (searchQuery ? 1 : 0) + (showOnlyPopular ? 1 : 0);

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
        
        <main className="flex-1 bg-neutral-50">
          {/* Modern Hero Section */}
          <section className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 text-white py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent" />
            
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
                  Access our complete collection of {stats.total}+ professional-grade tools. Everything you need for finance, text processing, and health calculations in one place.
                </p>

                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-2xl lg:max-w-4xl mx-auto mb-8 sm:mb-10 md:mb-12 px-2">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4 hover:bg-white/20 transition-all duration-200">
                    <div className="flex flex-col items-center">
                      <BarChart3 className="w-6 h-6 mb-2 text-white" />
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">{stats.total}+</div>
                      <div className="text-blue-100 text-xs sm:text-sm">Free Tools</div>
                    </div>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4 hover:bg-white/20 transition-all duration-200">
                    <div className="flex flex-col items-center">
                      <Star className="w-6 h-6 mb-2 text-yellow-300" />
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">{stats.popular}+</div>
                      <div className="text-blue-100 text-xs sm:text-sm">Popular</div>
                    </div>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4 hover:bg-white/20 transition-all duration-200">
                    <div className="flex flex-col items-center">
                      <Clock className="w-6 h-6 mb-2 text-white" />
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">24/7</div>
                      <div className="text-blue-100 text-xs sm:text-sm">Available</div>
                    </div>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4 hover:bg-white/20 transition-all duration-200">
                    <div className="flex flex-col items-center">
                      <CheckCircle2 className="w-6 h-6 mb-2 text-green-300" />
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">100%</div>
                      <div className="text-blue-100 text-xs sm:text-sm">Free</div>
                    </div>
                  </Card>
                </div>
                
                {/* Enhanced Search Bar */}
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
          <section className="py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Category Filters */}
              <div className="mb-8">
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center px-2">
                  {categoryTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => handleCategoryChange(tab.key)}
                        className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base whitespace-nowrap flex items-center gap-2 ${
                          selectedCategory === tab.key
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                            : 'bg-white text-neutral-600 hover:bg-neutral-50 shadow-sm border border-neutral-200'
                        }`}
                        data-testid={`button-filter-${tab.key}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label} ({tab.count})</span>
                        <span className="sm:hidden">{tab.label.split(' ')[0]} ({tab.count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advanced Filters and Controls */}
              <Card className="mb-8 p-4 sm:p-6 bg-white shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left side - Controls */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <SlidersHorizontal className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                      <Select value={sortBy} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-sort">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          {sortOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewModeChange('grid')}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          viewMode === 'grid'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'
                        }`}
                        title="Grid view"
                        data-testid="button-view-grid"
                      >
                        <Grid3x3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleViewModeChange('list')}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          viewMode === 'list'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'
                        }`}
                        title="List view"
                        data-testid="button-view-list"
                      >
                        <List className="w-5 h-5" />
                      </button>
                    </div>

                    <Separator orientation="vertical" className="hidden sm:block h-8" />

                    {/* Popular Filter Toggle */}
                    <button
                      onClick={() => setShowOnlyPopular(!showOnlyPopular)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                        showOnlyPopular
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                      data-testid="button-filter-popular"
                    >
                      <Star className={`w-4 h-4 ${showOnlyPopular ? 'fill-yellow-500' : ''}`} />
                      Popular Only
                    </button>
                  </div>

                  {/* Right side - Results and Clear */}
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-neutral-600" data-testid="text-results-count">
                      <span className="font-semibold text-neutral-900">{filteredTools.length}</span> tools found
                    </div>
                    
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-neutral-600 hover:text-neutral-900"
                        data-testid="button-clear-filters"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Clear {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Active Search Badge */}
                {searchQuery && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-neutral-600">Searching for:</span>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        "{searchQuery}"
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            updateURL('', selectedCategory, sortBy, viewMode);
                          }}
                          className="ml-1 hover:bg-neutral-300 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    </div>
                  </div>
                )}
              </Card>

              {/* Tools Grid/List */}
              {filteredTools.length > 0 ? (
                <div 
                  className={
                    viewMode === 'grid'
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                      : "flex flex-col gap-4"
                  } 
                  data-testid="grid-all-tools"
                >
                  {filteredTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} variant={viewMode === 'list' ? 'horizontal' : 'default'} />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-16" data-testid="empty-state-no-tools">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-700 mb-2">No tools found</h3>
                    <p className="text-neutral-500 mb-6 max-w-md">
                      We couldn't find any tools matching your criteria. Try adjusting your search query or filters.
                    </p>
                    <Button onClick={clearFilters} data-testid="button-clear-all">
                      Clear all filters
                    </Button>
                  </div>
                </Card>
              )}

              {/* Quick Stats Summary */}
              {filteredTools.length > 0 && (
                <Card className="mt-12 p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-1">Browse by Category</h3>
                      <p className="text-sm text-neutral-600 mb-3">
                        Explore our complete collection organized by category
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-white">
                          <Calculator className="w-3 h-3 mr-1" />
                          Finance: {stats.finance} tools
                        </Badge>
                        <Badge variant="outline" className="bg-white">
                          <FileText className="w-3 h-3 mr-1" />
                          Text: {stats.text} tools
                        </Badge>
                        <Badge variant="outline" className="bg-white">
                          <Heart className="w-3 h-3 mr-1" />
                          Health: {stats.health} tools
                        </Badge>
                        <Badge variant="outline" className="bg-white">
                          <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                          Popular: {stats.popular} tools
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
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

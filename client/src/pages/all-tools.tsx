import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { tools, categories } from '@/data/tools';
import { searchAndFilterTools } from '@/lib/search';

const AllTools = () => {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredTools, setFilteredTools] = useState(tools);

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
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
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const categoryTabs = [
    { key: 'all', label: 'All Tools', count: tools.length },
    { key: 'finance', label: 'Finance', count: tools.filter(t => t.category === 'finance').length },
    { key: 'pdf', label: 'PDF', count: tools.filter(t => t.category === 'pdf').length },
    { key: 'text', label: 'Text', count: tools.filter(t => t.category === 'text').length },
    { key: 'health', label: 'Health', count: tools.filter(t => t.category === 'health').length }
  ];

  return (
    <>
      <Helmet>
        <title>All Tools - 150+ Free Online Tools | ToolsHub</title>
        <meta name="description" content="Browse all 150+ free online tools including Finance Calculators, PDF Tools, Image Editors, Text Tools, and Health Calculators." />
        <meta name="keywords" content="online tools directory, free tools, PDF converter, image editor, calculator tools" />
        <link rel="canonical" href="/tools" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-all-tools">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="text-page-title">
                All Tools Directory
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Discover all 150+ free online tools to boost your productivity
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search tools..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full py-4 px-6 pr-16 text-lg text-neutral-800 bg-white rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                    data-testid="input-search-all-tools"
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
              {/* Category Filters */}
              <div className="mb-12">
                <div className="flex flex-wrap gap-3 justify-center">
                  {categoryTabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => handleCategoryChange(tab.key)}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        selectedCategory === tab.key
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                          : 'bg-white text-neutral-600 hover:bg-neutral-50 shadow-sm border border-neutral-200'
                      }`}
                      data-testid={`button-filter-${tab.key}`}
                    >
                      {tab.label} ({tab.count})
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

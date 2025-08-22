import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { tools } from '@/data/tools';
import { searchAndFilterTools } from '@/lib/search';

const SEOTools = () => {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTools, setFilteredTools] = useState(tools.filter(tool => tool.category === 'seo'));

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const searchParam = urlParams.get('search') || '';
    setSearchQuery(searchParam);
  }, [location]);

  // Filter tools based on search
  useEffect(() => {
    const filtered = searchAndFilterTools(searchQuery, 'seo');
    setFilteredTools(filtered);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      <Helmet>
        <title>SEO Tools - 30+ Free SEO Analyzers & Utilities | ToolsHub</title>
        <meta name="description" content="Free SEO tools including backlink checker, keyword density analyzer, meta tag generator, and 25+ more SEO utilities. No sign-up required." />
        <meta name="keywords" content="SEO tools, backlink checker, keyword analyzer, meta tag generator, domain checker, SEO utilities" />
        <meta property="og:title" content="SEO Tools - 30+ Free SEO Analyzers & Utilities | ToolsHub" />
        <meta property="og:description" content="Free SEO tools including backlink checker, keyword density analyzer, meta tag generator, and 25+ more SEO utilities." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/seo" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-seo-tools">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-700 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-chart-line text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="text-page-title">
                SEO Tools
              </h1>
              <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
                30+ free SEO tools to analyze, optimize, and improve your website's search rankings
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search SEO tools..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full py-4 px-6 pr-16 text-lg text-neutral-800 bg-white rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-200"
                    data-testid="input-search-seo-tools"
                  />
                  <div className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl flex items-center">
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
                  Showing {filteredTools.length} SEO tools
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>

              {/* Tools Grid */}
              {filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="grid-seo-tools">
                  {filteredTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16" data-testid="empty-state-no-tools">
                  <i className="fas fa-search text-6xl text-neutral-300 mb-4"></i>
                  <h3 className="text-2xl font-bold text-neutral-600 mb-2">No SEO tools found</h3>
                  <p className="text-neutral-500">
                    Try adjusting your search query.
                  </p>
                </div>
              )}

              {/* Popular Tools Section */}
              <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-6 text-center">Popular SEO Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <i className="fas fa-link text-2xl text-purple-600 mb-2"></i>
                    <h3 className="font-semibold text-neutral-800">Backlink Checker</h3>
                    <p className="text-sm text-neutral-600">Analyze backlinks</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <i className="fas fa-key text-2xl text-blue-600 mb-2"></i>
                    <h3 className="font-semibold text-neutral-800">Keyword Density</h3>
                    <p className="text-sm text-neutral-600">Check keyword density</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <i className="fas fa-tags text-2xl text-green-600 mb-2"></i>
                    <h3 className="font-semibold text-neutral-800">Meta Tag Generator</h3>
                    <p className="text-sm text-neutral-600">Generate meta tags</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <i className="fas fa-globe text-2xl text-orange-600 mb-2"></i>
                    <h3 className="font-semibold text-neutral-800">Domain Checker</h3>
                    <p className="text-sm text-neutral-600">Check domain info</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default SEOTools;
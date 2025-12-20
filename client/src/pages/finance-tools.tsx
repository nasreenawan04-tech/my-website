import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'wouter';
import { Calculator, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { tools } from '@/data/tools';
import { searchAndFilterTools } from '@/lib/search';

const FinanceTools = () => {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTools, setFilteredTools] = useState(tools.filter(tool => tool.category === 'finance'));

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const searchParam = urlParams.get('search') || '';
    setSearchQuery(searchParam);
  }, [location]);

  // Filter tools based on search
  useEffect(() => {
    const filtered = searchAndFilterTools(searchQuery, 'finance');
    setFilteredTools(filtered);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Animated floating shapes data
  const floatingShapes = [
    { size: 80, top: '10%', left: '5%', delay: 0, duration: 20, rotate: 360 },
    { size: 60, top: '20%', right: '8%', delay: 2, duration: 25, rotate: -360 },
    { size: 100, bottom: '15%', left: '10%', delay: 1, duration: 30, rotate: 180 },
    { size: 40, top: '60%', right: '15%', delay: 3, duration: 22, rotate: -180 },
    { size: 70, top: '40%', left: '15%', delay: 1.5, duration: 28, rotate: 360 },
    { size: 50, bottom: '25%', right: '10%', delay: 2.5, duration: 26, rotate: -360 },
    { size: 90, top: '15%', left: '45%', delay: 0.5, duration: 24, rotate: 180 },
    { size: 55, bottom: '30%', left: '40%', delay: 1.8, duration: 27, rotate: -180 },
  ];

  // Cache random dot positions to prevent re-generation on every render
  const animatedDots = useMemo(() => 
    [...Array(12)].map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
    })),
    []
  );

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>Finance Tools - Free Financial Calculators | DapsiWow</title>
        <meta name="description" content="Access 29+ free financial calculators including loan, mortgage, tax, and investment tools. Make informed money decisions with instant, accurate results." />
        <meta name="keywords" content="finance tools, loan calculator, mortgage calculator, tax calculator, financial calculators, budget tools, investment calculator" />
        <link rel="canonical" href="https://dapsiwow.com/finance-tools" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <meta name="publisher" content="DapsiWow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/finance-tools" />
        <meta property="og:title" content="Finance Tools - Free Financial Calculators | DapsiWow" />
        <meta property="og:description" content="Access 29+ free financial calculators including loan, mortgage, tax, and investment tools. Make informed money decisions with instant results." />
        <meta property="og:image" content="https://dapsiwow.com/images/finance-tools-og.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="DapsiWow Finance Tools - Free Financial Calculators" />
        <meta property="og:site_name" content="DapsiWow" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://dapsiwow.com/finance-tools" />
        <meta name="twitter:title" content="Finance Tools - Free Financial Calculators | DapsiWow" />
        <meta name="twitter:description" content="Access 30+ free financial calculators for loans, mortgages, taxes, investments and more. Instant results, no registration required." />
        <meta name="twitter:image" content="https://dapsiwow.com/images/finance-tools-og.jpg" />
        <meta name="twitter:image:alt" content="DapsiWow Finance Tools Collection" />
        
        {/* Additional Meta Tags */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="application-name" content="DapsiWow Finance Tools" />
        <meta httpEquiv="content-language" content="en-US" />
        
        {/* Schema.org Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                "@id": "https://dapsiwow.com/finance-tools",
                "url": "https://dapsiwow.com/finance-tools",
                "name": "Finance Tools - Free Financial Calculators",
                "description": "Access 29+ free financial calculators including loan, mortgage, tax, and investment tools. Make informed money decisions with instant, accurate results.",
                "inLanguage": "en-US",
                "isPartOf": {
                  "@id": "https://dapsiwow.com/#website"
                },
                "breadcrumb": {
                  "@id": "https://dapsiwow.com/finance-tools#breadcrumb"
                },
                "mainEntity": {
                  "@id": "https://dapsiwow.com/finance-tools#collection"
                }
              },
              {
                "@type": "CollectionPage",
                "@id": "https://dapsiwow.com/finance-tools#collection",
                "name": "Finance Tools Collection",
                "description": "Comprehensive collection of 29+ free financial calculators and planning tools",
                "url": "https://dapsiwow.com/finance-tools",
                "numberOfItems": 29,
                "itemListElement": [
                  {
                    "@type": "SoftwareApplication",
                    "name": "Loan Calculator",
                    "url": "https://dapsiwow.com/tools/loan-calculator",
                    "description": "Calculate monthly loan payments with amortization schedule",
                    "applicationCategory": "FinanceApplication",
                    "offers": {
                      "@type": "Offer",
                      "price": "0",
                      "priceCurrency": "USD"
                    }
                  },
                  {
                    "@type": "SoftwareApplication",
                    "name": "Mortgage Calculator",
                    "url": "https://dapsiwow.com/tools/mortgage-calculator",
                    "description": "Calculate mortgage payments with taxes and insurance",
                    "applicationCategory": "FinanceApplication",
                    "offers": {
                      "@type": "Offer",
                      "price": "0",
                      "priceCurrency": "USD"
                    }
                  }
                ]
              },
              {
                "@type": "BreadcrumbList",
                "@id": "https://dapsiwow.com/finance-tools#breadcrumb",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://dapsiwow.com"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Finance Tools",
                    "item": "https://dapsiwow.com/finance-tools"
                  }
                ]
              },
              {
                "@type": "Organization",
                "@id": "https://dapsiwow.com/#organization",
                "name": "DapsiWow",
                "url": "https://dapsiwow.com",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://dapsiwow.com/images/logo.png"
                },
                "sameAs": [
                  "https://facebook.com/dapsiwow",
                  "https://twitter.com/dapsiwow",
                  "https://linkedin.com/company/dapsiwow"
                ]
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-finance-tools">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-700 text-white py-16 relative overflow-hidden">
            {/* Animated Background Shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {floatingShapes.map((shape, index) => (
                <motion.div
                  key={index}
                  className="absolute rounded-full bg-white/5 backdrop-blur-sm"
                  style={{
                    width: shape.size,
                    height: shape.size,
                    top: shape.top,
                    bottom: shape.bottom,
                    left: shape.left,
                    right: shape.right,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    x: [0, 15, 0],
                    rotate: [0, shape.rotate],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: shape.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: shape.delay,
                  }}
                />
              ))}
              
              {/* Additional decorative circles */}
              <motion.div
                className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-400/10 blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-gradient-to-br from-indigo-400/10 to-purple-400/10 blur-xl"
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              />
              
              {/* Animated dots */}
              {animatedDots.map((dot) => (
                <motion.div
                  key={`dot-${dot.id}`}
                  className="absolute w-2 h-2 rounded-full bg-white/20"
                  style={{
                    top: `${dot.top}%`,
                    left: `${dot.left}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.2, 0.8, 0.2],
                  }}
                  transition={{
                    duration: dot.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: dot.delay,
                  }}
                />
              ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <motion.div 
                className="w-24 h-24 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Calculator className="w-12 h-12 text-white" />
              </motion.div>
              <motion.h1 
                className="text-4xl sm:text-5xl font-bold mb-4"
                data-testid="finance-page-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              >
                Finance Tools
              </motion.h1>
              <motion.p 
                className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              >
                29+ free financial calculators and tools to help you make smart money decisions
              </motion.p>
              
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
                  <div className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl flex items-center pointer-events-none">
                    <Search className="w-5 h-5" aria-hidden="true" />
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
                <p className="text-neutral-600 text-center" data-testid="finance-results-count">
                  Showing {filteredTools.length} finance tools
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>

              {/* Tools Grid */}
              {filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8" data-testid="grid-finance-tools">
                  {filteredTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16" data-testid="empty-state-no-tools">
                  <i className="fas fa-search text-6xl text-neutral-300 mb-4"></i>
                  <h3 className="text-2xl font-bold text-neutral-600 mb-2">No finance tools found</h3>
                  <p className="text-neutral-500">
                    Try adjusting your search query.
                  </p>
                </div>
              )}

              {/* Popular Tools Section */}
              <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-6 text-center">Popular Finance Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <a href="/tools/loan-calculator" className="text-center p-4 bg-blue-50 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
                    <i className="fas fa-calculator text-2xl text-blue-600 mb-2"></i>
                    <h3 className="font-semibold text-neutral-800">Loan Calculator</h3>
                    <p className="text-sm text-neutral-600">Calculate monthly payments</p>
                  </a>
                  <a href="/tools/mortgage-calculator" className="text-center p-4 bg-green-50 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
                    <i className="fas fa-home text-2xl text-green-600 mb-2"></i>
                    <h3 className="font-semibold text-neutral-800">Mortgage Calculator</h3>
                    <p className="text-sm text-neutral-600">Plan your home purchase</p>
                  </a>
                  <a href="/tools/tax-calculator" className="text-center p-4 bg-purple-50 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
                    <i className="fas fa-percentage text-2xl text-purple-600 mb-2"></i>
                    <h3 className="font-semibold text-neutral-800">Tax Calculator</h3>
                    <p className="text-sm text-neutral-600">Calculate income tax</p>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Introduction Section */}
          <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800 mb-6 text-center">What are Finance Tools?</h2>
              <div className="prose prose-lg max-w-none text-neutral-600 space-y-4">
                <p>
                  Finance Tools are free online calculators that help you make informed financial decisions. Whether you're planning a major purchase, managing debt, investing for the future, or tracking your budget, our comprehensive collection of 30+ financial calculators provides instant, accurate results to guide your money decisions.
                </p>
                
                <h3 className="text-2xl font-bold text-neutral-800 mt-8 mb-4">Why Use Our Finance Tools?</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Instant Results:</strong> Get calculations in seconds without complex formulas</li>
                  <li><strong>100% Free:</strong> No hidden fees, subscriptions, or registration required</li>
                  <li><strong>Accurate:</strong> Uses industry-standard financial formulas and methods</li>
                  <li><strong>Comprehensive:</strong> Covers loans, mortgages, investments, taxes, budgeting, and more</li>
                  <li><strong>Mobile-Friendly:</strong> Access tools on any device, anywhere, anytime</li>
                  <li><strong>Privacy Protected:</strong> We don't store your financial information</li>
                </ul>

                <h3 className="text-2xl font-bold text-neutral-800 mt-8 mb-4">Who Benefits from Finance Tools?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-neutral-800 mb-2">First-Time Homebuyers</h4>
                    <p className="text-sm text-neutral-600">Calculate mortgage payments, down payment requirements, and total home ownership costs</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-neutral-800 mb-2">Investors</h4>
                    <p className="text-sm text-neutral-600">Analyze returns, track investments, and plan for retirement with compound interest projections</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-neutral-800 mb-2">Business Owners</h4>
                    <p className="text-sm text-neutral-600">Calculate ROI, manage cash flow, and analyze business loan options</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-neutral-800 mb-2">Students & Young Professionals</h4>
                    <p className="text-sm text-neutral-600">Budget effectively, understand loan repayment, and start building wealth early</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How to Use Section */}
          <section className="py-16 bg-neutral-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800 mb-6 text-center">How to Use Finance Tools</h2>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-800 mb-2">Choose Your Tool</h3>
                      <p className="text-neutral-600">Browse our collection or use the search bar to find the calculator you need. Tools are organized by category for easy navigation.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-800 mb-2">Enter Your Information</h3>
                      <p className="text-neutral-600">Fill in the required fields with your financial data. Each calculator provides helpful tooltips and examples to guide you.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-800 mb-2">Get Instant Results</h3>
                      <p className="text-neutral-600">Click Calculate to see immediate results with detailed breakdowns, charts, and actionable insights.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-800 mb-2">Save or Share Results</h3>
                      <p className="text-neutral-600">Download PDF reports, share calculations with others, or save them to your account for future reference.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800 mb-8 text-center">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div className="border-b border-neutral-200 pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Are the finance tools really free?</h3>
                  <p className="text-neutral-600">Yes, all 30+ finance tools are completely free to use with no hidden fees, subscriptions, or registration requirements. You can access unlimited calculations anytime.</p>
                </div>
                <div className="border-b border-neutral-200 pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Do I need to create an account?</h3>
                  <p className="text-neutral-600">No account is required to use our calculators. However, creating a free account lets you save calculation history and access results across devices.</p>
                </div>
                <div className="border-b border-neutral-200 pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">How accurate are the calculations?</h3>
                  <p className="text-neutral-600">Our calculators use industry-standard financial formulas verified by financial professionals. However, results are estimates for planning purposes and should not replace professional financial advice.</p>
                </div>
                <div className="border-b border-neutral-200 pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Is my financial information secure?</h3>
                  <p className="text-neutral-600">Yes. All calculations are performed in your browser, and we don't store your financial data unless you explicitly save it to your account. We use industry-standard encryption for all data transmission.</p>
                </div>
                <div className="border-b border-neutral-200 pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Can I use these tools on mobile devices?</h3>
                  <p className="text-neutral-600">Absolutely! All our finance tools are fully responsive and work seamlessly on smartphones, tablets, and desktop computers.</p>
                </div>
                <div className="border-b border-neutral-200 pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">What's the difference between a loan calculator and a mortgage calculator?</h3>
                  <p className="text-neutral-600">A loan calculator handles general loans (personal, auto, business), while a mortgage calculator includes additional factors specific to home loans like property taxes, insurance, PMI, and HOA fees.</p>
                </div>
                <div className="border-b border-neutral-200 pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Can I save and share my calculations?</h3>
                  <p className="text-neutral-600">Yes! Each calculator allows you to download results as PDF, share via link, or save to your account for future reference and comparison.</p>
                </div>
                <div className="pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Do you offer calculators for small business finances?</h3>
                  <p className="text-neutral-600">Yes, we provide several business-focused tools including ROI calculator, break-even calculator, business loan calculator, and cash flow planning tools.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Related Categories Section */}
          <section className="py-16 bg-neutral-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800 mb-8 text-center">Explore Other Tool Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a href="/health-tools" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Health Tools</h3>
                  <p className="text-neutral-600 mb-4">Access 30+ health and fitness calculators including BMI, calorie, pregnancy, and medical calculators.</p>
                  <span className="text-blue-600 font-semibold hover:underline">Explore Health Tools →</span>
                </a>
                <a href="/text-tools" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Text Tools</h3>
                  <p className="text-neutral-600 mb-4">Use 30+ text processing tools including word counter, case converter, and text analyzers.</p>
                  <span className="text-blue-600 font-semibold hover:underline">Explore Text Tools →</span>
                </a>
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Take Control of Your Finances?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Start using our free financial calculators today and make smarter money decisions with instant, accurate results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#tools" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Browse All Tools
                </a>
                <a href="/signup" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                  Create Free Account
                </a>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default FinanceTools;
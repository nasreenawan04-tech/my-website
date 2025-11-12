import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'wouter';
import { Pen, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { tools } from '@/data/tools';
import { searchAndFilterTools } from '@/lib/search';

const TextTools = () => {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTools, setFilteredTools] = useState(tools.filter(tool => tool.category === 'text'));

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const searchParam = urlParams.get('search') || '';
    setSearchQuery(searchParam);
  }, [location]);

  // Filter tools based on search
  useEffect(() => {
    const filtered = searchAndFilterTools(searchQuery, 'text');
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
        <title>Text Tools - Free Writing & Text Processing Utilities</title>
        <meta name="description" content="Access 30+ free text processing tools including word counter, case converter, grammar checker, and text analyzers. Transform and optimize content instantly." />
        <meta name="keywords" content="text tools, word counter, case converter, grammar checker, plagiarism checker, text summarizer, writing tools, text analyzer" />
        <link rel="canonical" href="https://dapsiwow.com/text-tools" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <meta name="publisher" content="DapsiWow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/text-tools" />
        <meta property="og:title" content="Text Tools - Free Writing & Text Processing Utilities" />
        <meta property="og:description" content="Access 30+ free text tools including word counter, case converter, grammar checker, and more. Process content instantly, no registration." />
        <meta property="og:image" content="https://dapsiwow.com/images/text-tools-og.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="DapsiWow Text Tools - Free Text Processing Utilities" />
        <meta property="og:site_name" content="DapsiWow" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://dapsiwow.com/text-tools" />
        <meta name="twitter:title" content="Text Tools - Free Writing & Text Processing Utilities" />
        <meta name="twitter:description" content="Access 30+ free text tools for word counting, case conversion, grammar checking and more. Instant processing, no registration." />
        <meta name="twitter:image" content="https://dapsiwow.com/images/text-tools-og.jpg" />
        <meta name="twitter:image:alt" content="DapsiWow Text Tools Collection" />
        
        {/* Additional Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="language" content="English" />
        
        {/* Schema.org Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                "@id": "https://dapsiwow.com/text-tools",
                "url": "https://dapsiwow.com/text-tools",
                "name": "Text Tools - Free Writing & Text Processing Utilities",
                "description": "Access 30+ free text processing tools including word counter, case converter, grammar checker, and text analyzers. Transform and optimize content instantly.",
                "inLanguage": "en-US",
                "isPartOf": {
                  "@id": "https://dapsiwow.com/#website"
                },
                "breadcrumb": {
                  "@id": "https://dapsiwow.com/text-tools#breadcrumb"
                },
                "mainEntity": {
                  "@id": "https://dapsiwow.com/text-tools#collection"
                }
              },
              {
                "@type": "CollectionPage",
                "@id": "https://dapsiwow.com/text-tools#collection",
                "name": "Text Tools Collection",
                "description": "Comprehensive collection of 30+ free text processing and writing utilities",
                "url": "https://dapsiwow.com/text-tools",
                "numberOfItems": 30,
                "itemListElement": [
                  {
                    "@type": "SoftwareApplication",
                    "name": "Word Counter",
                    "url": "https://dapsiwow.com/tools/word-counter",
                    "description": "Count words, characters, and sentences in your text",
                    "applicationCategory": "UtilitiesApplication",
                    "offers": {
                      "@type": "Offer",
                      "price": "0",
                      "priceCurrency": "USD"
                    }
                  },
                  {
                    "@type": "SoftwareApplication",
                    "name": "Case Converter",
                    "url": "https://dapsiwow.com/tools/case-converter",
                    "description": "Convert text between uppercase, lowercase, and title case",
                    "applicationCategory": "UtilitiesApplication",
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
                "@id": "https://dapsiwow.com/text-tools#breadcrumb",
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
                    "name": "Text Tools",
                    "item": "https://dapsiwow.com/text-tools"
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
              },
              {
                "@type": "WebSite",
                "@id": "https://dapsiwow.com/#website",
                "url": "https://dapsiwow.com",
                "name": "DapsiWow",
                "description": "Free online tools and calculators for finance, health, and text processing",
                "publisher": {
                  "@id": "https://dapsiwow.com/#organization"
                },
                "inLanguage": "en-US"
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-text-tools">
        <Header />

        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-yellow-600 via-orange-500 to-red-600 text-white py-16 relative overflow-hidden">
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
                className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400/10 to-orange-400/10 blur-xl"
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
                className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-gradient-to-br from-orange-400/10 to-red-400/10 blur-xl"
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
                <Pen className="w-12 h-12 text-white" />
              </motion.div>
              <motion.h1 
                className="text-4xl sm:text-5xl font-bold mb-4"
                data-testid="text-page-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              >
                Text Tools
              </motion.h1>
              <motion.p 
                className="text-xl text-yellow-100 mb-8 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              >
                30+ free text and writing tools to analyze, improve, and transform your content
              </motion.p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search text tools..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full py-4 px-6 pr-16 text-lg text-neutral-800 bg-white rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-yellow-200 transition-all duration-200"
                    data-testid="input-search-text-tools"
                  />
                  <div className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl flex items-center pointer-events-none">
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
                <p className="text-neutral-600 text-center" data-testid="text-results-count">
                  Showing {filteredTools.length} text tools
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>

              {/* Tools Grid */}
              {filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8" data-testid="grid-text-tools">
                  {filteredTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16" data-testid="empty-state-no-tools">
                  <i className="fas fa-search text-6xl text-neutral-300 mb-4"></i>
                  <h3 className="text-2xl font-bold text-neutral-600 mb-2">No text tools found</h3>
                  <p className="text-neutral-500">
                    Try adjusting your search query.
                  </p>
                </div>
              )}

              {/* Popular Tools Section */}
              <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-6 text-center">Popular Text Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <a href="/tools/word-counter" className="text-center p-4 bg-yellow-50 rounded-xl hover:shadow-md transition-shadow cursor-pointer no-underline" data-testid="link-word-counter">
                    <i className="fas fa-calculator text-2xl text-yellow-600 mb-2"></i>
                    <h3 className="font-semibold text-neutral-800">Word Counter</h3>
                    <p className="text-sm text-neutral-600">Count words & characters</p>
                  </a>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <i className="fas fa-spell-check text-2xl text-green-600 mb-2"></i>
                    <h3 className="font-semibold text-neutral-800">Grammar Checker</h3>
                    <p className="text-sm text-neutral-600">Fix grammar errors</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <i className="fas fa-shield-alt text-2xl text-blue-600 mb-2"></i>
                    <h3 className="font-semibold text-neutral-800">Plagiarism Checker</h3>
                    <p className="text-sm text-neutral-600">Check for plagiarism</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <i className="fas fa-compress-alt text-2xl text-purple-600 mb-2"></i>
                    <h3 className="font-semibold text-neutral-800">Text Summarizer</h3>
                    <p className="text-sm text-neutral-600">Summarize content</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Introduction Section */}
          <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800 mb-6 text-center">Master Text Processing with Professional-Grade Tools</h2>
              
              <div className="space-y-6 text-neutral-600 text-lg leading-relaxed">
                <p>
                  Transform your writing, editing, and content creation workflow with our comprehensive collection of 30+ free text processing tools. Whether you're a professional writer, student, developer, or content creator, our utilities help you analyze, format, convert, and optimize text with precision and speed.
                </p>
                
                <h3 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">What Are Text Processing Tools?</h3>
                <p>
                  Text tools are specialized utilities that automate common text manipulation, analysis, and formatting tasks. From counting words and characters to converting cases, checking grammar, analyzing readability, and transforming text formats, our tools save hours of manual work and ensure accuracy in every project.
                </p>
                
                <h3 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">Why Use Our Text Tools?</h3>
                <ul className="list-disc pl-6 space-y-3">
                  <li><strong>Instant Processing:</strong> Analyze, convert, and transform text in real-time with zero waiting</li>
                  <li><strong>Professional Accuracy:</strong> Tools powered by industry-standard algorithms and linguistic databases</li>
                  <li><strong>Privacy Protected:</strong> All processing happens in your browser - your content never touches our servers</li>
                  <li><strong>100% Free:</strong> Unlimited usage with no character limits, subscriptions, or hidden fees</li>
                  <li><strong>Multi-Format Support:</strong> Work with plain text, HTML, Markdown, code, and various encoding formats</li>
                  <li><strong>Mobile Friendly:</strong> Edit and analyze text on any device, anywhere</li>
                </ul>
                
                <h3 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">Who Benefits from Text Tools?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-neutral-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-neutral-800 mb-2">Content Writers & Bloggers</h4>
                    <p className="text-neutral-600">Track word counts, check readability scores, analyze keyword density, optimize meta descriptions, and ensure perfect grammar for SEO-optimized content.</p>
                  </div>
                  <div className="bg-neutral-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-neutral-800 mb-2">Students & Academics</h4>
                    <p className="text-neutral-600">Count words for essays, check plagiarism, format citations, convert cases, and analyze text complexity to meet assignment requirements.</p>
                  </div>
                  <div className="bg-neutral-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-neutral-800 mb-2">Developers & Programmers</h4>
                    <p className="text-neutral-600">Convert between text encodings, escape strings, format JSON/XML, minify code, generate hashes, and manipulate text data for development workflows.</p>
                  </div>
                  <div className="bg-neutral-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-neutral-800 mb-2">Business Professionals</h4>
                    <p className="text-neutral-600">Format documents, convert text cases, extract emails from text, clean up data, and create professional content efficiently.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How to Use Section */}
          <section className="py-16 bg-neutral-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800 mb-12 text-center">How to Use Our Text Processing Tools</h2>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-800 mb-2">Choose Your Tool</h3>
                      <p className="text-neutral-600">Browse our 30+ text tools above or search for specific functionality like "word counter," "case converter," or "grammar checker." Each tool is designed for a specific text processing task.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-800 mb-2">Input Your Text</h3>
                      <p className="text-neutral-600">Paste, type, or upload your text content. Most tools support large documents and provide real-time processing as you type or paste content.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-800 mb-2">Get Instant Results</h3>
                      <p className="text-neutral-600">View processed results immediately with detailed statistics, formatting options, or converted output. Results update in real-time for most tools.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-800 mb-2">Copy or Export Results</h3>
                      <p className="text-neutral-600">Copy processed text to clipboard with one click, download as file, or save to your account for future access. Share results via link when needed.</p>
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
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Are the text tools completely free?</h3>
                  <p className="text-neutral-600">Yes, all 30+ text processing tools are completely free with unlimited usage. There are no character limits, no subscriptions, and no hidden fees. Use them as much as you need.</p>
                </div>
                <div className="border-b border-neutral-200 pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Is my content private and secure?</h3>
                  <p className="text-neutral-600">Absolutely. All text processing happens entirely in your browser. Your content never leaves your device unless you explicitly choose to save it to your account. We never store or access your text data.</p>
                </div>
                <div className="border-b border-neutral-200 pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Do I need to install any software?</h3>
                  <p className="text-neutral-600">No installation required! All tools work directly in your web browser on any device. Simply open the tool, paste your text, and get instant results. Works on desktop, tablet, and mobile.</p>
                </div>
                <div className="border-b border-neutral-200 pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">What's the difference between word count and character count?</h3>
                  <p className="text-neutral-600">Word count counts individual words separated by spaces, while character count includes all letters, numbers, punctuation, and spaces. Both metrics are useful for different requirements like essay limits or social media posts.</p>
                </div>
                <div className="border-b border-neutral-200 pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Can I use these tools for professional work?</h3>
                  <p className="text-neutral-600">Yes! Our tools are designed for professional use and are trusted by content creators, developers, marketers, and businesses worldwide. They provide accurate, reliable results suitable for any professional application.</p>
                </div>
                <div className="border-b border-neutral-200 pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">How accurate is the grammar and plagiarism checker?</h3>
                  <p className="text-neutral-600">Our grammar checker uses advanced natural language processing to detect common errors, while the plagiarism checker scans against billions of web pages. Both provide high accuracy but should be used as aids alongside manual proofreading.</p>
                </div>
                <div className="border-b border-neutral-200 pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Can I save and reuse my processed text?</h3>
                  <p className="text-neutral-600">Yes! Create a free account to save unlimited text processing results, access history across devices, and quickly retrieve previous work. Without an account, you can still copy results to your clipboard.</p>
                </div>
                <div className="pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Do you support special characters and Unicode?</h3>
                  <p className="text-neutral-600">Yes, all our text tools fully support Unicode, special characters, emojis, and text in multiple languages including non-Latin scripts like Chinese, Arabic, Cyrillic, and more.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Related Categories Section */}
          <section className="py-16 bg-neutral-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800 mb-8 text-center">Explore Other Tool Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a href="/finance-tools" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Finance Tools</h3>
                  <p className="text-neutral-600 mb-4">Access 30+ financial calculators including mortgage, loan, ROI, and investment planning tools.</p>
                  <span className="text-orange-600 font-semibold hover:underline">Explore Finance Tools →</span>
                </a>
                <a href="/health-tools" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Health Tools</h3>
                  <p className="text-neutral-600 mb-4">Access 30+ health and fitness calculators including BMI, calorie, pregnancy, and medical calculators.</p>
                  <span className="text-orange-600 font-semibold hover:underline">Explore Health Tools →</span>
                </a>
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="py-16 bg-gradient-to-r from-yellow-600 via-orange-500 to-red-600 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Start Processing Text Like a Pro</h2>
              <p className="text-xl text-yellow-100 mb-8 max-w-2xl mx-auto">
                Save time and boost productivity with our free text processing tools. Analyze, format, and transform your content instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#tools" className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-50 transition-colors">
                  Browse All Tools
                </a>
                <a href="/signup" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors">
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

export default TextTools;
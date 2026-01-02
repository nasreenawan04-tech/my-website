import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import PopularToolsSection from '@/components/PopularToolsSection';
import CategorySection from '@/components/CategorySection';
import AdBanner from '@/components/AdBanner';
import NativeAd from '@/components/NativeAd';
import FavoritesSection from '@/components/FavoritesSection';
import RecentToolsSection from '@/components/RecentToolsSection';
import { Calculator, PenTool, HeartPulse, Zap, Shield, Smartphone, Globe } from 'lucide-react';
import { AuthStatus } from '@/components/AuthStatus';

const Home = () => {
  const { user } = useAuth();
  return (
    <>
      <Helmet>
        <title>DapsiWow - 23 Free Online Tools | Finance, Text & Health Calculators</title>
        <meta name="description" content="Access 23 free online tools for finance (loan, mortgage, EMI calculators), text processing (word counter, password generator), and health tracking (BMI, calorie calculator). No signup required. Instant results across all devices." />
        <meta name="keywords" content="DapsiWow, dapsiwow, free online tools, loan calculator, mortgage calculator, business loan calculator, lease calculator, productivity tools, finance calculators, text tools, health calculators, online utilities, web tools, no registration tools" />
        <meta name="author" content="DapsiWow Team" />
        <meta name="publisher" content="DapsiWow" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://dapsiwow.com/" />
        
        <meta property="og:title" content="DapsiWow - 23 Free Online Tools | Finance, Text & Health Calculators" />
        <meta property="og:description" content="Access 23 free online tools for finance (loan, mortgage, EMI calculators), text processing (word counter, password generator), and health tracking (BMI, calorie calculator). No signup required. Instant results across all devices." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/" />
        <meta property="og:image" content="https://dapsiwow.com/images/dapsiwow-og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="DapsiWow - Free Online Tools Platform with 23 Calculators and Utilities" />
        <meta property="og:site_name" content="DapsiWow" />
        <meta property="og:locale" content="en_US" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@DapsiWow" />
        <meta name="twitter:creator" content="@DapsiWow" />
        <meta name="twitter:title" content="DapsiWow - 23 Free Online Tools | Finance, Text & Health Calculators" />
        <meta name="twitter:description" content="Access 23 free online tools for finance (loan, mortgage, EMI calculators), text processing (word counter, password generator), and health tracking (BMI, calorie calculator). No signup required. Instant results across all devices." />
        <meta name="twitter:image" content="https://dapsiwow.com/images/dapsiwow-twitter-card.jpg" />
        <meta name="twitter:image:alt" content="DapsiWow Free Online Tools Platform" />
        
        <meta name="pinterest-rich-pin" content="true" />
        <meta name="pinterest:description" content="DapsiWow: 23 Free Online Tools for Finance, Text Processing, and Health Tracking. No Registration Required." />
        
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="distribution" content="global" />
        <meta name="language" content="English" />
        <meta name="rating" content="General" />
        
        <meta name="date" content="2025-01-15" />
        <meta name="last-modified" content="2025-01-20" />
        <meta name="copyright" content="© 2025 DapsiWow. All rights reserved." />
        
        <link rel="alternate" hrefLang="en" href="https://dapsiwow.com/" />
        <link rel="alternate" hrefLang="en-US" href="https://dapsiwow.com/" />
        <link rel="alternate" hrefLang="en-GB" href="https://dapsiwow.com/" />
        <link rel="alternate" hrefLang="en-CA" href="https://dapsiwow.com/" />
        <link rel="alternate" hrefLang="en-AU" href="https://dapsiwow.com/" />
        <link rel="alternate" hrefLang="x-default" href="https://dapsiwow.com/" />
        
        <meta name="theme-color" content="#3b82f6" />
        <meta name="application-name" content="DapsiWow Tools" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "DapsiWow",
            "description": "Professional online tools platform offering 23 free utilities for business and personal use",
            "url": "https://dapsiwow.com/",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://dapsiwow.com/tools?search={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "mainEntity": {
              "@type": "ItemList",
              "name": "DapsiWow Tool Categories",
              "description": "Complete collection of professional online tools organized by category",
              "numberOfItems": 3,
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "item": {
                    "@type": "CollectionPage",
                    "@id": "https://dapsiwow.com/finance-tools",
                    "name": "Finance Tools",
                    "description": "Professional financial calculators including loan, mortgage, EMI, and investment calculators",
                    "url": "https://dapsiwow.com/finance-tools"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "item": {
                    "@type": "CollectionPage",
                    "@id": "https://dapsiwow.com/text-tools",
                    "name": "Text Tools",
                    "description": "Text processing and analysis tools including word counters, case converters, and generators",
                    "url": "https://dapsiwow.com/text-tools"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "item": {
                    "@type": "CollectionPage",
                    "@id": "https://dapsiwow.com/health-tools",
                    "name": "Health Tools",
                    "description": "Health and fitness calculators including BMI, calorie, and body composition tools",
                    "url": "https://dapsiwow.com/health-tools"
                  }
                }
              ]
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "DapsiWow",
            "url": "https://dapsiwow.com/",
            "logo": "https://dapsiwow.com/logo.svg",
            "description": "Professional online tools platform offering 23 free utilities for business and personal use including finance calculators, text converters, and health trackers.",
            "foundingDate": "2025",
            "slogan": "Free Finance, Text, Health and other Online Tools",
            "knowsAbout": [
              "Financial Calculators",
              "Text Processing Tools",
              "Health Calculators",
              "Online Utilities",
              "Productivity Tools"
            ],
            "sameAs": [
              "https://dapsiwow.com/about",
              "https://dapsiwow.com/contact"
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Are all 23 tools really free to use?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! Every single tool on DapsiWow is completely free with no hidden costs, subscriptions, or premium upgrades. This includes our loan calculators, mortgage tools, BMI calculators, and all other utilities. We believe professional-grade tools should be accessible to everyone."
                }
              },
              {
                "@type": "Question",
                "name": "How do I use the loan calculator for my business?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our business loan calculator lets you input your loan amount, interest rate, and term to calculate monthly payments. It includes origination fees, processing costs, and shows your total interest paid. Perfect for comparing SBA loans, equipment financing, and traditional business loans."
                }
              },
              {
                "@type": "Question",
                "name": "What makes your mortgage calculator different?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our mortgage calculator includes principal, interest, taxes, insurance (PITI), and PMI calculations all in one tool. It supports multiple loan terms, down payment scenarios, and shows detailed breakdowns including total interest paid over the life of the loan."
                }
              },
              {
                "@type": "Question",
                "name": "Which health tools do you offer for fitness tracking?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We provide BMI calculators, calorie counters, body fat percentage tools, protein intake calculators, TDEE calculators, and water intake trackers. All health tools use scientifically-backed formulas for informational purposes only. Note: Results are not medical advice. Consult healthcare professionals for medical decisions."
                }
              },
              {
                "@type": "Question",
                "name": "What text processing tools are available?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our text tools include word counters, character counters, case converters (uppercase, lowercase, title case), text generators, binary converters, markdown tools, and duplicate line removers. Perfect for content creators, students, and professionals who need quick text analysis and formatting."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need to sign up or download anything?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No registration, downloads, or installations required! Simply visit any tool page and start using it immediately. All tools work directly in your web browser on any device. Your privacy is protected since we don't collect personal information or require accounts."
                }
              },
              {
                "@type": "Question",
                "name": "Do the calculators work on mobile phones and tablets?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolutely! All our tools are mobile-optimized and work seamlessly on smartphones, tablets, laptops, and desktops. The responsive design ensures buttons are easy to tap, forms are simple to fill out, and results display perfectly on any screen size."
                }
              },
              {
                "@type": "Question",
                "name": "Is my financial and personal data secure?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! All calculations happen locally in your browser - we don't store your data on our servers. Your loan amounts, income details, health metrics, and text content remain completely private. No data is transmitted, stored, or shared with third parties."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use these tools for my business or commercial projects?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! All DapsiWow tools can be used for both personal and commercial purposes without restrictions. Financial advisors, real estate agents, fitness trainers, content creators, and businesses regularly use our calculators and tools for client presentations and professional work."
                }
              },
              {
                "@type": "Question",
                "name": "How can I get support or request new tools?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Contact us through our support page for help, feature requests, or to report issues. We actively listen to user feedback and regularly add new tools based on demand. Our goal is to continuously improve and expand our collection to meet your needs."
                }
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-home">
        <Header />

        <main className="flex-1">
          <HeroSection />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <AdBanner className="shadow-sm hover:shadow-md transition-shadow" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <NativeAd placement="top" layout="4x1" />
          </div>

          {/* User-specific sections - shown if user has favorites or recent tools */}
          <FavoritesSection />
          <RecentToolsSection />

          {/* What is DapsiWow Section */}
          <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50" aria-labelledby="what-is-dapsiwow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 id="what-is-dapsiwow" className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                  What is DapsiWow?
                </h2>
                <p className="text-xl text-neutral-600 max-w-4xl mx-auto leading-relaxed mb-8">
                  DapsiWow is your ultimate online toolkit featuring 23 professional-grade tools completely free to use.
                  No registration required, no hidden fees, no software downloads - just powerful tools that work instantly
                  in your browser across all devices.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Finance Tools</h3>
                    <p className="text-neutral-600 text-sm">Professional financial calculators for loans, mortgages, and investment planning</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Text Tools</h3>
                    <p className="text-neutral-600 text-sm">Text processing and analysis tools for content creators and professionals</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Health Tools</h3>
                    <p className="text-neutral-600 text-sm">Health and fitness calculators for wellness tracking and fitness planning</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <PopularToolsSection />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <AdBanner />
          </div>

          <CategorySection />

          {/* About DapsiWow Section */}
          <section className="py-20 bg-white" aria-labelledby="why-choose-dapsiwow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 id="why-choose-dapsiwow" className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                  Why Choose DapsiWow?
                </h2>
                <p className="text-xl text-neutral-600 max-w-4xl mx-auto leading-relaxed">
                  We've built the most comprehensive collection of online tools to help you work smarter, not harder.
                  From complex financial calculations to document processing and health monitoring, we've got you covered with professional-grade
                  tools that rival expensive software suites.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
                <div>
                  <h3 className="text-3xl font-bold text-neutral-800 mb-6">
                    Professional Tools, Zero Cost
                  </h3>
                  <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                    Access professional-grade tools typically found in expensive software suites. Our platform offers the same functionality
                    you'd expect from premium applications, but completely free and accessible through your web browser.
                  </p>
                  <p className="text-lg text-neutral-600 leading-relaxed">
                    Whether you're a business owner calculating loan payments, a student analyzing data, or someone monitoring their health -
                    our tools deliver professional results without the professional price tag.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 shadow-inner">
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div>
                      <div className="text-4xl font-bold text-blue-600 mb-2">23</div>
                      <div className="text-neutral-700 font-medium">Free Tools</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-green-600 mb-2">0</div>
                      <div className="text-neutral-700 font-medium">Registration Required</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-purple-600 mb-2">3</div>
                      <div className="text-neutral-700 font-medium">Main Categories</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
                      <div className="text-neutral-700 font-medium">Always Available</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Zap className="text-white" size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-neutral-800 mb-4">Lightning Fast</h4>
                  <p className="text-neutral-600 leading-relaxed">
                    Our tools are optimized for speed and performance. Get results instantly without waiting for downloads,
                    installations, or lengthy processing times. Built with modern web technologies for optimal performance.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="text-white" size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-neutral-800 mb-4">Secure & Private</h4>
                  <p className="text-neutral-600 leading-relaxed">
                    Your data stays private. We don't store your files or personal information. All processing happens locally
                    in your browser, ensuring your data never leaves your device.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Smartphone className="text-white" size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-neutral-800 mb-4">Works Everywhere</h4>
                  <p className="text-neutral-600 leading-relaxed">
                    Access our tools from any device - desktop, laptop, tablet, or smartphone. Responsive design ensures
                    perfect functionality across all screen sizes and browsers.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Globe className="text-white" size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-neutral-800 mb-4">Global Support</h4>
                  <p className="text-neutral-600 leading-relaxed">
                    Multi-currency support, international formats, and tools designed for users worldwide. Available 24/7
                    from anywhere in the world with internet access.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Tools Spotlight */}
          <section className="py-20 bg-gradient-to-br from-neutral-50 to-blue-50" aria-labelledby="featured-spotlight">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 id="featured-spotlight" className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                  Featured Tools Spotlight
                </h2>
                <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                  Discover our most popular and powerful tools that thousands of users rely on daily
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group border border-neutral-100">
                  <h3 className="text-xl font-bold text-neutral-800 mb-4">Word Counter</h3>
                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    Analyze text documents with detailed word, character, and readability statistics.
                  </p>
                  <a
                    href="/tools/word-counter"
                    className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors group-hover:gap-2 gap-1"
                  >
                    Try Word Counter
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </a>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group border border-neutral-100">
                  <h3 className="text-xl font-bold text-neutral-800 mb-4">BMI Calculator</h3>
                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    Calculate Body Mass Index and get comprehensive health insights.
                  </p>
                  <a
                    href="/tools/bmi-calculator"
                    className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors group-hover:gap-2 gap-1"
                  >
                    Try BMI Calculator
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </a>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group border border-neutral-100">
                  <h3 className="text-xl font-bold text-neutral-800 mb-4">Username Generator</h3>
                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    Generate unique and creative usernames instantly.
                  </p>
                  <a
                    href="/tools/username-generator"
                    className="inline-flex items-center text-yellow-600 font-semibold hover:text-yellow-700 transition-colors group-hover:gap-2 gap-1"
                  >
                    Try Username Generator
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </a>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group border border-neutral-100">
                  <h3 className="text-xl font-bold text-neutral-800 mb-4">Mortgage Calculator</h3>
                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    Calculate comprehensive mortgage payments and costs.
                  </p>
                  <a
                    href="/tools/mortgage-calculator"
                    className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors group-hover:gap-2 gap-1"
                  >
                    Try Mortgage Calculator
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </a>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group border border-neutral-100">
                  <h3 className="text-xl font-bold text-neutral-800 mb-4">Business Loan Calculator</h3>
                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    Calculate business loan payments and costs effectively.
                  </p>
                  <a
                    href="/tools/business-loan-calculator"
                    className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700 transition-colors group-hover:gap-2 gap-1"
                  >
                    Try Business Loan Calculator
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </a>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group border border-neutral-100">
                  <h3 className="text-xl font-bold text-neutral-800 mb-4">Calorie Calculator</h3>
                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    Track and manage your daily calorie needs.
                  </p>
                  <a
                    href="/tools/calorie-calculator"
                    className="inline-flex items-center text-red-600 font-semibold hover:text-red-700 transition-colors group-hover:gap-2 gap-1"
                  >
                    Try Calorie Calculator
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </a>
                </div>
              </div>

              <div className="text-center mt-12">
                <p className="text-neutral-600 mb-6">
                  Discover more powerful tools in our complete collection
                </p>
                <a
                  href="/all-tools"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 gap-2"
                >
                  View All 23 Tools
                  <Zap size={20} />
                </a>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                  How DapsiWow Works
                </h2>
                <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                  Getting started is simple. No complicated setup, no subscriptions, no hidden fees.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                <div className="text-center">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-2xl font-bold text-white">1</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-800 mb-4">Choose Your Tool</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    Browse our categories or use the search bar to find exactly what you need.
                    From financial calculators to text analyzers, we have tools for every task.
                  </p>
                </div>

                <div className="text-center">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-2xl font-bold text-white">2</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-800 mb-4">Enter Your Data</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    Input your information using our intuitive forms. Our tools are designed to be user-friendly
                    with clear instructions and helpful tooltips.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-800 mb-4">Get Results</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    Receive instant, accurate results with detailed explanations. Download, save, or share
                    your results as needed for your personal or business use.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Trust & Reliability Section */}
          <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" data-testid="section-trust">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                  Trusted by Users Worldwide
                </h2>
                <p className="text-xl text-neutral-600 max-w-4xl mx-auto leading-relaxed">
                  Join millions of professionals, students, and individuals who rely on DapsiWow's
                  comprehensive toolkit for their daily calculations, analysis, and productivity needs.
                  Our platform delivers consistent, accurate results that users trust for important decisions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
                <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 group" data-testid="stat-calculations">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300">
                    <Calculator className="text-white" size={24} />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">25M+</div>
                    <div className="text-neutral-800 font-semibold text-lg mb-1">Calculations Completed</div>
                    <div className="text-sm text-neutral-500">Accurate results delivered daily</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100 group" data-testid="stat-tools">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300">
                    <PenTool className="text-white" size={24} />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">23</div>
                    <div className="text-neutral-800 font-semibold text-lg mb-1">Professional Tools</div>
                    <div className="text-sm text-neutral-500">Continuously expanding collection</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 group" data-testid="stat-uptime">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300">
                    <Shield className="text-white" size={24} />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">99.9%</div>
                    <div className="text-neutral-800 font-semibold text-lg mb-1">Service Reliability</div>
                    <div className="text-sm text-neutral-500">Always available when you need it</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 group" data-testid="stat-security">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300">
                    <Globe className="text-white" size={24} />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-orange-600 mb-2">100%</div>
                    <div className="text-neutral-800 font-semibold text-lg mb-1">Free & Accessible</div>
                    <div className="text-sm text-neutral-500">No subscriptions or hidden fees</div>
                  </div>
                </div>
              </div>

              <div className="text-center mb-12">
                <h3 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-6">
                  Why Professionals Choose DapsiWow
                </h3>
                <p className="text-lg text-neutral-600 max-w-4xl mx-auto leading-relaxed">
                  Our platform serves professionals across industries who demand accuracy, reliability,
                  and efficiency in their daily work. Here's how different professionals use DapsiWow:
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-xl border border-gray-100">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200" data-testid="use-case-financial">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Calculator className="text-white" size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-800 mb-2">Financial Advisors & Real Estate Agents</h4>
                          <p className="text-neutral-700 text-sm leading-relaxed">
                            Provide accurate mortgage calculations, loan comparisons, and investment projections
                            to help clients make informed financial decisions with confidence.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200" data-testid="use-case-health">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <HeartPulse className="text-white" size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-800 mb-2">Health & Fitness Professionals</h4>
                          <p className="text-neutral-700 text-sm leading-relaxed">
                            Track client progress with BMI calculators, calorie counters, and body composition
                            tools to create personalized fitness and nutrition programs.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200" data-testid="use-case-content">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <PenTool className="text-white" size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-800 mb-2">Content Creators & Marketers</h4>
                          <p className="text-neutral-700 text-sm leading-relaxed">
                            Optimize content with text analysis tools, word counters, and formatting utilities
                            for better engagement and professional presentation.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-green-200" data-testid="use-case-students">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Zap className="text-white" size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-800 mb-2">Students & Researchers</h4>
                          <p className="text-neutral-700 text-sm leading-relaxed">
                            Complete research calculations, analyze documents, and plan projects across
                            various academic disciplines with our comprehensive toolkit.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 border border-blue-200">
                      <h4 className="text-2xl font-bold text-neutral-800 mb-4 text-center">
                        Get Started in Seconds
                      </h4>
                      <p className="text-neutral-700 mb-6 leading-relaxed text-center">
                        Join millions of users who rely on DapsiWow for accurate calculations and analysis.
                        No registration required - just click and start using any tool instantly.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                        <Link
                          href={user ? "/profile" : "/signup"}
                          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg text-center hover:shadow-xl transform hover:-translate-y-0.5"
                          data-testid="link-get-started"
                        >
                          {user ? "View Profile" : "Create Free Account"}
                        </Link>
                        <Link
                          href="/all-tools"
                          className="inline-block bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 text-center hover:shadow-lg transform hover:-translate-y-0.5"
                          data-testid="link-all-tools-home"
                        >
                          Explore All Tools
                        </Link>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-neutral-600">
                          Or explore all <a href="/all-tools" className="text-blue-600 hover:text-blue-800 underline font-semibold">23 professional tools</a>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                        <h5 className="font-bold text-neutral-800 mb-3 text-center">Trust Indicators</h5>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="flex flex-col items-center space-y-2" data-testid="trust-indicator-security">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Shield className="text-green-600" size={20} />
                            </div>
                            <span className="text-xs font-medium text-neutral-700">Secure & Private</span>
                          </div>
                          <div className="flex flex-col items-center space-y-2" data-testid="trust-indicator-speed">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <Zap className="text-yellow-600" size={20} />
                            </div>
                            <span className="text-xs font-medium text-neutral-700">Instant Results</span>
                          </div>
                          <div className="flex flex-col items-center space-y-2" data-testid="trust-indicator-devices">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Smartphone className="text-purple-600" size={20} />
                            </div>
                            <span className="text-xs font-medium text-neutral-700">All Devices</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Comprehensive FAQ Section */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                  Everything you need to know about DapsiWow's free finance, text, and health tools
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <div className="bg-white rounded-lg p-6 shadow-md" data-testid="faq-free-tools">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                      Are all 23 tools really free to use?
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Yes! Every single tool on DapsiWow is completely free with no hidden costs, subscriptions, or premium upgrades.
                      This includes our advanced loan calculators, mortgage tools, BMI calculators, text converters, and all other utilities.
                      We believe professional-grade tools should be accessible to everyone.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-md" data-testid="faq-loan-calculator">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                      How do I use the loan calculator for my business?
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Our <a href="/tools/business-loan-calculator" className="text-blue-600 hover:text-blue-800 underline">business loan calculator</a> lets you input your loan amount, interest rate, and term to calculate monthly payments.
                      It includes origination fees, processing costs, and shows your total interest paid. Perfect for comparing SBA loans,
                      equipment financing, and traditional business loans. Explore all <a href="/finance-tools" className="text-blue-600 hover:text-blue-800 underline">finance tools</a>.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-md" data-testid="faq-mortgage-calculator">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                      What makes your mortgage calculator different?
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Our <a href="/tools/mortgage-calculator" className="text-blue-600 hover:text-blue-800 underline">mortgage calculator</a> includes principal, interest, taxes, insurance (PITI), and PMI calculations all in one tool.
                      It supports multiple loan terms, down payment scenarios, and shows detailed breakdowns including total interest
                      paid over the life of the loan. Find more <a href="/finance-tools" className="text-blue-600 hover:text-blue-800 underline">financial calculators</a>.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-md" data-testid="faq-bmi-health-tools">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                      Which health tools do you offer for fitness tracking?
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      We provide <a href="/tools/bmi-calculator" className="text-blue-600 hover:text-blue-800 underline">BMI calculators</a>, calorie counters, body fat percentage tools, protein intake calculators,
                      TDEE calculators, and water intake trackers. All <a href="/health-tools" className="text-blue-600 hover:text-blue-800 underline">health tools</a> use scientifically-backed formulas for informational purposes only.
                      <strong>Note:</strong> Results are not medical advice. Consult healthcare professionals for medical decisions.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-md" data-testid="faq-text-tools">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                      What text processing tools are available?
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Our <a href="/text-tools" className="text-blue-600 hover:text-blue-800 underline">text tools</a> include <a href="/tools/word-counter" className="text-blue-600 hover:text-blue-800 underline">word counters</a>, character counters, <a href="/tools/case-converter" className="text-blue-600 hover:text-blue-800 underline">case converters</a> (uppercase, lowercase, title case),
                      text generators, binary converters, markdown tools, and duplicate line removers. Perfect for content creators,
                      students, and professionals who need quick text analysis and formatting.
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-white rounded-lg p-6 shadow-md" data-testid="faq-no-registration">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                      Do I need to sign up or download anything?
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      No registration, downloads, or installations required! Simply visit any tool page and start using it immediately.
                      All tools work directly in your web browser on any device. Your privacy is protected since we don't collect
                      personal information or require accounts.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-md" data-testid="faq-mobile-compatibility">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                      Do the calculators work on mobile phones and tablets?
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Absolutely! All our tools are mobile-optimized and work seamlessly on smartphones, tablets, laptops, and desktops.
                      The responsive design ensures buttons are easy to tap, forms are simple to fill out, and results display perfectly
                      on any screen size.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-md" data-testid="faq-data-security">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                      Is my financial and personal data secure?
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Yes! All calculations happen locally in your browser - we don't store your data on our servers.
                      Your loan amounts, income details, health metrics, and text content remain completely private.
                      No data is transmitted, stored, or shared with third parties. Read our <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</a> for details.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-md" data-testid="faq-commercial-use">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                      Can I use these tools for my business or commercial projects?
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Yes! All DapsiWow tools can be used for both personal and commercial purposes without restrictions.
                      Financial advisors, real estate agents, fitness trainers, content creators, and businesses regularly use
                      our calculators and tools for client presentations and professional work.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-md" data-testid="faq-support">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                      How can I get support or request new tools?
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Contact us through our support page for help, feature requests, or to report issues. We actively listen
                      to user feedback and regularly add new tools based on demand. Our goal is to continuously improve and
                      expand our collection to meet your needs.
                    </p>
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

export default Home;
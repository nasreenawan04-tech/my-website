import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import PopularToolsSection from '@/components/PopularToolsSection';
import CategorySection from '@/components/CategorySection';
import Footer from '@/components/Footer';
import FavoritesSection from '@/components/FavoritesSection';
import { Calculator, PenTool, HeartPulse, Zap, Shield, Smartphone, Globe, TrendingUp, Users, Award } from 'lucide-react';
import { tools } from '@/data/tools';
import { Link } from 'wouter';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>DapsiWow: Free Finance, Text & Health Online Tools - 79 Professional Calculators</title>
        <meta name="description" content="Access 79 professional-grade online tools completely free. No registration required. Finance calculators, text processors, health trackers, and more - all designed to boost your productivity." />
        <link rel="canonical" href="https://dapsiwow.com/" />
        <meta name="keywords" content="DapsiWow, dapsiwow, free online tools, loan calculator, mortgage calculator, business loan calculator, lease calculator, productivity tools, finance calculators, text tools, health calculators, online utilities, web tools, no registration tools" />
        <meta property="og:title" content="DapsiWow: Free Finance, Text & Health Online Tools - 79 Professional Calculators" />
        <meta property="og:description" content="Access 79 professional-grade online tools completely free. No registration required. Finance calculators, text processors, health trackers, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/" />
        <meta property="og:image" content="https://dapsiwow.com/logo.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DapsiWow: Free Finance, Text & Health Online Tools" />
        <meta name="twitter:description" content="Access 79 professional-grade online tools completely free. No registration required." />
        <meta name="twitter:image" content="https://dapsiwow.com/logo.svg" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "DapsiWow",
            "description": "Professional online tools platform offering 79 free utilities for business and personal use",
            "url": "https://dapsiwow.com/",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://dapsiwow.com/tools?search={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "mainEntity": {
              "@type": "ItemList",
              "name": "DapsiWow Popular Tools",
              "description": "Top 12 most popular professional online tools used by millions",
              "numberOfItems": 12,
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "item": {
                    "@type": "WebApplication",
                    "@id": "https://dapsiwow.com/tools/loan-calculator",
                    "name": "Loan Calculator",
                    "description": "Calculate monthly loan payments with interest, terms, and fees",
                    "url": "https://dapsiwow.com/tools/loan-calculator",
                    "applicationCategory": "FinanceApplication"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "item": {
                    "@type": "WebApplication",
                    "@id": "https://dapsiwow.com/tools/bmi-calculator",
                    "name": "BMI Calculator",
                    "description": "Calculate Body Mass Index with health recommendations",
                    "url": "https://dapsiwow.com/tools/bmi-calculator",
                    "applicationCategory": "HealthApplication"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "item": {
                    "@type": "WebApplication",
                    "@id": "https://dapsiwow.com/tools/word-counter",
                    "name": "Word Counter",
                    "description": "Count words, characters, and sentences in text",
                    "url": "https://dapsiwow.com/tools/word-counter",
                    "applicationCategory": "UtilitiesApplication"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 4,
                  "item": {
                    "@type": "WebApplication",
                    "@id": "https://dapsiwow.com/tools/mortgage-calculator",
                    "name": "Mortgage Calculator",
                    "description": "Calculate home mortgage payments and amortization",
                    "url": "https://dapsiwow.com/tools/mortgage-calculator",
                    "applicationCategory": "FinanceApplication"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 5,
                  "item": {
                    "@type": "WebApplication",
                    "@id": "https://dapsiwow.com/tools/password-generator",
                    "name": "Password Generator",
                    "description": "Generate secure passwords with custom criteria",
                    "url": "https://dapsiwow.com/tools/password-generator",
                    "applicationCategory": "UtilitiesApplication"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 6,
                  "item": {
                    "@type": "WebApplication",
                    "@id": "https://dapsiwow.com/tools/calorie-calculator",
                    "name": "Calorie Calculator",
                    "description": "Calculate daily calorie needs for weight goals",
                    "url": "https://dapsiwow.com/tools/calorie-calculator",
                    "applicationCategory": "HealthApplication"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 7,
                  "item": {
                    "@type": "WebApplication",
                    "@id": "https://dapsiwow.com/tools/percentage-calculator",
                    "name": "Percentage Calculator",
                    "description": "Calculate percentages, increases, and decreases",
                    "url": "https://dapsiwow.com/tools/percentage-calculator",
                    "applicationCategory": "FinanceApplication"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 8,
                  "item": {
                    "@type": "WebApplication",
                    "@id": "https://dapsiwow.com/tools/case-converter",
                    "name": "Case Converter",
                    "description": "Convert text to uppercase, lowercase, title case",
                    "url": "https://dapsiwow.com/tools/case-converter",
                    "applicationCategory": "UtilitiesApplication"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 9,
                  "item": {
                    "@type": "WebApplication",
                    "@id": "https://dapsiwow.com/tools/compound-interest-calculator",
                    "name": "Compound Interest Calculator",
                    "description": "Calculate compound interest and investment growth",
                    "url": "https://dapsiwow.com/tools/compound-interest-calculator",
                    "applicationCategory": "FinanceApplication"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 10,
                  "item": {
                    "@type": "WebApplication",
                    "@id": "https://dapsiwow.com/tools/bmr-calculator",
                    "name": "BMR Calculator",
                    "description": "Calculate Basal Metabolic Rate and energy needs",
                    "url": "https://dapsiwow.com/tools/bmr-calculator",
                    "applicationCategory": "HealthApplication"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 11,
                  "item": {
                    "@type": "WebApplication",
                    "@id": "https://dapsiwow.com/tools/text-to-qr-code",
                    "name": "QR Code Generator",
                    "description": "Generate QR codes for text, URLs, and data",
                    "url": "https://dapsiwow.com/tools/text-to-qr-code",
                    "applicationCategory": "UtilitiesApplication"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 12,
                  "item": {
                    "@type": "WebApplication",
                    "@id": "https://dapsiwow.com/tools/tip-calculator",
                    "name": "Tip Calculator",
                    "description": "Calculate tips and split bills easily",
                    "url": "https://dapsiwow.com/tools/tip-calculator",
                    "applicationCategory": "FinanceApplication"
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
            "description": "Professional online tools platform offering 79 free utilities for business and personal use including finance calculators, text converters, and health trackers.",
            "foundingDate": "2025",
            "slogan": "Free Finance, Text, Health and other Online Tools",
            "knowsAbout": [
              "Financial Calculators",
              "Text Processing Tools", 
              "Health Calculators",
              "Online Utilities",
              "Productivity Tools"
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
                "name": "What is DapsiWow?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "DapsiWow is a comprehensive platform offering 79 professional-grade online tools completely free. We provide finance calculators, text processing tools, health trackers, and more - all designed to boost productivity without requiring registration or payments."
                }
              },
              {
                "@type": "Question",
                "name": "How much does DapsiWow cost?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "DapsiWow is completely free to use. All 79 tools are available without any cost, registration, or hidden fees. We believe professional-grade tools should be accessible to everyone."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need to register to use the tools?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No registration required! You can use all our tools immediately without creating an account. Simply visit any tool page and start using it right away. Your privacy and convenience are our priorities."
                }
              },
              {
                "@type": "Question",
                "name": "What categories of tools are available?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We offer three main categories: Finance Tools (30 tools including loan, mortgage, and investment calculators), Text Tools (19 tools for word counting, case conversion, and text processing), and Health Tools (30 tools for BMI, calorie, and fitness calculations)."
                }
              },
              {
                "@type": "Question",
                "name": "Are my data and calculations secure?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolutely. Your data stays private and secure. We don't store your personal information or calculations. Most processing happens directly in your browser, ensuring your sensitive information never leaves your device."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use DapsiWow tools on mobile devices?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! All our tools are designed to work perfectly on desktop, laptop, tablet, and smartphone. The responsive design ensures optimal functionality across all screen sizes and browsers."
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
          
          {/* Enhanced Category Gateways */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4" data-testid="text-categories-title">Choose Your Category</h2>
                <p className="text-xl text-neutral-600 max-w-3xl mx-auto">Explore our comprehensive collection of professional tools organized by category</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {/* Finance Tools Gateway */}
                <Link href="/finance" className="block group">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 border-2 border-transparent hover:border-blue-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
                       data-testid="gateway-finance">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Calculator className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-800 mb-4">Finance Tools</h3>
                  <p className="text-neutral-600 mb-6 leading-relaxed">30 professional financial calculators for loans, mortgages, investments, and business planning</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-neutral-600">
                      <TrendingUp size={14} className="mr-2 text-blue-500" />
                      <span>Loan & Mortgage Calculators</span>
                    </div>
                    <div className="flex items-center text-sm text-neutral-600">
                      <TrendingUp size={14} className="mr-2 text-blue-500" />
                      <span>Investment & ROI Tools</span>
                    </div>
                    <div className="flex items-center text-sm text-neutral-600">
                      <TrendingUp size={14} className="mr-2 text-blue-500" />
                      <span>Tax & Business Calculators</span>
                    </div>
                  </div>
                    <div className="text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">Explore Finance Tools →</div>
                  </div>
                </Link>

                {/* Text Tools Gateway */}
                <Link href="/text" className="block group">
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-100 rounded-3xl p-8 border-2 border-transparent hover:border-orange-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
                       data-testid="gateway-text">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <PenTool className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-800 mb-4">Text Tools</h3>
                  <p className="text-neutral-600 mb-6 leading-relaxed">19 powerful text processing tools for counting, converting, and generating content</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-neutral-600">
                      <PenTool size={14} className="mr-2 text-orange-500" />
                      <span>Word & Character Counters</span>
                    </div>
                    <div className="flex items-center text-sm text-neutral-600">
                      <PenTool size={14} className="mr-2 text-orange-500" />
                      <span>Case & Format Converters</span>
                    </div>
                    <div className="flex items-center text-sm text-neutral-600">
                      <PenTool size={14} className="mr-2 text-orange-500" />
                      <span>QR Codes & Generators</span>
                    </div>
                  </div>
                    <div className="text-orange-600 font-semibold group-hover:text-orange-700 transition-colors">Explore Text Tools →</div>
                  </div>
                </Link>

                {/* Health Tools Gateway */}
                <Link href="/health" className="block group">
                  <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-3xl p-8 border-2 border-transparent hover:border-pink-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
                       data-testid="gateway-health">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <HeartPulse className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-800 mb-4">Health Tools</h3>
                  <p className="text-neutral-600 mb-6 leading-relaxed">30 comprehensive health calculators for fitness, nutrition, and wellness tracking</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-neutral-600">
                      <HeartPulse size={14} className="mr-2 text-pink-500" />
                      <span>BMI & Body Composition</span>
                    </div>
                    <div className="flex items-center text-sm text-neutral-600">
                      <HeartPulse size={14} className="mr-2 text-pink-500" />
                      <span>Calorie & Nutrition Tools</span>
                    </div>
                    <div className="flex items-center text-sm text-neutral-600">
                      <HeartPulse size={14} className="mr-2 text-pink-500" />
                      <span>Fitness & Wellness Trackers</span>
                    </div>
                  </div>
                    <div className="text-pink-600 font-semibold group-hover:text-pink-700 transition-colors">Explore Health Tools →</div>
                  </div>
                </Link>
              </div>
            </div>
          </section>
          
          {/* User-specific sections */}
          <FavoritesSection />
          
          {/* Trust Indicators & Quick Access */}
          <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Trust Bullets */}
              <div className="text-center mb-16">
                <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
                  <div className="flex items-center bg-white rounded-full px-6 py-3 shadow-md" data-testid="trust-bullet-free">
                    <Award className="text-green-500 mr-3" size={20} />
                    <span className="font-semibold text-neutral-700">100% Free Forever</span>
                  </div>
                  <div className="flex items-center bg-white rounded-full px-6 py-3 shadow-md" data-testid="trust-bullet-no-signup">
                    <Users className="text-blue-500 mr-3" size={20} />
                    <span className="font-semibold text-neutral-700">No Sign-up Required</span>
                  </div>
                  <div className="flex items-center bg-white rounded-full px-6 py-3 shadow-md" data-testid="trust-bullet-tools-count">
                    <Calculator className="text-purple-500 mr-3" size={20} />
                    <span className="font-semibold text-neutral-700">79 Professional Tools</span>
                  </div>
                </div>
              </div>
              
              {/* Quick Access Use Cases */}
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-6" data-testid="text-quick-access-title">Popular Use Cases</h2>
                <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-12">Get started with these commonly used tools and calculations</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
                  <a href="/tools/loan-calculator" 
                     className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-neutral-100 hover:border-blue-200"
                     data-testid="use-case-loan">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Calculator className="text-white" size={16} />
                    </div>
                    <div className="font-semibold text-neutral-800 text-sm mb-1">Calculate Loan</div>
                    <div className="text-xs text-neutral-500">Monthly payments</div>
                  </a>
                  
                  <a href="/tools/word-counter" 
                     className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-neutral-100 hover:border-orange-200"
                     data-testid="use-case-word-count">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <PenTool className="text-white" size={16} />
                    </div>
                    <div className="font-semibold text-neutral-800 text-sm mb-1">Count Words</div>
                    <div className="text-xs text-neutral-500">Text analysis</div>
                  </a>
                  
                  <a href="/tools/bmi-calculator" 
                     className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-neutral-100 hover:border-pink-200"
                     data-testid="use-case-bmi">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <HeartPulse className="text-white" size={16} />
                    </div>
                    <div className="font-semibold text-neutral-800 text-sm mb-1">Check BMI</div>
                    <div className="text-xs text-neutral-500">Health status</div>
                  </a>
                  
                  <a href="/tools/mortgage-calculator" 
                     className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-neutral-100 hover:border-blue-200"
                     data-testid="use-case-mortgage">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Calculator className="text-white" size={16} />
                    </div>
                    <div className="font-semibold text-neutral-800 text-sm mb-1">Home Mortgage</div>
                    <div className="text-xs text-neutral-500">Monthly payment</div>
                  </a>
                  
                  <a href="/tools/password-generator" 
                     className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-neutral-100 hover:border-orange-200"
                     data-testid="use-case-password">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Shield className="text-white" size={16} />
                    </div>
                    <div className="font-semibold text-neutral-800 text-sm mb-1">Generate Password</div>
                    <div className="text-xs text-neutral-500">Secure & random</div>
                  </a>
                  
                  <a href="/tools/calorie-calculator" 
                     className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-neutral-100 hover:border-pink-200"
                     data-testid="use-case-calories">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <HeartPulse className="text-white" size={16} />
                    </div>
                    <div className="font-semibold text-neutral-800 text-sm mb-1">Daily Calories</div>
                    <div className="text-xs text-neutral-500">Nutrition planning</div>
                  </a>
                </div>
                
                <div className="mt-12">
                  <a href="/tools" 
                     className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-neutral-800 to-neutral-900 text-white font-semibold rounded-xl hover:from-neutral-900 hover:to-black transition-all duration-200 shadow-lg hover:shadow-xl"
                     data-testid="link-all-tools">
                    <span>View All 79 Tools</span>
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* What is DapsiWow Section */}
          <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                  What is DapsiWow?
                </h2>
                <p className="text-xl text-neutral-600 max-w-4xl mx-auto leading-relaxed mb-8">
                  DapsiWow is your ultimate online toolkit featuring 79 carefully crafted tools completely free to use. 
                  No registration required, no hidden fees, no software downloads - just powerful, professional-grade tools 
                  that work instantly in your browser across all devices.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <Calculator className="text-blue-600" size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">30 Finance Tools</h3>
                    <p className="text-neutral-600 text-sm">Loan calculators, mortgage calculators, EMI calculators, investment tools, tax calculators, and business loan calculators</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <PenTool className="text-purple-600" size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">19 Text Tools</h3>
                    <p className="text-neutral-600 text-sm">Word counters, case converters, QR code generators, binary converters, password generators, and text processors</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <HeartPulse className="text-pink-600" size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">30 Health Tools</h3>
                    <p className="text-neutral-600 text-sm">BMI calculators, calorie calculators, pregnancy tools, fitness trackers, heart rate calculators, and wellness tools</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <PopularToolsSection />
          <CategorySection />
          
          {/* About DapsiWow Section */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
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
                      <div className="text-4xl font-bold text-blue-600 mb-2">79</div>
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
                    Your data stays private. We don't store your files or personal information. All processing happens securely 
                    in your browser or on protected servers with enterprise-grade security measures.
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
          <section className="py-20 bg-gradient-to-br from-neutral-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                  Featured Tools Spotlight
                </h2>
                <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                  Discover our most popular and powerful tools that thousands of users rely on daily
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                    <i className="fas fa-calculator text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-800 mb-4">Business Loan Calculator</h3>
                  <p className="text-neutral-600 mb-4 leading-relaxed">
                    Calculate business loan payments with origination fees, processing costs, and effective APR. 
                    Compare SBA loans, term loans, and equipment financing options.
                  </p>
                  <ul className="text-sm text-neutral-500 space-y-1 mb-6">
                    <li>• Multiple payment frequencies</li>
                    <li>• Fee calculations included</li>
                    <li>• 10+ currency support</li>
                    <li>• Detailed cost breakdown</li>
                  </ul>
                  <a href="/tools/business-loan-calculator" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                    Try Business Loan Calculator →
                  </a>
                </div>
                
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                    <i className="fas fa-file-contract text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-800 mb-4">Vehicle Lease Calculator</h3>
                  <p className="text-neutral-600 mb-4 leading-relaxed">
                    Calculate monthly lease payments for cars, trucks, and SUVs. Compare lease vs buy options with 
                    residual value estimation and money factor calculations.
                  </p>
                  <ul className="text-sm text-neutral-500 space-y-1 mb-6">
                    <li>• Residual value calculator</li>
                    <li>• Lease vs buy comparison</li>
                    <li>• Multiple lease terms</li>
                    <li>• Total cost analysis</li>
                  </ul>
                  <a href="/tools/lease-calculator" className="text-green-600 font-semibold hover:text-green-700 transition-colors">
                    Try Lease Calculator →
                  </a>
                </div>
                
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                    <i className="fas fa-home text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-800 mb-4">Mortgage Calculator</h3>
                  <p className="text-neutral-600 mb-4 leading-relaxed">
                    Calculate mortgage payments including principal, interest, taxes, insurance, and PMI. 
                    Get accurate estimates for home buying decisions.
                  </p>
                  <ul className="text-sm text-neutral-500 space-y-1 mb-6">
                    <li>• Complete payment breakdown</li>
                    <li>• PMI calculations</li>
                    <li>• Tax and insurance included</li>
                    <li>• Multiple loan terms</li>
                  </ul>
                  <a href="/tools/mortgage-calculator" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
                    Try Mortgage Calculator →
                  </a>
                </div>
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
          <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                  Trusted by Users Worldwide
                </h2>
                <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                  Join thousands of professionals, students, and individuals who rely on DapsiWow for their daily tasks
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-16">
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">1M+</div>
                  <div className="text-neutral-700 font-medium">Monthly Users</div>
                  <div className="text-xs text-neutral-500 mt-1">Growing daily</div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">79</div>
                  <div className="text-neutral-700 font-medium">Free Tools</div>
                  <div className="text-xs text-neutral-500 mt-1">Always expanding</div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">99.9%</div>
                  <div className="text-neutral-700 font-medium">Uptime</div>
                  <div className="text-xs text-neutral-500 mt-1">Reliable service</div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="text-3xl lg:text-4xl font-bold text-orange-600 mb-2">0</div>
                  <div className="text-neutral-700 font-medium">Registration</div>
                  <div className="text-xs text-neutral-500 mt-1">Start immediately</div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-xl">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-3xl font-bold text-neutral-800 mb-6">
                      Built for Everyone
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <i className="fas fa-briefcase text-blue-600 text-sm"></i>
                        </div>
                        <div>
                          <h4 className="font-semibold text-neutral-800 mb-1">Business Professionals</h4>
                          <p className="text-neutral-600 text-sm">Financial calculations, document processing, and business analysis tools</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <i className="fas fa-graduation-cap text-green-600 text-sm"></i>
                        </div>
                        <div>
                          <h4 className="font-semibold text-neutral-800 mb-1">Students & Educators</h4>
                          <p className="text-neutral-600 text-sm">Academic calculations, document editing, and research assistance tools</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <i className="fas fa-users text-purple-600 text-sm"></i>
                        </div>
                        <div>
                          <h4 className="font-semibold text-neutral-800 mb-1">Personal Use</h4>
                          <p className="text-neutral-600 text-sm">Everyday calculations, file conversions, and productivity enhancements</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <i className="fas fa-code text-orange-600 text-sm"></i>
                        </div>
                        <div>
                          <h4 className="font-semibold text-neutral-800 mb-1">Developers & Designers</h4>
                          <p className="text-neutral-600 text-sm">Image optimization, text processing, and content analysis utilities</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-[#eff3ff] rounded-2xl p-8 text-gray-800 shadow-inner">
                      <h4 className="text-2xl font-bold mb-4">Ready to Get Started?</h4>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Join over 1 million users who trust DapsiWow for their daily productivity needs. 
                        Start exploring our comprehensive toolkit today - completely free, no registration required, 
                        and works on all your devices!
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a 
                          href="/tools" 
                          className="inline-block bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-lg"
                        >
                          Explore All 180+ Tools
                        </a>
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
                  Everything you need to know about DapsiWow and our free online tools
                </p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                      Is DapsiWow really completely free?
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Yes! All 180+ tools on DapsiWow are completely free to use. There are no hidden fees, 
                      premium tiers, subscription plans, or usage limits. We believe everyone should have access 
                      to professional-grade tools without financial barriers.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                      Do I need to create an account or register?
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      No registration required! Simply visit our website and start using any tool immediately. 
                      We respect your privacy and don't require personal information to access our services. 
                      Just bookmark our site and return whenever you need our tools.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                      Are my files and data secure?
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Absolutely. We prioritize your privacy and security. Most processing happens directly in your 
                      browser, and we don't store your files or personal data. For tools that require server processing, 
                      files are processed securely and deleted immediately after use.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                      Can I use these tools on my mobile device?
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Yes! All our tools are designed with a mobile-first approach and work perfectly on smartphones, 
                      tablets, laptops, and desktops. The responsive design ensures optimal functionality across all 
                      screen sizes and devices.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                      What types of tools do you offer?
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      We offer 180+ tools across 6 main categories: Finance (loan calculators, currency converters), 
                      Image (resize, compress, edit), Text (word counters, generators), 
                      content analysis and optimization, and Health (BMI, calorie calculators). New tools are added regularly.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                      How accurate are the financial calculators?
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Our financial calculators use industry-standard formulas and are designed to provide accurate 
                      estimates for planning purposes. However, for official financial decisions, we recommend 
                      consulting with qualified financial professionals who can consider your specific circumstances.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                      Do you support multiple currencies and formats?
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Yes! Many of our tools support multiple currencies, date formats, and international standards. 
                      Our currency converter includes 30+ global currencies with real-time exchange rates, and our 
                      calculators support various regional formats.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                      How can I get help or report issues?
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      We're here to help! You can reach out through our contact page for support, feature requests, 
                      or to report any issues. We actively maintain and improve our tools based on user feedback and 
                      strive to respond to inquiries promptly.
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

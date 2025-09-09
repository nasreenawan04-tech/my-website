import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import PopularToolsSection from '@/components/PopularToolsSection';
import CategorySection from '@/components/CategorySection';
import Footer from '@/components/Footer';
import FavoritesSection from '@/components/FavoritesSection';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>DapsiWow - 150+ Free Online Tools for Business & Personal Use | No Registration Required</title>
        <meta name="description" content="Discover 150+ powerful free online tools for finance calculations, PDF editing, text analysis, and health monitoring. Professional-grade utilities with no sign-up required, working on all devices worldwide." />
        <meta name="keywords" content="DapsiWow, dapsiwow, free online tools, PDF converter, loan calculator, mortgage calculator, business loan calculator, lease calculator, productivity tools, finance calculators, text tools, health calculators, online utilities, web tools, no registration tools" />
        <meta property="og:title" content="DapsiWow - 150+ Free Online Tools for Business & Personal Use" />
        <meta property="og:description" content="Discover 150+ powerful free online tools for finance calculations, PDF editing, text analysis, and health monitoring. Professional-grade utilities with no sign-up required." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "DapsiWow",
            "description": "Professional online tools platform offering 150+ free utilities for business and personal use",
            "url": "https://dapsiwow.com/",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://dapsiwow.com/all-tools?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen flex flex-col" data-testid="page-home">
        <Header />
        <main className="flex-1">
          <HeroSection />
          
          {/* User-specific sections - shown if user has favorites */}
          <FavoritesSection />
          
          {/* What is DapsiWow Section */}
          <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                  What is DapsiWow?
                </h2>
                <p className="text-xl text-neutral-600 max-w-4xl mx-auto leading-relaxed mb-8">
                  DapsiWow is your ultimate online toolkit featuring 150+ professional-grade tools completely free to use. 
                  No registration required, no hidden fees, no software downloads - just powerful tools that work instantly 
                  in your browser across all devices.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <i className="fas fa-calculator text-blue-600 text-xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Finance Tools</h3>
                    <p className="text-neutral-600 text-sm">Calculators for loans, mortgages, investments, taxes, and more financial planning needs</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <i className="fas fa-file-pdf text-red-600 text-xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">PDF Tools</h3>
                    <p className="text-neutral-600 text-sm">Convert, merge, split, compress, and edit PDF files with professional results</p>
                  </div>
                  
                  
                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <i className="fas fa-font text-purple-600 text-xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Text Tools</h3>
                    <p className="text-neutral-600 text-sm">Word counters, case converters, grammar checkers, and content generation tools</p>
                  </div>
                  
                  
                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <i className="fas fa-heartbeat text-pink-600 text-xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Health Tools</h3>
                    <p className="text-neutral-600 text-sm">BMI calculators, calorie counters, and wellness tracking tools for healthy living</p>
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
                    Whether you're a business owner calculating loan payments, a student working with PDFs, or someone monitoring their health - 
                    our tools deliver professional results without the professional price tag.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 shadow-inner">
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div>
                      <div className="text-4xl font-bold text-blue-600 mb-2">150+</div>
                      <div className="text-neutral-700 font-medium">Free Tools</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-green-600 mb-2">0</div>
                      <div className="text-neutral-700 font-medium">Registration Required</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-purple-600 mb-2">4</div>
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
                    <i className="fas fa-bolt text-white text-2xl"></i>
                  </div>
                  <h4 className="text-xl font-bold text-neutral-800 mb-4">Lightning Fast</h4>
                  <p className="text-neutral-600 leading-relaxed">
                    Our tools are optimized for speed and performance. Get results instantly without waiting for downloads, 
                    installations, or lengthy processing times. Built with modern web technologies for optimal performance.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-shield-alt text-white text-2xl"></i>
                  </div>
                  <h4 className="text-xl font-bold text-neutral-800 mb-4">Secure & Private</h4>
                  <p className="text-neutral-600 leading-relaxed">
                    Your data stays private. We don't store your files or personal information. All processing happens securely 
                    in your browser or on protected servers with enterprise-grade security measures.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-mobile-alt text-white text-2xl"></i>
                  </div>
                  <h4 className="text-xl font-bold text-neutral-800 mb-4">Works Everywhere</h4>
                  <p className="text-neutral-600 leading-relaxed">
                    Access our tools from any device - desktop, laptop, tablet, or smartphone. Responsive design ensures 
                    perfect functionality across all screen sizes and browsers.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-globe text-white text-2xl"></i>
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
                  Join thousands of professionals, students, and individuals who rely on ToolForge for their daily tasks
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-16">
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">1M+</div>
                  <div className="text-neutral-700 font-medium">Monthly Users</div>
                  <div className="text-xs text-neutral-500 mt-1">Growing daily</div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">150+</div>
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
                          <p className="text-neutral-600 text-sm">Image optimization, text processing, and SEO analysis utilities</p>
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
                      PDF (merge, split, convert), Image (resize, compress, edit), Text (word counters, generators), 
                      SEO (analysis, optimization), and Health (BMI, calorie calculators). New tools are added regularly.
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

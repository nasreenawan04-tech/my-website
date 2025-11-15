import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'wouter';
import { Heart, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { tools } from '@/data/tools';
import { searchAndFilterTools } from '@/lib/search';

const HealthTools = () => {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTools, setFilteredTools] = useState(tools.filter(tool => tool.category === 'health'));

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const searchParam = urlParams.get('search') || '';
    setSearchQuery(searchParam);
  }, [location]);

  // Filter tools based on search
  useEffect(() => {
    const filtered = searchAndFilterTools(searchQuery, 'health');
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
        <title>Health Tools - Free Health & Wellness Calculators</title>
        <meta name="description" content="Access 30+ free health calculators including BMI, calorie, pregnancy, body fat, and fitness tools. Track your wellness journey with instant, accurate results." />
        <meta name="keywords" content="health tools, BMI calculator, calorie calculator, pregnancy calculator, fitness tools, health calculators, body fat calculator, ideal weight calculator" />
        <link rel="canonical" href="https://dapsiwow.com/health-tools" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <meta name="publisher" content="DapsiWow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/health-tools" />
        <meta property="og:title" content="Health Tools - Free Health & Wellness Calculators" />
        <meta property="og:description" content="Access 30+ free health calculators including BMI, calorie, pregnancy, and fitness tools. Track your wellness with instant results." />
        <meta property="og:image" content="https://dapsiwow.com/images/health-tools-og.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="DapsiWow Health Tools - Free Health Calculators" />
        <meta property="og:site_name" content="DapsiWow" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://dapsiwow.com/health-tools" />
        <meta name="twitter:title" content="Health Tools - Free Health & Wellness Calculators" />
        <meta name="twitter:description" content="Access 30+ free health calculators for BMI, calories, pregnancy and more. Instant results, no registration required." />
        <meta name="twitter:image" content="https://dapsiwow.com/images/health-tools-og.jpg" />
        <meta name="twitter:image:alt" content="DapsiWow Health Tools Collection" />
        
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
                "@id": "https://dapsiwow.com/health-tools",
                "url": "https://dapsiwow.com/health-tools",
                "name": "Health Tools - Free Health & Wellness Calculators",
                "description": "Access 30+ free health calculators including BMI, calorie, pregnancy, body fat, and fitness tools. Track your wellness journey with instant, accurate results.",
                "inLanguage": "en-US",
                "isPartOf": {
                  "@id": "https://dapsiwow.com/#website"
                },
                "breadcrumb": {
                  "@id": "https://dapsiwow.com/health-tools#breadcrumb"
                },
                "mainEntity": {
                  "@id": "https://dapsiwow.com/health-tools#collection"
                }
              },
              {
                "@type": "CollectionPage",
                "@id": "https://dapsiwow.com/health-tools#collection",
                "name": "Health Tools Collection",
                "description": "Comprehensive collection of 30+ free health and fitness calculators",
                "url": "https://dapsiwow.com/health-tools",
                "numberOfItems": 30,
                "itemListElement": [
                  {
                    "@type": "SoftwareApplication",
                    "name": "BMI Calculator",
                    "url": "https://dapsiwow.com/tools/bmi-calculator",
                    "description": "Calculate body mass index and health category",
                    "applicationCategory": "HealthApplication",
                    "offers": {
                      "@type": "Offer",
                      "price": "0",
                      "priceCurrency": "USD"
                    }
                  },
                  {
                    "@type": "SoftwareApplication",
                    "name": "Calorie Calculator",
                    "url": "https://dapsiwow.com/tools/calorie-calculator",
                    "description": "Calculate daily calorie needs for weight goals",
                    "applicationCategory": "HealthApplication",
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
                "@id": "https://dapsiwow.com/health-tools#breadcrumb",
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
                    "name": "Health Tools",
                    "item": "https://dapsiwow.com/health-tools"
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

      <div className="min-h-screen flex flex-col" data-testid="page-health-tools">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-pink-600 via-rose-500 to-red-700 text-white py-16 relative overflow-hidden">
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
                className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-gradient-to-br from-pink-400/10 to-rose-400/10 blur-xl"
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
                className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-gradient-to-br from-rose-400/10 to-red-400/10 blur-xl"
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
                <Heart className="w-12 h-12 text-white" />
              </motion.div>
              <motion.h1 
                className="text-4xl sm:text-5xl font-bold mb-4"
                data-testid="health-page-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              >
                Health Tools
              </motion.h1>
              <motion.p 
                className="text-xl text-pink-100 mb-8 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              >
                30+ free health and fitness tools to track, calculate, and improve your wellbeing
              </motion.p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search health tools..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full py-4 px-6 pr-16 text-lg text-neutral-800 bg-white rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-200 transition-all duration-200"
                    data-testid="input-search-health-tools"
                  />
                  <div className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl flex items-center pointer-events-none">
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
                <p className="text-neutral-600 text-center" data-testid="health-results-count">
                  Showing {filteredTools.length} health tools
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>

              {/* Tools Grid */}
              {filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8" data-testid="grid-health-tools">
                  {filteredTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16" data-testid="empty-state-no-tools">
                  <i className="fas fa-search text-6xl text-neutral-300 mb-4"></i>
                  <h3 className="text-2xl font-bold text-neutral-600 mb-2">No health tools found</h3>
                  <p className="text-neutral-500">
                    Try adjusting your search query.
                  </p>
                </div>
              )}

              {/* Popular Tools Section */}
              <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-6 text-center">Popular Health Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div 
                    className="text-center p-4 bg-pink-50 rounded-xl cursor-pointer hover:bg-pink-100 transition-colors duration-200"
                    onClick={() => setLocation('/tools/bmi-calculator')}
                  >
                    <i className="fas fa-weight text-2xl text-pink-600 mb-2"></i>
                    <h3 className="font-semibold text-neutral-800">BMI Calculator</h3>
                    <p className="text-sm text-neutral-600">Calculate body mass index</p>
                  </div>
                  <div 
                    className="text-center p-4 bg-red-50 rounded-xl cursor-pointer hover:bg-red-100 transition-colors duration-200"
                    onClick={() => setLocation('/tools/calorie-calculator')}
                  >
                    <i className="fas fa-fire text-2xl text-red-600 mb-2"></i>
                    <h3 className="font-semibold text-neutral-800">Calorie Calculator</h3>
                    <p className="text-sm text-neutral-600">Calculate daily calories</p>
                  </div>
                  <div 
                    className="text-center p-4 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                    onClick={() => setLocation('/tools/pregnancy-due-date-calculator')}
                  >
                    <i className="fas fa-baby text-2xl text-blue-600 mb-2"></i>
                    <h3 className="font-semibold text-neutral-800">Pregnancy Due Date Calculator</h3>
                    <p className="text-sm text-neutral-600">Calculate expected delivery date and pregnancy milestones</p>
                  </div>
                  <div 
                    className="text-center p-4 bg-purple-50 rounded-xl cursor-pointer hover:bg-purple-100 transition-colors duration-200"
                    onClick={() => setLocation('/tools/ideal-weight-calculator')}
                  >
                    <i className="fas fa-balance-scale text-2xl text-purple-600 mb-2"></i>
                    <h3 className="font-semibold text-neutral-800">Ideal Weight Calculator</h3>
                    <p className="text-sm text-neutral-600">Calculate ideal body weight using multiple proven formulas</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Introduction Section */}
          <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800 mb-6 text-center">Transform Your Health Journey with Smart Calculators</h2>
              
              <div className="space-y-6 text-neutral-600 text-lg leading-relaxed">
                <p>
                  Making informed health decisions starts with accurate data. Our comprehensive suite of 30+ free health and fitness calculators empowers you to track, monitor, and optimize your wellness journey with precision and confidence.
                </p>
                
                <h3 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">What Are Health Calculators?</h3>
                <p>
                  Health calculators are specialized tools that use scientifically-validated formulas to provide instant insights about your body composition, nutritional needs, fitness progress, pregnancy milestones, and overall wellness metrics. From BMI and body fat percentage to calorie requirements and fertility windows, our tools transform complex medical calculations into easy-to-understand results.
                </p>
                
                <h3 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">Why Choose Our Health Tools?</h3>
                <ul className="list-disc pl-6 space-y-3">
                  <li><strong>Medical-Grade Accuracy:</strong> All formulas are verified by healthcare professionals and based on peer-reviewed research</li>
                  <li><strong>Instant Results:</strong> Get comprehensive health insights in seconds, no waiting for appointments</li>
                  <li><strong>Privacy First:</strong> Calculations happen in your browser - your health data never leaves your device</li>
                  <li><strong>Completely Free:</strong> Unlimited access to all calculators with no hidden fees or subscriptions</li>
                  <li><strong>Mobile Optimized:</strong> Track your health on any device, anywhere, anytime</li>
                  <li><strong>Easy to Understand:</strong> Results include clear explanations and actionable recommendations</li>
                </ul>
                
                <h3 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">Who Benefits from Health Tools?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-neutral-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-neutral-800 mb-2">Fitness Enthusiasts</h4>
                    <p className="text-neutral-600">Track body composition, calculate macros, monitor heart rate zones, and measure workout intensity for optimal training results.</p>
                  </div>
                  <div className="bg-neutral-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-neutral-800 mb-2">Expecting Parents</h4>
                    <p className="text-neutral-600">Calculate due dates, track pregnancy milestones, monitor weight gain, and plan for your baby's arrival with confidence.</p>
                  </div>
                  <div className="bg-neutral-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-neutral-800 mb-2">Weight Management</h4>
                    <p className="text-neutral-600">Set realistic goals, calculate ideal weight ranges, determine calorie needs, and track progress towards your target weight.</p>
                  </div>
                  <div className="bg-neutral-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-neutral-800 mb-2">Health Conscious Individuals</h4>
                    <p className="text-neutral-600">Monitor vital health metrics, assess cardiovascular risk, track hydration needs, and maintain optimal wellness.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How to Use Section */}
          <section className="py-16 bg-neutral-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800 mb-12 text-center">How to Use Our Health Calculators</h2>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-800 mb-2">Select Your Calculator</h3>
                      <p className="text-neutral-600">Browse our collection of health tools above or use the search bar to find the specific calculator you need. From BMI to pregnancy calculators, we have 30+ options.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-800 mb-2">Enter Your Health Data</h3>
                      <p className="text-neutral-600">Input your measurements, age, gender, activity level, or other relevant information. All inputs are clearly labeled with helpful tooltips and measurement units.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-800 mb-2">Get Instant Results</h3>
                      <p className="text-neutral-600">View your personalized health metrics with detailed explanations, category classifications (e.g., healthy range, underweight, overweight), and visual charts where applicable.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-800 mb-2">Track and Share Your Progress</h3>
                      <p className="text-neutral-600">Save results to your account, download PDF reports, or share with your healthcare provider. Track changes over time to monitor your health journey.</p>
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
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Are these health calculators medically accurate?</h3>
                  <p className="text-neutral-600">Yes, all our calculators use scientifically-validated formulas approved by medical professionals. However, they provide estimates for informational purposes and should not replace professional medical advice or diagnosis.</p>
                </div>
                <div className="border-b border-neutral-200 pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Do I need to create an account to use the calculators?</h3>
                  <p className="text-neutral-600">No account is required for basic calculations. However, creating a free account allows you to save results, track changes over time, and access your data across multiple devices.</p>
                </div>
                <div className="border-b border-neutral-200 pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Is my health information private and secure?</h3>
                  <p className="text-neutral-600">Absolutely. All calculations are performed locally in your browser, and we don't store your health data unless you explicitly save it to your account. We use bank-level encryption for all data transmission and storage.</p>
                </div>
                <div className="border-b border-neutral-200 pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Can I use these calculators on my smartphone?</h3>
                  <p className="text-neutral-600">Yes! All our health tools are fully responsive and work perfectly on smartphones, tablets, and desktop computers. Track your health metrics on the go.</p>
                </div>
                <div className="border-b border-neutral-200 pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">How is BMI calculated and what does it mean?</h3>
                  <p className="text-neutral-600">BMI (Body Mass Index) is calculated by dividing your weight in kilograms by your height in meters squared. It categorizes you as underweight, normal weight, overweight, or obese, though it doesn't account for muscle mass or body composition.</p>
                </div>
                <div className="border-b border-neutral-200 pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Are calorie calculator results personalized?</h3>
                  <p className="text-neutral-600">Yes, our calorie calculator considers your age, gender, weight, height, activity level, and goals to provide personalized daily calorie recommendations for weight loss, maintenance, or gain.</p>
                </div>
                <div className="border-b border-neutral-200 pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Can I save and compare my health metrics over time?</h3>
                  <p className="text-neutral-600">Yes! With a free account, you can save unlimited calculations, track trends with visual charts, and compare results over weeks, months, or years to monitor your health progress.</p>
                </div>
                <div className="pb-6">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Do you offer calculators for specific medical conditions?</h3>
                  <p className="text-neutral-600">Yes, we provide specialized calculators for diabetes management, cardiovascular risk assessment, kidney function, medication dosing, and various other medical applications. Always consult your healthcare provider for medical advice.</p>
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
                  <span className="text-pink-600 font-semibold hover:underline">Explore Finance Tools →</span>
                </a>
                <a href="/text-tools" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Text Tools</h3>
                  <p className="text-neutral-600 mb-4">Use 30+ text processing tools including word counter, case converter, and text analyzers.</p>
                  <span className="text-pink-600 font-semibold hover:underline">Explore Text Tools →</span>
                </a>
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="py-16 bg-gradient-to-r from-pink-600 via-rose-500 to-red-700 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Start Your Wellness Journey Today</h2>
              <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
                Take control of your health with our free, accurate, and easy-to-use health calculators. Track your progress and achieve your wellness goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#tools" className="bg-white text-pink-600 px-8 py-3 rounded-lg font-semibold hover:bg-pink-50 transition-colors">
                  Browse All Tools
                </a>
                <a href="/signup" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-pink-600 transition-colors">
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

export default HealthTools;
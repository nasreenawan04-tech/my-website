
import { useEffect, useState, lazy, Suspense, createContext } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { tools, type Tool } from '@/data/tools';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PageLoadingSpinner } from '@/components/ui/loading-spinner';

// Context to override canonical URLs when rendered through ToolPage
export const ToolPageContext = createContext<{ canonicalOverride?: string }>({});

// Map of tool IDs to their corresponding rich components
const toolComponents = {
  // Finance Tools
  'loan-calculator': lazy(() => import('@/pages/loan-calculator')),
  'mortgage-calculator': lazy(() => import('@/pages/mortgage-calculator')),
  'emi-calculator': lazy(() => import('@/pages/emi-calculator')),
  'business-loan-calculator': lazy(() => import('@/pages/business-loan-calculator')),
  'compound-interest-calculator': lazy(() => import('@/pages/compound-interest-calculator')),
  'simple-interest-calculator': lazy(() => import('@/pages/simple-interest-calculator')),
  'roi-calculator': lazy(() => import('@/pages/roi-calculator')),
  'tax-calculator': lazy(() => import('@/pages/tax-calculator')),
  'salary-to-hourly-calculator': lazy(() => import('@/pages/salary-to-hourly-calculator')),
  'tip-calculator': lazy(() => import('@/pages/tip-calculator')),
  'inflation-calculator': lazy(() => import('@/pages/inflation-calculator')),
  'savings-goal-calculator': lazy(() => import('@/pages/savings-goal-calculator')),
  'debt-payoff-calculator': lazy(() => import('@/pages/debt-payoff-calculator')),
  'net-worth-calculator': lazy(() => import('@/pages/net-worth-calculator')),
  'stock-profit-calculator': lazy(() => import('@/pages/stock-profit-calculator')),
  'retirement-calculator': lazy(() => import('@/pages/retirement-calculator')),
  'sip-calculator': lazy(() => import('@/pages/sip-calculator')),
  'investment-return-calculator': lazy(() => import('@/pages/investment-return-calculator')),
  'dti-ratio-calculator': lazy(() => import('@/pages/dti-ratio-calculator')),
  'break-even-calculator': lazy(() => import('@/pages/break-even-calculator')),
  'car-loan-calculator': lazy(() => import('@/pages/car-loan-calculator')),
  'home-loan-calculator': lazy(() => import('@/pages/home-loan-calculator')),
  'education-loan-calculator': lazy(() => import('@/pages/education-loan-calculator')),
  'credit-card-interest-calculator': lazy(() => import('@/pages/credit-card-interest-calculator')),
  'lease-calculator': lazy(() => import('@/pages/lease-calculator')),
  'percentage-calculator': lazy(() => import('@/pages/percentage-calculator')),
  'discount-calculator': lazy(() => import('@/pages/discount-calculator')),
  'vat-gst-calculator': lazy(() => import('@/pages/vat-gst-calculator')),
  'paypal-fee-calculator': lazy(() => import('@/pages/paypal-fee-calculator')),
  'currency-percentage-change-calculator': lazy(() => import('@/pages/currency-percentage-change-calculator')),
  'future-value-investment-calculator': lazy(() => import('@/pages/future-value-investment-calculator')),
  'budget-calculator': lazy(() => import('@/pages/budget-calculator')),
  'loan-comparison-calculator': lazy(() => import('@/pages/loan-comparison-calculator')),

  // Health Tools
  'bmi-calculator': lazy(() => import('@/pages/bmi-calculator')),
  'bmr-calculator': lazy(() => import('@/pages/bmr-calculator')),
  'bmr-calorie-calculator': lazy(() => import('@/pages/bmr-calorie-calculator')),
  'calorie-calculator': lazy(() => import('@/pages/calorie-calculator')),
  'body-fat-calculator': lazy(() => import('@/pages/body-fat-calculator')),
  'ideal-weight-calculator': lazy(() => import('@/pages/ideal-weight-calculator')),
  'pregnancy-due-date-calculator': lazy(() => import('@/pages/pregnancy-due-date-calculator')),
  'water-intake-calculator': lazy(() => import('@/pages/water-intake-calculator')),
  'protein-intake-calculator': lazy(() => import('@/pages/protein-intake-calculator')),
  'carb-calculator': lazy(() => import('@/pages/carb-calculator')),
  'keto-macro-calculator': lazy(() => import('@/pages/keto-macro-calculator')),
  'intermittent-fasting-timer': lazy(() => import('@/pages/intermittent-fasting-timer')),
  'daily-step-calorie-converter': lazy(() => import('@/pages/daily-step-calorie-converter')),
  'heart-rate-calculator': lazy(() => import('@/pages/heart-rate-calculator')),
  'max-heart-rate-calculator': lazy(() => import('@/pages/max-heart-rate-calculator')),
  'blood-pressure-tracker': lazy(() => import('@/pages/blood-pressure-tracker')),
  'sleep-calculator': lazy(() => import('@/pages/sleep-calculator')),
  'sleep-quality-calculator': lazy(() => import('@/pages/sleep-quality-calculator')),
  'ovulation-calculator': lazy(() => import('@/pages/ovulation-calculator')),
  'baby-growth-chart': lazy(() => import('@/pages/baby-growth-chart')),
  'tdee-calculator': lazy(() => import('@/pages/tdee-calculator')),
  'lean-body-mass-calculator': lazy(() => import('@/pages/lean-body-mass-calculator')),
  'waist-to-height-ratio-calculator': lazy(() => import('@/pages/waist-to-height-ratio-calculator')),
  'whr-calculator': lazy(() => import('@/pages/whr-calculator')),
  'life-expectancy-calculator': lazy(() => import('@/pages/life-expectancy-calculator')),
  'cholesterol-risk-calculator': lazy(() => import('@/pages/cholesterol-risk-calculator')),
  'running-pace-calculator': lazy(() => import('@/pages/running-pace-calculator')),
  'cycling-speed-calculator': lazy(() => import('@/pages/cycling-speed-calculator')),
  'swimming-calorie-calculator': lazy(() => import('@/pages/swimming-calorie-calculator')),
  'alcohol-calorie-calculator': lazy(() => import('@/pages/alcohol-calorie-calculator')),
  'smoking-cost-calculator': lazy(() => import('@/pages/smoking-cost-calculator')),
  'body-water-percentage-calculator': lazy(() => import('@/pages/body-water-percentage-calculator')),
  'hydration-calculator': lazy(() => import('@/pages/hydration-calculator')),

  // Text Tools
  'word-counter': lazy(() => import('@/pages/word-counter')),
  'character-counter': lazy(() => import('@/pages/character-counter')),
  'sentence-counter': lazy(() => import('@/pages/sentence-counter')),
  'paragraph-counter': lazy(() => import('@/pages/paragraph-counter')),
  'case-converter': lazy(() => import('@/pages/case-converter')),
  'password-generator': lazy(() => import('@/pages/password-generator')),
  'fake-name-generator': lazy(() => import('@/pages/fake-name-generator')),
  'username-generator': lazy(() => import('@/pages/username-generator')),
  'fake-address-generator': lazy(() => import('@/pages/fake-address-generator')),
  'qr-text-generator': lazy(() => import('@/pages/qr-text-generator')),
  'font-style-changer': lazy(() => import('@/pages/font-style-changer')),
  'reverse-text-tool': lazy(() => import('@/pages/reverse-text-tool')),
  'text-to-qr-code': lazy(() => import('@/pages/text-to-qr-code')),
  'text-to-binary-converter': lazy(() => import('@/pages/text-to-binary-converter')),
  'binary-to-text-converter': lazy(() => import('@/pages/binary-to-text-converter')),
  'decimal-to-text-converter': lazy(() => import('@/pages/decimal-to-text-converter')),
  'text-to-decimal-converter': lazy(() => import('@/pages/text-to-decimal-converter')),
  'qr-code-scanner': lazy(() => import('@/pages/qr-code-scanner')),
  'markdown-to-html': lazy(() => import('@/pages/markdown-to-html')),
  'lorem-ipsum-generator': lazy(() => import('@/pages/lorem-ipsum-generator')),
  'hex-to-text-converter': lazy(() => import('@/pages/hex-to-text-converter')),
  'text-to-hex-converter': lazy(() => import('@/pages/text-to-hex-converter')),
  'duplicate-line-remover': lazy(() => import('@/pages/duplicate-line-remover')),
  'text-scrambler': lazy(() => import('@/pages/text-scrambler')),
  'text-diff-checker': lazy(() => import('@/pages/text-diff-checker')),
  'text-pattern-generator': lazy(() => import('@/pages/text-pattern-generator')),
  'text-formatter-beautifier': lazy(() => import('@/pages/text-formatter-beautifier')),
  'password-strength-checker': lazy(() => import('@/pages/password-strength-checker')),
  'base64-encoder-decoder': lazy(() => import('@/pages/base64-encoder-decoder')),
  'text-statistics-analyzer': lazy(() => import('@/pages/text-statistics-analyzer')),
  'url-extractor': lazy(() => import('@/pages/url-extractor')),
  'text-cleaner-formatter': lazy(() => import('@/pages/text-cleaner-formatter')),
  'text-summarizer': lazy(() => import('@/pages/text-summarizer')),
};

const ToolPage = () => {
  const [location] = useLocation();
  const [tool, setTool] = useState<Tool | null>(null);
  const [ToolComponent, setToolComponent] = useState<React.ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Extract tool ID from URL path like /tools/loan-calculator
    const pathParts = location.split('/');
    const toolId = pathParts[2]; // tools/[toolId]
    
    if (toolId) {
      const foundTool = tools.find(t => t.id === toolId);
      setTool(foundTool || null);
      
      // Check if this tool has a dedicated rich component
      if (foundTool && toolComponents[toolId as keyof typeof toolComponents]) {
        setIsLoading(true);
        const LazyComponent = toolComponents[toolId as keyof typeof toolComponents];
        // React.lazy components are directly usable, no need to call them
        setToolComponent(() => LazyComponent);
        setIsLoading(false);
      } else {
        setToolComponent(null);
        setIsLoading(false);
      }
    } else {
      setTool(null);
      setToolComponent(null);
      setIsLoading(false);
    }
  }, [location]);

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  if (!tool) {
    return (
      <div className="min-h-screen flex flex-col">
        <Helmet>
          <title>Tool Not Found - 404 Error | DapsiWow</title>
          <meta name="description" content="The tool you're looking for doesn't exist. Explore our 180+ free online tools for finance, text processing, and health calculations." />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <Header />
        <main className="flex-1 bg-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-neutral-800 mb-4">Tool Not Found</h1>
            <p className="text-neutral-600 mb-8">The tool you're looking for doesn't exist or isn't available yet.</p>
            <a 
              href="/tools"
              className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Browse All Tools
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If tool exists and has a rich component, render it with canonical override
  if (ToolComponent) {
    return (
      <ToolPageContext.Provider value={{ canonicalOverride: `https://dapsiwow.com/tools/${tool.id}` }}>
        <Suspense fallback={<PageLoadingSpinner />}>
          <ToolComponent />
        </Suspense>
      </ToolPageContext.Provider>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{tool.name} - {tool.description} | DapsiWow</title>
        <meta name="description" content={`${tool.description}. Free online ${tool.name.toLowerCase()} tool. Easy to use, no registration required.`} />
        <meta name="keywords" content={`${tool.name.toLowerCase()}, ${tool.category.toLowerCase()} tool, free online tool, calculator, converter`} />
        <meta property="og:title" content={`${tool.name} - ${tool.description} | DapsiWow`} />
        <meta property="og:description" content={`${tool.description}. Free online ${tool.name.toLowerCase()} tool.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://dapsiwow.com/tools/${tool.id}`} />
        <link rel="canonical" href={`https://dapsiwow.com/tools/${tool.id}`} />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <Header />
      
      <main className="flex-1 bg-neutral-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className={`${tool.icon} text-3xl`}></i>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              {tool.name}
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {tool.description}
            </p>
            {tool.isPopular && (
              <div className="inline-flex items-center px-4 py-2 bg-yellow-500 bg-opacity-20 text-yellow-100 rounded-full text-sm font-medium">
                <i className="fas fa-star mr-2"></i>
                Popular Tool
              </div>
            )}
          </div>
        </section>

        {/* Tool Content */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">
                  {tool.name} - Coming Soon
                </h2>
                <p className="text-neutral-600 mb-6">
                  We're working hard to bring you this amazing tool. It will be available soon!
                </p>
                
                {/* Placeholder content */}
                <div className="bg-neutral-100 rounded-xl p-12 mb-8">
                  <i className={`${tool.icon} text-6xl text-neutral-400 mb-4`}></i>
                  <p className="text-neutral-500">
                    Tool interface will be available here once development is complete.
                  </p>
                </div>

                {/* Tool Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-bolt text-blue-600"></i>
                    </div>
                    <h3 className="font-semibold text-neutral-800 mb-2">Fast & Efficient</h3>
                    <p className="text-sm text-neutral-600">Get results instantly with our optimized algorithms</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-shield-alt text-green-600"></i>
                    </div>
                    <h3 className="font-semibold text-neutral-800 mb-2">Secure & Private</h3>
                    <p className="text-sm text-neutral-600">Your data is processed securely and never stored</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-mobile-alt text-purple-600"></i>
                    </div>
                    <h3 className="font-semibold text-neutral-800 mb-2">Mobile Friendly</h3>
                    <p className="text-sm text-neutral-600">Works perfectly on all devices and screen sizes</p>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href={`/${tool.category}-tools`}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Browse {tool.category.charAt(0).toUpperCase() + tool.category.slice(1)} Tools
                  </a>
                  <a
                    href="/tools"
                    className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    View All Tools
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ToolPage;

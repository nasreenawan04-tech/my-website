
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
  'loan-calculator': lazy(() => import('@/pages/loan-calculator')),
  'mortgage-calculator': lazy(() => import('@/pages/mortgage-calculator')),
  'emi-calculator': lazy(() => import('@/pages/emi-calculator')),
  'bmi-calculator': lazy(() => import('@/pages/bmi-calculator')),
  'tax-calculator': lazy(() => import('@/pages/tax-calculator')),
  'compound-interest-calculator': lazy(() => import('@/pages/compound-interest-calculator')),
  'simple-interest-calculator': lazy(() => import('@/pages/simple-interest-calculator')),
  'roi-calculator': lazy(() => import('@/pages/roi-calculator')),
  'word-counter': lazy(() => import('@/pages/word-counter')),
  'character-counter': lazy(() => import('@/pages/character-counter')),
  // Add more existing components as needed
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
        toolComponents[toolId as keyof typeof toolComponents]()
          .then((module) => {
            setToolComponent(() => module.default);
            setIsLoading(false);
          })
          .catch(() => {
            setToolComponent(null);
            setIsLoading(false);
          });
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
        <meta name="robots" content="noindex, follow" />
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


import { useEffect, useState, lazy, Suspense } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { tools, type Tool } from '@/data/tools';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PageLoadingSpinner } from '@/components/ui/loading-spinner';
import ToolErrorBoundary from '@/components/ToolErrorBoundary';
import ProgressiveLoader from '@/components/ProgressiveLoader';
import NativeAd from '@/components/NativeAd';
import NotFound from '@/pages/not-found';
import { useRecentTools } from '@/hooks/use-recent-tools';
import { ToolPageContext } from '@/contexts/ToolPageContext';
import { ToolCalculationHistory } from '@/components/ToolCalculationHistory';
import { SearchIntentSection } from '@/components/seo/SearchIntentSection';

// Map of tool IDs to their corresponding rich components
const toolComponents = {
  // Finance Tools (8)
  'loan-calculator': lazy(() => import('@/pages/loan-calculator')),
  'mortgage-calculator': lazy(() => import('@/pages/mortgage-calculator')),
  'emi-calculator': lazy(() => import('@/pages/emi-calculator')),
  'business-loan-calculator': lazy(() => import('@/pages/business-loan-calculator')),
  'compound-interest-calculator': lazy(() => import('@/pages/compound-interest-calculator')),
  'simple-interest-calculator': lazy(() => import('@/pages/simple-interest-calculator')),
  'car-loan-calculator': lazy(() => import('@/pages/car-loan-calculator')),
  'home-loan-calculator': lazy(() => import('@/pages/home-loan-calculator')),

  // Health Tools (8)
  'bmi-calculator': lazy(() => import('@/pages/bmi-calculator')),
  'calorie-calculator': lazy(() => import('@/pages/calorie-calculator')),
  'body-fat-calculator': lazy(() => import('@/pages/body-fat-calculator')),
  'water-intake-calculator': lazy(() => import('@/pages/water-intake-calculator')),
  'protein-intake-calculator': lazy(() => import('@/pages/protein-intake-calculator')),
  'heart-rate-calculator': lazy(() => import('@/pages/heart-rate-calculator')),
  'sleep-calculator': lazy(() => import('@/pages/sleep-calculator')),
  'tdee-calculator': lazy(() => import('@/pages/tdee-calculator')),

  // Text Tools (7)
  'word-counter': lazy(() => import('@/pages/word-counter')),
  'character-counter': lazy(() => import('@/pages/character-counter')),
  'password-generator': lazy(() => import('@/pages/password-generator')),
  'username-generator': lazy(() => import('@/pages/username-generator')),
  'qr-code-scanner': lazy(() => import('@/pages/qr-code-scanner')),
  'base64-encoder-decoder': lazy(() => import('@/pages/base64-encoder-decoder')),
  'unit-converter': lazy(() => import('@/pages/unit-converter')),
};

const ToolPage = () => {
  const [location] = useLocation();
  const [tool, setTool] = useState<Tool | null>(null);
  const [ToolComponent, setToolComponent] = useState<React.ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addRecent } = useRecentTools();

  useEffect(() => {
    // Extract tool ID from URL path like /tools/loan-calculator
    const pathParts = location.split('/');
    const toolId = pathParts[2]; // tools/[toolId]
    
    if (toolId) {
      const foundTool = tools.find(t => t.id === toolId);
      setTool(foundTool || null);
      
      // Track tool usage in recently used tools
      if (foundTool) {
        addRecent(foundTool);
      }
      
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
          <meta name="description" content="The tool you're looking for doesn't exist. Explore our 23 free online tools for finance, text processing, and health calculations." />
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
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <NativeAd placement="top" layout="4x1" />
              </div>
              <ToolComponent />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <NativeAd placement="bottom" layout="4x1" className="mt-12" />
                <SearchIntentSection category={tool.category} toolName={tool.name} />
                <ToolCalculationHistory toolPath={`/tools/${tool.id}`} />
              </div>
            </main>
            <Footer />
          </div>
        </Suspense>
      </ToolPageContext.Provider>
    );
  }

  // If tool exists in data but has no component implementation, return 404
  // This should not happen now that all tools are mapped, but ensures future-proofing
  return <NotFound />;
};

export default ToolPage;

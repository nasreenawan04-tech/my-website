import { Switch, Route, useLocation, Redirect } from "wouter";
import { useEffect, lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BackToTop } from "@/components/ui/back-to-top";
import PerformanceMetrics from "@/components/ui/performance-metrics";

// Core pages (loaded immediately for performance)
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

// Lazy load all other pages for better performance
const AllTools = lazy(() => import("@/pages/all-tools"));
const FinanceTools = lazy(() => import("@/pages/finance-tools"));
const TextTools = lazy(() => import("@/pages/text-tools"));
const HealthTools = lazy(() => import("@/pages/health-tools"));
const HelpCenter = lazy(() => import("@/pages/help-center"));
const ContactUs = lazy(() => import("@/pages/contact-us"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));
const ToolPage = lazy(() => import("@/pages/tool-page"));
const AboutUs = lazy(() => import("@/pages/about-us"));
import TextStatisticsAnalyzer from '@/pages/text-statistics-analyzer';
import UrlExtractor from '@/pages/url-extractor';
import TextCleanerFormatter from '@/pages/text-cleaner-formatter';
import TextSimilarityChecker from '@/pages/text-similarity-checker';

// Individual tool components are now loaded dynamically via ToolPage for better maintainability

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoadingSpinner />}>
        <Switch>
          {/* Core pages */}
          <Route path="/" component={Home} />
          <Route path="/all-tools" component={AllTools} />
          <Route path="/tools" component={AllTools} />

          {/* Category pages - standardized */}
          <Route path="/finance-tools" component={FinanceTools} />
          <Route path="/text-tools" component={TextTools} />
          <Route path="/health-tools" component={HealthTools} />

          {/* Static pages - standardized */}
          <Route path="/contact-us" component={ContactUs} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route path="/help-center" component={HelpCenter} />
          <Route path="/about-us" component={AboutUs} />

          {/* Legacy route redirects to standardized URLs */}
          <Route path="/about" component={() => <Redirect to="/about-us" />} />

          {/* Legacy route redirects to standardized /tools/ URLs */}
          <Route path="/loan-calculator" component={() => <Redirect to="/tools/loan-calculator" />} />
          <Route path="/mortgage-calculator" component={() => <Redirect to="/tools/mortgage-calculator" />} />
          <Route path="/emi-calculator" component={() => <Redirect to="/tools/emi-calculator" />} />
          <Route path="/bmi-calculator" component={() => <Redirect to="/tools/bmi-calculator" />} />
          <Route path="/tax-calculator" component={() => <Redirect to="/tools/tax-calculator" />} />
          <Route path="/word-counter" component={() => <Redirect to="/tools/word-counter" />} />
          <Route path="/character-counter" component={() => <Redirect to="/tools/character-counter" />} />

          {/* All tool routes now handled dynamically by ToolPage */}
          <Route path="/tools/:toolId" component={ToolPage} />
          <Route path="/tools/text-statistics-analyzer" component={TextStatisticsAnalyzer} />
          <Route path="/tools/url-extractor" component={UrlExtractor} />
          <Route path="/tools/text-cleaner-formatter" component={TextCleanerFormatter} />
          <Route path="/tools/text-similarity-checker" component={TextSimilarityChecker} />

          {/* 404 fallback for all unknown routes */}
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="dapsiwow-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
          <BackToTop />
          <PerformanceMetrics />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
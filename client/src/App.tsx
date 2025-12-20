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
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";

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
const RecentlyUsedTools = lazy(() => import("@/pages/recently-used-tools"));
const FavoriteTools = lazy(() => import("@/pages/favorite-tools"));
const TextStatisticsAnalyzer = lazy(() => import("@/pages/text-statistics-analyzer"));
const UrlExtractor = lazy(() => import("@/pages/url-extractor"));
const TextCleanerFormatter = lazy(() => import("@/pages/text-cleaner-formatter"));
const DTIRatioCalculator = lazy(() => import("@/pages/dti-ratio-calculator"));
const StressLevelCalculator = lazy(() => import("@/pages/stress-level-calculator"));
const BodyCompositionAnalyzer = lazy(() => import("@/pages/body-composition-analyzer"));
const MetabolicAgeCalculator = lazy(() => import("@/pages/metabolic-age-calculator"));
const PersonalFinanceDashboard = lazy(() => import("@/pages/personal-finance-dashboard"));
const DebtConsolidationCalculator = lazy(() => import("@/pages/debt-consolidation-calculator"));
const MealCalorieTracker = lazy(() => import("@/pages/meal-calorie-tracker"));
const UnitConverter = lazy(() => import("@/pages/unit-converter"));
const LoanCalculator = lazy(() => import("@/pages/loan-calculator"));
const LeaseCalculator = lazy(() => import("@/pages/lease-calculator"));
const ProteinIntakeCalculator = lazy(() => import("@/pages/protein-intake-calculator"));
const Login = lazy(() => import("@/pages/login"));
const Signup = lazy(() => import("@/pages/signup"));
const ForgotPassword = lazy(() => import("@/pages/forgot-password"));
const Profile = lazy(() => import("@/pages/profile"));
const Blog = lazy(() => import("@/pages/blog"));
const BlogPost = lazy(() => import("@/pages/blog-post"));

// Individual tool components are now loaded dynamically via ToolPage for better maintainability

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

// Track page views for analytics
function PageViewTracker() {
  const [location] = useLocation();

  useEffect(() => {
    // Wait for document.title to update after route change
    // This ensures Helmet has updated the title before we track the page view
    requestAnimationFrame(() => {
      // Dynamically import analytics to avoid issues during SSR
      import('@/lib/analytics').then(({ trackPageView }) => {
        trackPageView(location, document.title);
      });
    });
  }, [location]);

  return null;
}

function Router() {
  return (
    <ErrorBoundary onError={(error, errorInfo) => {
      console.error('Router Error:', error, errorInfo);
      // Log critical navigation errors
    }}>
      <ScrollToTop />
      <PageViewTracker />
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
          <Route path="/recently-used-tools" component={RecentlyUsedTools} />
          <Route path="/favorite-tools" component={FavoriteTools} />

          {/* Authentication pages */}
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/profile" component={Profile} />

          {/* Blog pages */}
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:slug" component={BlogPost} />

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
          <Route path="/compound-interest-calculator" component={() => <Redirect to="/tools/compound-interest-calculator" />} />
          <Route path="/simple-interest-calculator" component={() => <Redirect to="/tools/simple-interest-calculator" />} />
          <Route path="/roi-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/salary-to-hourly-calculator" component={() => <Redirect to="/tools/salary-to-hourly-calculator" />} />
          <Route path="/tip-calculator" component={() => <Redirect to="/tools/tip-calculator" />} />
          <Route path="/inflation-calculator" component={() => <Redirect to="/tools/inflation-calculator" />} />
          <Route path="/savings-goal-calculator" component={() => <Redirect to="/tools/savings-goal-calculator" />} />
          <Route path="/debt-payoff-calculator" component={() => <Redirect to="/tools/debt-payoff-calculator" />} />
          <Route path="/net-worth-calculator" component={() => <Redirect to="/tools/net-worth-calculator" />} />
          <Route path="/stock-profit-calculator" component={() => <Redirect to="/tools/stock-profit-calculator" />} />
          <Route path="/retirement-calculator" component={() => <Redirect to="/tools/retirement-calculator" />} />
          <Route path="/sip-calculator" component={() => <Redirect to="/tools/sip-calculator" />} />
          <Route path="/investment-return-calculator" component={() => <Redirect to="/tools/investment-return-calculator" />} />
          <Route path="/break-even-calculator" component={() => <Redirect to="/tools/break-even-calculator" />} />
          <Route path="/car-loan-calculator" component={() => <Redirect to="/tools/car-loan-calculator" />} />
          <Route path="/home-loan-calculator" component={() => <Redirect to="/tools/home-loan-calculator" />} />
          <Route path="/education-loan-calculator" component={() => <Redirect to="/tools/education-loan-calculator" />} />
          <Route path="/credit-card-interest-calculator" component={() => <Redirect to="/tools/credit-card-interest-calculator" />} />
          <Route path="/lease-calculator" component={() => <Redirect to="/tools/lease-calculator" />} />
          <Route path="/percentage-calculator" component={() => <Redirect to="/tools/percentage-calculator" />} />
          <Route path="/discount-calculator" component={() => <Redirect to="/tools/discount-calculator" />} />
          <Route path="/vat-gst-calculator" component={() => <Redirect to="/tools/vat-gst-calculator" />} />
          <Route path="/paypal-fee-calculator" component={() => <Redirect to="/tools/paypal-fee-calculator" />} />
          <Route path="/currency-percentage-change-calculator" component={() => <Redirect to="/tools/currency-percentage-change-calculator" />} />
          <Route path="/future-value-investment-calculator" component={() => <Redirect to="/tools/future-value-investment-calculator" />} />
          <Route path="/budget-calculator" component={() => <Redirect to="/tools/budget-calculator" />} />
          <Route path="/loan-comparison-calculator" component={() => <Redirect to="/tools/loan-comparison-calculator" />} />
          <Route path="/dti-ratio-calculator" component={() => <Redirect to="/tools/dti-ratio-calculator" />} />
          <Route path="/personal-finance-dashboard" component={() => <Redirect to="/tools/personal-finance-dashboard" />} />
          <Route path="/debt-consolidation-calculator" component={() => <Redirect to="/tools/debt-consolidation-calculator" />} />
          <Route path="/sentence-counter" component={() => <Redirect to="/tools/sentence-counter" />} />
          <Route path="/paragraph-counter" component={() => <Redirect to="/tools/paragraph-counter" />} />
          <Route path="/case-converter" component={() => <Redirect to="/tools/case-converter" />} />
          <Route path="/password-generator" component={() => <Redirect to="/tools/password-generator" />} />
          <Route path="/password-strength-checker" component={() => <Redirect to="/tools/password-strength-checker" />} />
          <Route path="/username-generator" component={() => <Redirect to="/tools/username-generator" />} />
          <Route path="/lorem-ipsum-generator" component={() => <Redirect to="/tools/lorem-ipsum-generator" />} />
          <Route path="/duplicate-line-remover" component={() => <Redirect to="/tools/duplicate-line-remover" />} />
          <Route path="/url-extractor" component={() => <Redirect to="/tools/url-extractor" />} />
          <Route path="/text-statistics-analyzer" component={() => <Redirect to="/tools/text-statistics-analyzer" />} />
          <Route path="/text-cleaner-formatter" component={() => <Redirect to="/tools/text-cleaner-formatter" />} />
          <Route path="/qr-code-scanner" component={() => <Redirect to="/tools/qr-code-scanner" />} />
          <Route path="/base64-encoder-decoder" component={() => <Redirect to="/tools/base64-encoder-decoder" />} />
          <Route path="/hex-to-text-converter" component={() => <Redirect to="/tools/hex-to-text-converter" />} />
          <Route path="/binary-to-text-converter" component={() => <Redirect to="/tools/binary-to-text-converter" />} />
          <Route path="/bmr-calculator" component={() => <Redirect to="/tools/bmr-calculator" />} />
          <Route path="/calorie-calculator" component={() => <Redirect to="/tools/calorie-calculator" />} />
          <Route path="/body-fat-calculator" component={() => <Redirect to="/tools/body-fat-calculator" />} />
          <Route path="/pregnancy-due-date-calculator" component={() => <Redirect to="/tools/pregnancy-due-date-calculator" />} />
          <Route path="/ideal-weight-calculator" component={() => <Redirect to="/tools/ideal-weight-calculator" />} />
          <Route path="/water-intake-calculator" component={() => <Redirect to="/tools/water-intake-calculator" />} />
          <Route path="/protein-intake-calculator" component={() => <Redirect to="/tools/protein-intake-calculator" />} />
          <Route path="/carb-calculator" component={() => <Redirect to="/tools/carb-calculator" />} />
          <Route path="/keto-macro-calculator" component={() => <Redirect to="/tools/keto-macro-calculator" />} />
          <Route path="/intermittent-fasting-timer" component={() => <Redirect to="/tools/intermittent-fasting-timer" />} />
          <Route path="/daily-step-calorie-converter" component={() => <Redirect to="/tools/daily-step-calorie-converter" />} />
          <Route path="/heart-rate-calculator" component={() => <Redirect to="/tools/heart-rate-calculator" />} />
          <Route path="/max-heart-rate-calculator" component={() => <Redirect to="/tools/max-heart-rate-calculator" />} />
          <Route path="/blood-pressure-tracker" component={() => <Redirect to="/tools/blood-pressure-tracker" />} />
          <Route path="/sleep-calculator" component={() => <Redirect to="/tools/sleep-calculator" />} />
          <Route path="/ovulation-calculator" component={() => <Redirect to="/tools/ovulation-calculator" />} />
          <Route path="/baby-growth-chart" component={() => <Redirect to="/tools/baby-growth-chart" />} />
          <Route path="/tdee-calculator" component={() => <Redirect to="/tools/tdee-calculator" />} />
          <Route path="/lean-body-mass-calculator" component={() => <Redirect to="/tools/lean-body-mass-calculator" />} />
          <Route path="/waist-to-height-ratio-calculator" component={() => <Redirect to="/tools/waist-to-height-ratio-calculator" />} />
          <Route path="/whr-calculator" component={() => <Redirect to="/tools/whr-calculator" />} />
          <Route path="/life-expectancy-calculator" component={() => <Redirect to="/tools/life-expectancy-calculator" />} />
          <Route path="/cholesterol-risk-calculator" component={() => <Redirect to="/tools/cholesterol-risk-calculator" />} />
          <Route path="/running-pace-calculator" component={() => <Redirect to="/tools/running-pace-calculator" />} />
          <Route path="/cycling-speed-calculator" component={() => <Redirect to="/tools/cycling-speed-calculator" />} />
          <Route path="/swimming-calorie-calculator" component={() => <Redirect to="/tools/swimming-calorie-calculator" />} />
          <Route path="/alcohol-calorie-calculator" component={() => <Redirect to="/tools/alcohol-calorie-calculator" />} />
          <Route path="/smoking-cost-calculator" component={() => <Redirect to="/tools/smoking-cost-calculator" />} />
          <Route path="/body-water-percentage-calculator" component={() => <Redirect to="/tools/body-water-percentage-calculator" />} />
          <Route path="/hydration-calculator" component={() => <Redirect to="/tools/hydration-calculator" />} />
          <Route path="/sleep-quality-calculator" component={() => <Redirect to="/tools/sleep-quality-calculator" />} />
          <Route path="/stress-level-calculator" component={() => <Redirect to="/tools/stress-level-calculator" />} />
          <Route path="/body-composition-analyzer" component={() => <Redirect to="/tools/body-composition-analyzer" />} />
          <Route path="/metabolic-age-calculator" component={() => <Redirect to="/tools/metabolic-age-calculator" />} />
          <Route path="/meal-calorie-tracker" component={() => <Redirect to="/tools/meal-calorie-tracker" />} />

          {/* Specific tool routes - must come before the generic route */}
          <Route path="/tools/text-statistics-analyzer" component={TextStatisticsAnalyzer} />
          <Route path="/tools/url-extractor" component={UrlExtractor} />
          <Route path="/tools/text-cleaner-formatter" component={TextCleanerFormatter} />
          <Route path="/tools/dti-ratio-calculator" component={DTIRatioCalculator} />
          <Route path="/tools/stress-level-calculator" component={StressLevelCalculator} />
          <Route path="/tools/body-composition-analyzer" component={BodyCompositionAnalyzer} />
          <Route path="/tools/metabolic-age-calculator" component={MetabolicAgeCalculator} />
          <Route path="/tools/personal-finance-dashboard" component={PersonalFinanceDashboard} />
          <Route path="/tools/debt-consolidation-calculator" component={DebtConsolidationCalculator} />
          <Route path="/tools/meal-calorie-tracker" component={MealCalorieTracker} />
          <Route path="/tools/unit-converter" component={UnitConverter} />
          <Route path="/tools/loan-calculator" component={LoanCalculator} />
          <Route path="/tools/lease-calculator" component={LeaseCalculator} />
          <Route path="/tools/protein-intake-calculator" component={ProteinIntakeCalculator} />
          
          {/* Generic tool route - must come last to avoid conflicts */}
          <Route path="/tools/:toolId" component={ToolPage} />

          {/* 404 fallback for all unknown routes */}
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="dapsiwow-ui-theme">
          <TooltipProvider>
            <Toaster />
            <Router />
            <BackToTop />
            <PerformanceMetrics />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
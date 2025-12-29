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

// Individually imported core pages
import Home from "./pages/home";
import NotFound from "./pages/not-found";
import Header from "./components/Header";

// Lazy load all other pages for better performance
const AllTools = lazy(() => import("./pages/all-tools"));
const FinanceTools = lazy(() => import("./pages/finance-tools"));
const TextTools = lazy(() => import("./pages/text-tools"));
const HealthTools = lazy(() => import("./pages/health-tools"));
const HelpCenter = lazy(() => import("./pages/help-center"));
const ContactUs = lazy(() => import("./pages/contact-us"));
const PrivacyPolicy = lazy(() => import("./pages/privacy-policy"));
const TermsOfService = lazy(() => import("./pages/terms-of-service"));
const ToolPage = lazy(() => import("./pages/tool-page"));
const AboutUs = lazy(() => import("./pages/about-us"));
const RecentlyUsedTools = lazy(() => import("./pages/recently-used-tools"));
const FavoriteTools = lazy(() => import("./pages/favorite-tools"));
const UnitConverter = lazy(() => import("./pages/unit-converter"));
const LoanCalculator = lazy(() => import("./pages/loan-calculator"));
const MortgageCalculator = lazy(() => import("./pages/mortgage-calculator"));
const EMICalculator = lazy(() => import("./pages/emi-calculator"));
const SimpleInterestCalculator = lazy(() => import("./pages/simple-interest-calculator"));
const CompoundInterestCalculator = lazy(() => import("./pages/compound-interest-calculator"));
const CarLoanCalculator = lazy(() => import("./pages/car-loan-calculator"));
const BusinessLoanCalculator = lazy(() => import("./pages/business-loan-calculator"));
const BMICalculator = lazy(() => import("./pages/bmi-calculator"));
const BodyFatCalculator = lazy(() => import("./pages/body-fat-calculator"));
const CalorieCalculator = lazy(() => import("./pages/calorie-calculator"));
const TDEECalculator = lazy(() => import("./pages/tdee-calculator"));
const SleepCalculator = lazy(() => import("./pages/sleep-calculator"));
const WaterIntakeCalculator = lazy(() => import("./pages/water-intake-calculator"));
const ProteinIntakeCalculator = lazy(() => import("./pages/protein-intake-calculator"));
const HeartRateCalculator = lazy(() => import("./pages/heart-rate-calculator"));
const WordCounter = lazy(() => import("./pages/word-counter"));
const CharacterCounter = lazy(() => import("./pages/character-counter"));
const PasswordGenerator = lazy(() => import("./pages/password-generator"));
const UsernameGenerator = lazy(() => import("./pages/username-generator"));
const Base64EncoderDecoder = lazy(() => import("./pages/base64-encoder-decoder"));
const QRCodeScanner = lazy(() => import("./pages/qr-code-scanner"));
const Login = lazy(() => import("./pages/login"));
const Signup = lazy(() => import("./pages/signup"));
const ForgotPassword = lazy(() => import("./pages/forgot-password"));
const Profile = lazy(() => import("./pages/profile"));
const Blog = lazy(() => import("./pages/blog"));
const BlogPost = lazy(() => import("./pages/blog-post"));
const CollectionPreview = lazy(() => import("./pages/collection-preview"));
const CompareTools = lazy(() => import("./pages/compare-tools"));

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
    const handleTracking = () => {
      import('@/lib/analytics').then(({ trackPageView }) => {
        trackPageView(location, document.title);
      });
    };

    // Use a small delay to ensure Helmet has finished DOM updates
    const timer = setTimeout(() => {
      requestAnimationFrame(handleTracking);
    }, 100);

    return () => clearTimeout(timer);
  }, [location]);

  return null;
}

function Router() {
  return (
    <ErrorBoundary 
      fallback={<div className="flex items-center justify-center min-h-screen">Something went wrong. Please refresh.</div>}
      onError={(error, errorInfo) => {
        console.error('Router Error:', error, errorInfo);
      }}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-9999 focus:p-4 focus:bg-blue-600 focus:text-white">Skip to main content</a>
      <ScrollToTop />
      <PageViewTracker />
      <Suspense fallback={<PageLoadingSpinner />}>
        <Switch>
          {/* Core pages */}
          <Route path="/" component={Home} />
          <Route path="/all-tools" component={AllTools} />
          <Route path="/tools" component={AllTools} />
          <Route path="/compare-tools" component={CompareTools} />

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

          {/* Collection sharing */}
          <Route path="/share/:shareId" component={CollectionPreview} />

          {/* Legacy route redirects to standardized URLs */}
          <Route path="/about" component={() => <Redirect to="/about-us" />} />

          {/* Legacy route redirects to standardized /tools/ URLs */}
          <Route path="/loan-calculator" component={() => <Redirect to="/tools/loan-calculator" />} />
          <Route path="/mortgage-calculator" component={() => <Redirect to="/tools/mortgage-calculator" />} />
          <Route path="/emi-calculator" component={() => <Redirect to="/tools/emi-calculator" />} />
          <Route path="/bmi-calculator" component={() => <Redirect to="/tools/bmi-calculator" />} />
          <Route path="/tax-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/word-counter" component={() => <Redirect to="/tools/word-counter" />} />
          <Route path="/character-counter" component={() => <Redirect to="/tools/character-counter" />} />
          <Route path="/compound-interest-calculator" component={() => <Redirect to="/tools/compound-interest-calculator" />} />
          <Route path="/simple-interest-calculator" component={() => <Redirect to="/tools/simple-interest-calculator" />} />
          <Route path="/roi-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/salary-to-hourly-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/tip-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/tools/tip-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/inflation-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/tools/inflation-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/savings-goal-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/tools/savings-goal-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/debt-payoff-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/tools/debt-payoff-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/net-worth-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/tools/net-worth-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/stock-profit-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/tools/stock-profit-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/retirement-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/tools/retirement-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/sip-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/tools/sip-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/investment-return-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/tools/investment-return-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/break-even-calculator" component={() => <Redirect to="/tools/business-loan-calculator" />} />
          <Route path="/tools/break-even-calculator" component={() => <Redirect to="/tools/business-loan-calculator" />} />
          <Route path="/car-loan-calculator" component={() => <Redirect to="/tools/car-loan-calculator" />} />
          <Route path="/home-loan-calculator" component={() => <Redirect to="/tools/home-loan-calculator" />} />
          <Route path="/education-loan-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/tools/education-loan-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/credit-card-interest-calculator" component={() => <Redirect to="/tools/credit-card-interest-calculator" />} />
          <Route path="/lease-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/percentage-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/discount-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/tools/discount-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/vat-gst-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/tools/vat-gst-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/paypal-fee-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/tools/paypal-fee-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/currency-percentage-change-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/tools/currency-percentage-change-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/future-value-investment-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/tools/future-value-investment-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/budget-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/tools/budget-calculator" component={() => <Redirect to="/finance-tools" />} />
          <Route path="/loan-comparison-calculator" component={() => <Redirect to="/tools/loan-calculator" />} />
          <Route path="/tools/loan-comparison-calculator" component={() => <Redirect to="/tools/loan-calculator" />} />
          <Route path="/sentence-counter" component={() => <Redirect to="/text-tools" />} />
          <Route path="/paragraph-counter" component={() => <Redirect to="/text-tools" />} />
          <Route path="/case-converter" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/sentence-counter" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/paragraph-counter" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/case-converter" component={() => <Redirect to="/text-tools" />} />
          <Route path="/password-generator" component={() => <Redirect to="/tools/password-generator" />} />
          <Route path="/password-strength-checker" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/password-strength-checker" component={() => <Redirect to="/text-tools" />} />
          <Route path="/username-generator" component={() => <Redirect to="/tools/username-generator" />} />
          <Route path="/lorem-ipsum-generator" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/lorem-ipsum-generator" component={() => <Redirect to="/text-tools" />} />
          <Route path="/fake-address-generator" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/fake-address-generator" component={() => <Redirect to="/text-tools" />} />
          <Route path="/decimal-to-text-converter" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/decimal-to-text-converter" component={() => <Redirect to="/text-tools" />} />
          <Route path="/text-to-decimal-converter" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/text-to-decimal-converter" component={() => <Redirect to="/text-tools" />} />
          <Route path="/hex-to-text-converter" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/hex-to-text-converter" component={() => <Redirect to="/text-tools" />} />
          <Route path="/text-to-hex-converter" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/text-to-hex-converter" component={() => <Redirect to="/text-tools" />} />
          <Route path="/font-style-changer" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/font-style-changer" component={() => <Redirect to="/text-tools" />} />
          <Route path="/markdown-to-html" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/markdown-to-html" component={() => <Redirect to="/text-tools" />} />
          <Route path="/reverse-text" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/reverse-text" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/reverse-text-tool" component={() => <Redirect to="/text-tools" />} />
          <Route path="/text-to-qr-code" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/text-to-qr-code" component={() => <Redirect to="/text-tools" />} />
          <Route path="/duplicate-line-remover" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/duplicate-line-remover" component={() => <Redirect to="/text-tools" />} />
          <Route path="/text-scrambler" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/text-scrambler" component={() => <Redirect to="/text-tools" />} />
          <Route path="/text-diff-checker" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/text-diff-checker" component={() => <Redirect to="/text-tools" />} />
          <Route path="/text-pattern-generator" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/text-pattern-generator" component={() => <Redirect to="/text-tools" />} />
          <Route path="/text-formatter-beautifier" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/text-formatter-beautifier" component={() => <Redirect to="/text-tools" />} />
          <Route path="/url-extractor" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/url-extractor" component={() => <Redirect to="/text-tools" />} />
          <Route path="/text-statistics-analyzer" component={() => <Redirect to="/tools/word-counter" />} />
          <Route path="/tools/text-statistics-analyzer" component={() => <Redirect to="/tools/word-counter" />} />
          <Route path="/text-cleaner-formatter" component={() => <Redirect to="/text-tools" />} />
          <Route path="/tools/text-cleaner-formatter" component={() => <Redirect to="/text-tools" />} />
          <Route path="/qr-code-scanner" component={() => <Redirect to="/tools/qr-code-scanner" />} />
          <Route path="/base64-encoder-decoder" component={() => <Redirect to="/tools/base64-encoder-decoder" />} />
          <Route path="/hex-to-text-converter" component={() => <Redirect to="/tools/hex-to-text-converter" />} />
          <Route path="/binary-to-text-converter" component={() => <Redirect to="/tools/binary-to-text-converter" />} />
          <Route path="/bmr-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/bmr-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/calorie-calculator" component={() => <Redirect to="/tools/calorie-calculator" />} />
          <Route path="/body-fat-calculator" component={() => <Redirect to="/tools/body-fat-calculator" />} />
          <Route path="/pregnancy-due-date-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/pregnancy-due-date-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/ideal-weight-calculator" component={() => <Redirect to="/tools/bmi-calculator" />} />
          <Route path="/tools/ideal-weight-calculator" component={() => <Redirect to="/tools/bmi-calculator" />} />
          <Route path="/water-intake-calculator" component={() => <Redirect to="/tools/water-intake-calculator" />} />
          <Route path="/protein-intake-calculator" component={() => <Redirect to="/tools/protein-intake-calculator" />} />
          <Route path="/carb-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/carb-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/keto-macro-calculator" component={() => <Redirect to="/tools/calorie-calculator" />} />
          <Route path="/tools/keto-macro-calculator" component={() => <Redirect to="/tools/calorie-calculator" />} />
          <Route path="/intermittent-fasting-timer" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/intermittent-fasting-timer" component={() => <Redirect to="/health-tools" />} />
          <Route path="/daily-step-calorie-converter" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/daily-step-calorie-converter" component={() => <Redirect to="/health-tools" />} />
          <Route path="/heart-rate-calculator" component={() => <Redirect to="/tools/heart-rate-calculator" />} />
          <Route path="/max-heart-rate-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/max-heart-rate-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/blood-pressure-tracker" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/blood-pressure-tracker" component={() => <Redirect to="/health-tools" />} />
          <Route path="/sleep-calculator" component={() => <Redirect to="/tools/sleep-calculator" />} />
          <Route path="/ovulation-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/ovulation-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/baby-growth-chart" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/baby-growth-chart" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tdee-calculator" component={() => <Redirect to="/tools/tdee-calculator" />} />
          <Route path="/alcohol-calorie-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/alcohol-calorie-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/smoking-cost-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/smoking-cost-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/hydration-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/hydration-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/sleep-quality-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/sleep-quality-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/stress-level-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/stress-level-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/metabolic-age-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/metabolic-age-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/meal-calorie-tracker" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/meal-calorie-tracker" component={() => <Redirect to="/health-tools" />} />
          <Route path="/lean-body-mass-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/lean-body-mass-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/waist-to-height-ratio-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/waist-to-height-ratio-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/whr-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/whr-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/life-expectancy-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/life-expectancy-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/running-pace-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/running-pace-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/cycling-speed-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/cycling-speed-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/swimming-calorie-calculator" component={() => <Redirect to="/health-tools" />} />
          <Route path="/tools/swimming-calorie-calculator" component={() => <Redirect to="/health-tools" />} />

          {/* Specific tool routes - must come before the generic route */}
          <Route path="/tools/unit-converter" component={UnitConverter} />
          <Route path="/tools/loan-calculator" component={LoanCalculator} />
          <Route path="/tools/mortgage-calculator" component={MortgageCalculator} />
          <Route path="/tools/emi-calculator" component={EMICalculator} />
          <Route path="/tools/simple-interest-calculator" component={SimpleInterestCalculator} />
          <Route path="/tools/compound-interest-calculator" component={CompoundInterestCalculator} />
          <Route path="/tools/car-loan-calculator" component={CarLoanCalculator} />
          <Route path="/tools/business-loan-calculator" component={BusinessLoanCalculator} />
          <Route path="/tools/bmi-calculator" component={BMICalculator} />
          <Route path="/tools/body-fat-calculator" component={BodyFatCalculator} />
          <Route path="/tools/calorie-calculator" component={CalorieCalculator} />
          <Route path="/tools/tdee-calculator" component={TDEECalculator} />
          <Route path="/tools/sleep-calculator" component={SleepCalculator} />
          <Route path="/tools/water-intake-calculator" component={WaterIntakeCalculator} />
          <Route path="/tools/protein-intake-calculator" component={ProteinIntakeCalculator} />
          <Route path="/tools/heart-rate-calculator" component={HeartRateCalculator} />
          <Route path="/tools/word-counter" component={WordCounter} />
          <Route path="/tools/character-counter" component={CharacterCounter} />
          <Route path="/tools/password-generator" component={PasswordGenerator} />
          <Route path="/tools/username-generator" component={UsernameGenerator} />
          <Route path="/tools/base64-encoder-decoder" component={Base64EncoderDecoder} />
          <Route path="/tools/qr-code-scanner" component={QRCodeScanner} />
          
          {/* Generic tool route - must come last to avoid conflicts */}
          <Route path="/tools/:toolId" component={ToolPage} />
          <Route path="/tools/:toolId/compare" component={CompareTools} />

          {/* 404 fallback for all unknown routes */}
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
}

import { ComparisonProvider } from "@/context/ComparisonContext";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="dapsiwow-ui-theme">
          <ComparisonProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
              <BackToTop />
              <PerformanceMetrics />
            </TooltipProvider>
          </ComparisonProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
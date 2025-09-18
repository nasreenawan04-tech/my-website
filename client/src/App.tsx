import { Switch, Route, useLocation } from "wouter";
import { useEffect, lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BackToTop } from "@/components/ui/back-to-top";

// Core pages (loaded immediately for performance)
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

// Lazy load all other pages for better performance
const AllTools = lazy(() => import("@/pages/all-tools"));
const LoanCalculator = lazy(() => import("@/pages/loan-calculator"));
const MortgageCalculator = lazy(() => import("@/pages/mortgage-calculator"));
const EMICalculator = lazy(() => import("@/pages/emi-calculator"));
const FinanceTools = lazy(() => import("@/pages/finance-tools"));
const TextTools = lazy(() => import("@/pages/text-tools"));
const HealthTools = lazy(() => import("@/pages/health-tools"));
const HelpCenter = lazy(() => import("@/pages/help-center"));
const ContactUs = lazy(() => import("@/pages/contact-us"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));
const ToolPage = lazy(() => import("@/pages/tool-page"));
const AboutUs = lazy(() => import("@/pages/about-us"));

// Lazy load finance calculators
const CompoundInterestCalculator = lazy(() => import("@/pages/compound-interest-calculator"));
const SimpleInterestCalculator = lazy(() => import("@/pages/simple-interest-calculator"));
const ROICalculator = lazy(() => import("@/pages/roi-calculator"));
const TaxCalculator = lazy(() => import("@/pages/tax-calculator"));
const SalaryToHourlyCalculator = lazy(() => import("@/pages/salary-to-hourly-calculator"));
const TipCalculator = lazy(() => import("@/pages/tip-calculator"));
const InflationCalculator = lazy(() => import("@/pages/inflation-calculator"));
const SavingsGoalCalculator = lazy(() => import("@/pages/savings-goal-calculator"));
const DebtPayoffCalculator = lazy(() => import("@/pages/debt-payoff-calculator"));
const NetWorthCalculator = lazy(() => import("@/pages/net-worth-calculator"));
const StockProfitCalculator = lazy(() => import("@/pages/stock-profit-calculator"));
const RetirementCalculator = lazy(() => import("@/pages/retirement-calculator"));
const SIPCalculator = lazy(() => import("@/pages/sip-calculator"));
const InvestmentReturnCalculator = lazy(() => import("@/pages/investment-return-calculator"));
const BreakEvenCalculator = lazy(() => import("@/pages/break-even-calculator"));
const BusinessLoanCalculator = lazy(() => import("@/pages/business-loan-calculator"));
const LeaseCalculator = lazy(() => import("@/pages/lease-calculator"));
const CarLoanCalculator = lazy(() => import("@/pages/car-loan-calculator"));
const HomeLoanCalculator = lazy(() => import("@/pages/home-loan-calculator"));
const EducationLoanCalculator = lazy(() => import("@/pages/education-loan-calculator"));
const CreditCardInterestCalculator = lazy(() => import("@/pages/credit-card-interest-calculator"));
const PercentageCalculator = lazy(() => import("@/pages/percentage-calculator"));
const DiscountCalculator = lazy(() => import("@/pages/discount-calculator"));
const VATGSTCalculator = lazy(() => import("@/pages/vat-gst-calculator"));
const PayPalFeeCalculator = lazy(() => import("@/pages/paypal-fee-calculator"));

// Lazy load health calculators
const BMICalculator = lazy(() => import("@/pages/bmi-calculator"));
const BMRCalculator = lazy(() => import("@/pages/bmr-calculator"));
const CalorieCalculator = lazy(() => import("@/pages/calorie-calculator"));
const BodyFatCalculator = lazy(() => import("@/pages/body-fat-calculator"));
const IdealWeightCalculator = lazy(() => import("@/pages/ideal-weight-calculator"));
const PregnancyDueDateCalculator = lazy(() => import("@/pages/pregnancy-due-date-calculator"));
const WaterIntakeCalculator = lazy(() => import("@/pages/water-intake-calculator"));
const ProteinIntakeCalculator = lazy(() => import("@/pages/protein-intake-calculator"));
const CarbCalculator = lazy(() => import("@/pages/carb-calculator"));
const KetoMacroCalculator = lazy(() => import("@/pages/keto-macro-calculator"));
const IntermittentFastingTimer = lazy(() => import("@/pages/intermittent-fasting-timer"));
const DailyStepCalorieConverter = lazy(() => import("@/pages/daily-step-calorie-converter"));
const HeartRateCalculator = lazy(() => import("@/pages/heart-rate-calculator"));
const MaxHeartRateCalculator = lazy(() => import("@/pages/max-heart-rate-calculator"));
const BloodPressureTracker = lazy(() => import("@/pages/blood-pressure-tracker"));
const SleepCalculator = lazy(() => import("@/pages/sleep-calculator"));
const OvulationCalculator = lazy(() => import("@/pages/ovulation-calculator"));
const BabyGrowthChart = lazy(() => import("@/pages/baby-growth-chart"));
const TDEECalculator = lazy(() => import("@/pages/tdee-calculator"));
const LeanBodyMassCalculator = lazy(() => import("@/pages/lean-body-mass-calculator"));
const WaistToHeightRatioCalculator = lazy(() => import("@/pages/waist-to-height-ratio-calculator"));
const WHRCalculator = lazy(() => import("@/pages/whr-calculator"));
const LifeExpectancyCalculator = lazy(() => import("@/pages/life-expectancy-calculator"));
const CholesterolRiskCalculator = lazy(() => import("@/pages/cholesterol-risk-calculator"));
const RunningPaceCalculator = lazy(() => import("@/pages/running-pace-calculator"));
const CyclingSpeedCalculator = lazy(() => import("@/pages/cycling-speed-calculator"));
const SwimmingCalorieCalculator = lazy(() => import("@/pages/swimming-calorie-calculator"));
const AlcoholCalorieCalculator = lazy(() => import("@/pages/alcohol-calorie-calculator"));
const SmokingCostCalculator = lazy(() => import("@/pages/smoking-cost-calculator"));


// Lazy load text tools
const WordCounter = lazy(() => import("@/pages/word-counter"));
const CharacterCounter = lazy(() => import("@/pages/character-counter"));
const SentenceCounter = lazy(() => import("@/pages/sentence-counter"));
const ParagraphCounter = lazy(() => import("@/pages/paragraph-counter"));
const CaseConverter = lazy(() => import("@/pages/case-converter"));
const PasswordGenerator = lazy(() => import("@/pages/password-generator"));
const FakeNameGenerator = lazy(() => import("@/pages/fake-name-generator"));
const UsernameGenerator = lazy(() => import("@/pages/username-generator"));
const FakeAddressGenerator = lazy(() => import("@/pages/fake-address-generator"));
const QRTextGenerator = lazy(() => import("@/pages/qr-text-generator"));
const FontStyleChanger = lazy(() => import("@/pages/font-style-changer"));
const ReverseTextTool = lazy(() => import("@/pages/reverse-text-tool"));
const TextToQRCode = lazy(() => import("@/pages/text-to-qr-code"));
const TextToBinaryConverter = lazy(() => import("@/pages/text-to-binary-converter"));
const BinaryToTextConverter = lazy(() => import("@/pages/binary-to-text-converter"));
const DecimalToTextConverter = lazy(() => import("@/pages/decimal-to-text-converter"));
const TextToDecimalConverter = lazy(() => import("@/pages/text-to-decimal-converter"));
const QRCodeScanner = lazy(() => import("@/pages/qr-code-scanner"));
const MarkdownToHTMLConverter = lazy(() => import("@/pages/markdown-to-html"));
const LoremIpsumGenerator = lazy(() => import("@/pages/lorem-ipsum-generator"));
const HexToTextConverter = lazy(() => import("@/pages/hex-to-text-converter"));
const TextToHexConverter = lazy(() => import("@/pages/text-to-hex-converter"));
const DuplicateLineRemover = lazy(() => import("@/pages/duplicate-line-remover"));
const TextScrambler = lazy(() => import("@/pages/text-scrambler"));
const TextDiffChecker = lazy(() => import("@/pages/text-diff-checker"));
const TextPatternGenerator = lazy(() => import("@/pages/text-pattern-generator"));


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
      <Route path="/" component={Home} />
      <Route path="/tools" component={AllTools} />
      <Route path="/tools/loan-calculator" component={LoanCalculator} />
      <Route path="/tools/mortgage-calculator" component={MortgageCalculator} />
      <Route path="/tools/emi-calculator" component={EMICalculator} />
      <Route path="/tools/compound-interest-Calculator" component={CompoundInterestCalculator} />
      <Route path="/tools/simple-interest-Calculator" component={SimpleInterestCalculator} />
      <Route path="/tools/roi-calculator" component={ROICalculator} />
      <Route path="/tools/tax-calculator" component={TaxCalculator} />
      <Route path="/tools/salary-to-hourly-calculator" component={SalaryToHourlyCalculator} />
      <Route path="/tools/tip-calculator" component={TipCalculator} />
      <Route path="/tools/inflation-calculator" component={InflationCalculator} />
      <Route path="/tools/savings-goal-calculator" component={SavingsGoalCalculator} />
      <Route path="/tools/debt-payoff-calculator" component={DebtPayoffCalculator} />
      <Route path="/tools/net-worth-calculator" component={NetWorthCalculator} />
      <Route path="/tools/stock-profit-calculator" component={StockProfitCalculator} />
      <Route path="/tools/retirement-calculator" component={RetirementCalculator} />
      <Route path="/tools/sip-calculator" component={SIPCalculator} />
      <Route path="/tools/investment-return-calculator" component={InvestmentReturnCalculator} />
      <Route path="/tools/break-even-calculator" component={BreakEvenCalculator} />
      <Route path="/tools/business-loan-calculator" component={BusinessLoanCalculator} />
      <Route path="/tools/lease-calculator" component={LeaseCalculator} />
      <Route path="/tools/car-loan-calculator" component={CarLoanCalculator} />
      <Route path="/tools/home-loan-calculator" component={HomeLoanCalculator} />
      <Route path="/tools/education-loan-calculator" component={EducationLoanCalculator} />
      <Route path="/tools/credit-card-interest-calculator" component={CreditCardInterestCalculator} />
      <Route path="/tools/percentage-calculator" component={PercentageCalculator} />
      <Route path="/tools/discount-calculator" component={DiscountCalculator} />
      <Route path="/tools/vat-gst-calculator" component={VATGSTCalculator} />
      <Route path="/tools/paypal-fee-calculator" component={PayPalFeeCalculator} />
      <Route path="/tools/bmi-calculator" component={BMICalculator} />
      <Route path="/tools/bmr-calculator" component={BMRCalculator} />
      <Route path="/tools/calorie-calculator" component={CalorieCalculator} />
      <Route path="/tools/body-fat-calculator" component={BodyFatCalculator} />
      <Route path="/tools/ideal-weight-calculator" component={IdealWeightCalculator} />
      <Route path="/tools/pregnancy-due-date-calculator" component={PregnancyDueDateCalculator} />
      <Route path="/tools/water-intake-calculator" component={WaterIntakeCalculator} />
      <Route path="/tools/protein-intake-calculator" component={ProteinIntakeCalculator} />
      <Route path="/tools/carb-calculator" component={CarbCalculator} />
      <Route path="/tools/keto-macro-calculator" component={KetoMacroCalculator} />
      <Route path="/tools/intermittent-fasting-timer" component={IntermittentFastingTimer} />
      <Route path="/tools/daily-step-calorie-converter" component={DailyStepCalorieConverter} />
      <Route path="/tools/heart-rate-calculator" component={HeartRateCalculator} />
      <Route path="/tools/max-heart-rate-calculator" component={MaxHeartRateCalculator} />
      <Route path="/tools/blood-pressure-tracker" component={BloodPressureTracker} />
      <Route path="/tools/sleep-calculator" component={SleepCalculator} />
      <Route path="/tools/ovulation-calculator" component={OvulationCalculator} />
      <Route path="/tools/baby-growth-chart" component={BabyGrowthChart} />
      <Route path="/tools/tdee-calculator" component={TDEECalculator} />
      <Route path="/tools/lean-body-mass-calculator" component={LeanBodyMassCalculator} />
      <Route path="/tools/waist-to-height-ratio-calculator" component={WaistToHeightRatioCalculator} />
      <Route path="/tools/whr-calculator" component={WHRCalculator} />
      <Route path="/tools/life-expectancy-calculator" component={LifeExpectancyCalculator} />
      <Route path="/tools/cholesterol-risk-calculator" component={CholesterolRiskCalculator} />
      <Route path="/tools/running-pace-calculator" component={RunningPaceCalculator} />
      <Route path="/tools/cycling-speed-calculator" component={CyclingSpeedCalculator} />
      <Route path="/tools/swimming-calorie-calculator" component={SwimmingCalorieCalculator} />
      <Route path="/tools/alcohol-calorie-calculator" component={AlcoholCalorieCalculator} />
      <Route path="/tools/smoking-cost-calculator" component={SmokingCostCalculator} />
      <Route path="/tools/word-counter" component={WordCounter} />
      <Route path="/tools/character-counter" component={CharacterCounter} />
        <Route path="/tools/sentence-counter" component={SentenceCounter} />
        <Route path="/tools/paragraph-counter" component={ParagraphCounter} />
        <Route path="/tools/case-converter" component={CaseConverter} />
        <Route path="/tools/password-generator" component={PasswordGenerator} />
        <Route path="/tools/fake-name-generator" component={FakeNameGenerator} />
        <Route path="/tools/username-generator" component={UsernameGenerator} />
        <Route path="/tools/fake-address-generator" component={FakeAddressGenerator} />
        <Route path="/tools/qr-text-generator" component={QRTextGenerator} />
        <Route path="/tools/font-style-changer" component={FontStyleChanger} />
        <Route path="/tools/reverse-text-tool" component={ReverseTextTool} />
        <Route path="/tools/text-to-qr-code" component={TextToQRCode} />
        <Route path="/tools/text-to-binary-converter" component={TextToBinaryConverter} />
        <Route path="/tools/binary-to-text-converter" component={BinaryToTextConverter} />
        <Route path="/tools/decimal-to-text-converter" component={DecimalToTextConverter} />
        <Route path="/tools/text-to-decimal-converter" component={TextToDecimalConverter} />
        <Route path="/tools/qr-code-scanner" component={QRCodeScanner} />
        <Route path="/tools/markdown-to-html" component={MarkdownToHTMLConverter} />
        <Route path="/tools/lorem-ipsum-generator" component={LoremIpsumGenerator} />
        <Route path="/tools/hex-to-text-converter" component={HexToTextConverter} />
        <Route path="/tools/text-to-hex-converter" component={TextToHexConverter} />
        <Route path="/tools/duplicate-line-remover" component={DuplicateLineRemover} />
        <Route path="/tools/text-scrambler" component={TextScrambler} />
        <Route path="/tools/text-diff-checker" component={TextDiffChecker} />
        <Route path="/tools/text-pattern-generator" component={TextPatternGenerator} />
      <Route path="/tools/:toolId" component={ToolPage} />
      <Route path="/finance" component={FinanceTools} />
      <Route path="/text" component={TextTools} />
      <Route path="/health" component={HealthTools} />
      <Route path="/contact" component={ContactUs} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/help" component={HelpCenter} />
      <Route path="/about" component={AboutUs} />
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
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
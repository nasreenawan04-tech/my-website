import { Switch, Route, useLocation } from "wouter";
import { useEffect, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AllTools from "@/pages/all-tools";
import LoanCalculator from "@/pages/loan-calculator";
import MortgageCalculator from "@/pages/mortgage-calculator";
import EMICalculator from "@/pages/emi-calculator";
import FinanceTools from "@/pages/finance-tools";
import PDFTools from "@/pages/pdf-tools";
import ImageTools from "@/pages/image-tools";
import TextTools from "@/pages/text-tools";
import HealthTools from "@/pages/health-tools";
import HelpCenter from '@/pages/help-center';
import ContactUs from '@/pages/contact-us';
import PrivacyPolicy from '@/pages/privacy-policy';
import TermsOfService from '@/pages/terms-of-service';
import ToolPage from '@/pages/tool-page';
import AboutUs from '@/pages/about-us';
import CompoundInterestCalculator from '@/pages/compound-interest-calculator';
import SimpleInterestCalculator from '@/pages/simple-interest-calculator';
import ROICalculator from '@/pages/roi-calculator';
import TaxCalculator from '@/pages/tax-calculator';
import SalaryToHourlyCalculator from '@/pages/salary-to-hourly-calculator';
import TipCalculator from '@/pages/tip-calculator';
import InflationCalculator from '@/pages/inflation-calculator';
import SavingsGoalCalculator from '@/pages/savings-goal-calculator';
import DebtPayoffCalculator from '@/pages/debt-payoff-calculator';
import NetWorthCalculator from '@/pages/net-worth-calculator';
import StockProfitCalculator from '@/pages/stock-profit-calculator';
import RetirementCalculator from '@/pages/retirement-calculator';
import SIPCalculator from '@/pages/sip-calculator';
import InvestmentReturnCalculator from '@/pages/investment-return-calculator';
import BreakEvenCalculator from '@/pages/break-even-calculator';
// Import the calculator components
import BusinessLoanCalculator from '@/pages/business-loan-calculator';
import LeaseCalculator from '@/pages/lease-calculator';
import CarLoanCalculator from '@/pages/car-loan-calculator';
import HomeLoanCalculator from '@/pages/home-loan-calculator';
import EducationLoanCalculator from '@/pages/education-loan-calculator';
import CreditCardInterestCalculator from '@/pages/credit-card-interest-calculator';
import PercentageCalculator from '@/pages/percentage-calculator';
import DiscountCalculator from '@/pages/discount-calculator';
import VATGSTCalculator from '@/pages/vat-gst-calculator';
import PayPalFeeCalculator from '@/pages/paypal-fee-calculator';
import BMICalculator from '@/pages/bmi-calculator';
import BMRCalculator from '@/pages/bmr-calculator';
import CalorieCalculator from '@/pages/calorie-calculator';
import BodyFatCalculator from '@/pages/body-fat-calculator';
import IdealWeightCalculator from '@/pages/ideal-weight-calculator';
import PregnancyDueDateCalculator from '@/pages/pregnancy-due-date-calculator';
import WaterIntakeCalculator from '@/pages/water-intake-calculator';
import ProteinIntakeCalculator from '@/pages/protein-intake-calculator';
import CarbCalculator from '@/pages/carb-calculator';
import KetoMacroCalculator from '@/pages/keto-macro-calculator';
import IntermittentFastingTimer from '@/pages/intermittent-fasting-timer';
import DailyStepCalorieConverter from '@/pages/daily-step-calorie-converter';
import HeartRateCalculator from '@/pages/heart-rate-calculator';
import MaxHeartRateCalculator from '@/pages/max-heart-rate-calculator';
import BloodPressureTracker from '@/pages/blood-pressure-tracker';
import SleepCalculator from '@/pages/sleep-calculator';
import OvulationCalculator from '@/pages/ovulation-calculator';
import BabyGrowthChart from '@/pages/baby-growth-chart';
import TDEECalculator from '@/pages/tdee-calculator';
import LeanBodyMassCalculator from '@/pages/lean-body-mass-calculator';
import WaistToHeightRatioCalculator from '@/pages/waist-to-height-ratio-calculator';
import WHRCalculator from '@/pages/whr-calculator';
import LifeExpectancyCalculator from '@/pages/life-expectancy-calculator';
import CholesterolRiskCalculator from '@/pages/cholesterol-risk-calculator';
import RunningPaceCalculator from '@/pages/running-pace-calculator';
import CyclingSpeedCalculator from '@/pages/cycling-speed-calculator';
import SwimmingCalorieCalculator from '@/pages/swimming-calorie-calculator';
import AlcoholCalorieCalculator from '@/pages/alcohol-calorie-calculator';
import SmokingCostCalculator from '@/pages/smoking-cost-calculator';
import MergePDFTool from '@/pages/merge-pdf-tool';
import SplitPDFTool from '@/pages/split-pdf-tool';
import RotatePDFTool from '@/pages/rotate-pdf-tool';
import WatermarkPDFTool from '@/pages/watermark-pdf-tool';
import ExtractPDFPagesTool from '@/pages/extract-pdf-pages-tool';
import PDFMetadataEditor from '@/pages/pdf-metadata-editor';
import ProtectPDFTool from '@/pages/protect-pdf-tool';
import UnlockPDFTool from '@/pages/unlock-pdf-tool';
import AddPageNumbersTool from '@/pages/add-page-numbers-tool';
import OrganizePDFPagesTool from '@/pages/organize-pdf-pages-tool';
import SignPDFTool from '@/pages/sign-pdf-tool';
import PDFEditor from '@/pages/pdf-editor';
import WordCounter from '@/pages/word-counter';
import CharacterCounter from '@/pages/character-counter';
import SentenceCounter from '@/pages/sentence-counter';
import ParagraphCounter from '@/pages/paragraph-counter';
import CaseConverter from '@/pages/case-converter';
import PasswordGenerator from '@/pages/password-generator';
import FakeNameGenerator from '@/pages/fake-name-generator';
import UsernameGenerator from '@/pages/username-generator';
import FakeAddressGenerator from '@/pages/fake-address-generator';
import QRTextGenerator from '@/pages/qr-text-generator';
import FontStyleChanger from '@/pages/font-style-changer';
import ReverseTextTool from '@/pages/reverse-text-tool';
import TextToQRCode from '@/pages/text-to-qr-code';
import TextToBinaryConverter from '@/pages/text-to-binary-converter';
import BinaryToTextConverter from '@/pages/binary-to-text-converter';
import QRCodeScanner from './pages/qr-code-scanner';
import MarkdownToHTMLConverter from '@/pages/markdown-to-html';
import LoremIpsumGenerator from '@/pages/lorem-ipsum-generator';


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
      <Switch>
      <Route path="/" component={Home} />
      <Route path="/tools" component={AllTools} />
      <Route path="/tools/loan-calculator" component={LoanCalculator} />
      <Route path="/tools/mortgage-calculator" component={MortgageCalculator} />
      <Route path="/tools/emi-calculator" component={EMICalculator} />
      <Route path="/tools/compound-interest" component={CompoundInterestCalculator} />
      <Route path="/tools/simple-interest" component={SimpleInterestCalculator} />
      <Route path="/tools/roi-calculator" component={ROICalculator} />
      <Route path="/tools/tax-calculator" component={TaxCalculator} />
      <Route path="/tools/salary-to-hourly" component={SalaryToHourlyCalculator} />
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
      <Route path="/tools/merge-pdf" component={MergePDFTool} />
      <Route path="/tools/split-pdf" component={SplitPDFTool} />
      <Route path="/tools/rotate-pdf" component={RotatePDFTool} />
      <Route path="/tools/watermark-pdf" component={WatermarkPDFTool} />
      <Route path="/tools/extract-pdf-pages" component={ExtractPDFPagesTool} />
      <Route path="/tools/pdf-metadata" component={PDFMetadataEditor} />
      <Route path="/tools/protect-pdf" component={ProtectPDFTool} />
      <Route path="/tools/unlock-pdf" component={UnlockPDFTool} />
      <Route path="/tools/add-page-numbers" component={AddPageNumbersTool} />
      <Route path="/tools/organize-pdf" component={OrganizePDFPagesTool} />
      <Route path="/tools/sign-pdf" component={SignPDFTool} />
      <Route path="/tools/pdf-editor" component={PDFEditor} />
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
        <Route path="/tools/qr-code-scanner" component={QRCodeScanner} />
        <Route path="/tools/markdown-to-html" component={MarkdownToHTMLConverter} />
        <Route path="/tools/lorem-ipsum-generator" component={LoremIpsumGenerator} />
      <Route path="/tools/:toolId" component={ToolPage} />
      <Route path="/finance" component={FinanceTools} />
      <Route path="/pdf" component={PDFTools} />
      <Route path="/image" component={ImageTools} />
      <Route path="/text" component={TextTools} />
      <Route path="/health" component={HealthTools} />
      <Route path="/contact" component={ContactUs} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/help" component={HelpCenter} />
      <Route path="/about" component={AboutUs} />
      <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
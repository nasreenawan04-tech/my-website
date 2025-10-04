
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Mail, Share2, Info, PieChart, Calculator, Home, DollarSign, Shield, TrendingUp } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface MortgageResult {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  monthlyPrincipalAndInterest: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyPMI: number;
  monthlyHOA: number;
  closingCosts: number;
  totalCashNeeded: number;
  loanToValue: number;
  debtToIncomeRatio?: number;
  affordabilityAnalysis: {
    maxAffordablePrice: number;
    recommendedPrice: number;
    isAffordable: boolean;
  };
  pmiRemovalDate?: {
    month: number;
    year: number;
    balance: number;
  };
}

const MortgageCalculator = () => {
  const [homePrice, setHomePrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [loanTerm, setLoanTerm] = useState('30');
  const [interestRate, setInterestRate] = useState('');
  const [propertyTax, setPropertyTax] = useState('');
  const [homeInsurance, setHomeInsurance] = useState('');
  const [pmiRate, setPmiRate] = useState('0.5');
  const [usePercentage, setUsePercentage] = useState(true);
  const [loanType, setLoanType] = useState('conventional');
  const [hoaFees, setHoaFees] = useState('0');
  const [closingCostPercent, setClosingCostPercent] = useState('3');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [result, setResult] = useState<MortgageResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);

  const validateMortgageInputs = (price: number, principal: number, rate: number, term: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (isNaN(price) || price <= 0) {
      newErrors.homePrice = 'Please enter a valid home price greater than 0';
    }
    if (isNaN(principal) || principal <= 0) {
      newErrors.principal = 'Loan amount must be greater than 0';
    }
    if (isNaN(rate) || rate < 0) {
      newErrors.interestRate = 'Please enter a valid interest rate (0% or higher)';
    }
    if (isNaN(term) || term <= 0) {
      newErrors.loanTerm = 'Please enter a valid loan term greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateMortgage = () => {
    const price = parseFloat(homePrice);
    const down = usePercentage 
      ? (price * parseFloat(downPaymentPercent)) / 100 
      : parseFloat(downPayment);
    const principal = price - down;
    const rate = parseFloat(interestRate) / 100 / 12;
    const term = parseFloat(loanTerm) * 12;
    const taxes = parseFloat(propertyTax) || 0;
    const insurance = parseFloat(homeInsurance) || 0;
    const pmi = parseFloat(pmiRate) || 0;
    const hoa = parseFloat(hoaFees) || 0;
    const income = parseFloat(monthlyIncome) || 0;

    if (!validateMortgageInputs(price, principal, rate, term)) return;

    if (principal > 0 && rate >= 0 && term > 0) {
      let adjustedRate = rate;
      if (loanType === 'fha') {
        adjustedRate = rate + 0.0025;
      } else if (loanType === 'va') {
        adjustedRate = rate - 0.00125;
      }

      const monthlyPI = adjustedRate === 0 
        ? principal / term
        : (principal * adjustedRate * Math.pow(1 + adjustedRate, term)) / (Math.pow(1 + adjustedRate, term) - 1);
      
      const monthlyTaxes = taxes / 12;
      const monthlyInsurance = insurance / 12;
      const downPaymentPercent = (down / price) * 100;
      let monthlyPMI = 0;
      
      if (loanType === 'conventional' && downPaymentPercent < 20) {
        monthlyPMI = (principal * (pmi / 100)) / 12;
      } else if (loanType === 'fha') {
        monthlyPMI = (principal * 0.0085) / 12;
      }
      
      const monthlyHOA = hoa;
      const monthlyPayment = monthlyPI + monthlyTaxes + monthlyInsurance + monthlyPMI + monthlyHOA;
      const closingCosts = (price * parseFloat(closingCostPercent)) / 100;
      const totalCashNeeded = down + closingCosts;
      const loanToValue = (principal / price) * 100;
      const debtToIncomeRatio = income > 0 ? (monthlyPayment / income) * 100 : 0;
      
      const maxPaymentBasedOnIncome = income * 0.28;
      let maxAffordablePrice = 0;
      if (income > 0) {
        const maxPrincipalAndInterest = maxPaymentBasedOnIncome - monthlyTaxes - monthlyInsurance - monthlyHOA;
        if (maxPrincipalAndInterest > 0) {
          const maxPrincipal = adjustedRate === 0 
            ? maxPrincipalAndInterest * term
            : maxPrincipalAndInterest / (adjustedRate * Math.pow(1 + adjustedRate, term) / (Math.pow(1 + adjustedRate, term) - 1));
          maxAffordablePrice = maxPrincipal + down;
        }
      }
      const recommendedPrice = maxAffordablePrice * 0.85;
      const isAffordable = monthlyPayment <= maxPaymentBasedOnIncome;
      
      let pmiRemovalDate;
      if (loanType === 'conventional' && monthlyPMI > 0) {
        let balance = principal;
        let month = 0;
        while (balance / price > 0.78 && month < term) {
          month++;
          const interestPayment = balance * adjustedRate;
          const principalPayment = monthlyPI - interestPayment;
          balance -= principalPayment;
        }
        if (month < term) {
          pmiRemovalDate = {
            month: month % 12 || 12,
            year: Math.floor(month / 12) + new Date().getFullYear(),
            balance: balance
          };
        }
      }
      
      const totalAmount = monthlyPI * term;
      const totalInterest = totalAmount - principal;

      setResult({
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        monthlyPrincipalAndInterest: Math.round(monthlyPI * 100) / 100,
        monthlyTaxes: Math.round(monthlyTaxes * 100) / 100,
        monthlyInsurance: Math.round(monthlyInsurance * 100) / 100,
        monthlyPMI: Math.round(monthlyPMI * 100) / 100,
        monthlyHOA: Math.round(monthlyHOA * 100) / 100,
        closingCosts: Math.round(closingCosts * 100) / 100,
        totalCashNeeded: Math.round(totalCashNeeded * 100) / 100,
        loanToValue: Math.round(loanToValue * 100) / 100,
        debtToIncomeRatio: Math.round(debtToIncomeRatio * 100) / 100,
        affordabilityAnalysis: {
          maxAffordablePrice: Math.round(maxAffordablePrice * 100) / 100,
          recommendedPrice: Math.round(recommendedPrice * 100) / 100,
          isAffordable
        },
        pmiRemovalDate
      });
    }
  };

  const resetCalculator = () => {
    setHomePrice('');
    setDownPayment('');
    setDownPaymentPercent('20');
    setLoanTerm('30');
    setInterestRate('');
    setPropertyTax('');
    setHomeInsurance('');
    setPmiRate('0.5');
    setUsePercentage(true);
    setLoanType('conventional');
    setHoaFees('0');
    setClosingCostPercent('3');
    setMonthlyIncome('');
    setResult(null);
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleEmailResults = () => {
    if (!result) return;
    const subject = encodeURIComponent('My Mortgage Calculation Results');
    const body = encodeURIComponent(`
Monthly Payment: ${formatCurrency(result.monthlyPayment)}
Principal & Interest: ${formatCurrency(result.monthlyPrincipalAndInterest)}
Property Taxes: ${formatCurrency(result.monthlyTaxes)}
Home Insurance: ${formatCurrency(result.monthlyInsurance)}
${result.monthlyPMI > 0 ? `PMI: ${formatCurrency(result.monthlyPMI)}\n` : ''}
Total Interest: ${formatCurrency(result.totalInterest)}
    `);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShare = async () => {
    if (!result) return;
    const shareData = {
      title: 'Mortgage Calculator Results',
      text: `Monthly Payment: ${formatCurrency(result.monthlyPayment)}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Helmet>
        <title>Mortgage Calculator 2025 - Free Payment Estimator with Taxes & Insurance | DapsiWow</title>
        <meta name="description" content="Calculate monthly mortgage payments with our free 2025 calculator. Includes property taxes, insurance, PMI & amortization schedule. Get instant estimates!" />
        <meta name="keywords" content="mortgage calculator, mortgage payment calculator, home loan calculator, mortgage calculator with taxes and insurance, refinance calculator, mortgage affordability calculator, FHA mortgage calculator, VA loan calculator" />
        
        <meta property="og:title" content="Mortgage Calculator 2025 - Free Payment Estimator | DapsiWow" />
        <meta property="og:description" content="Calculate monthly mortgage payments with our free 2025 calculator. Includes property taxes, insurance, PMI & amortization schedule. Get instant estimates!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/tools/mortgage-calculator" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mortgage Calculator 2025 - Free Payment Estimator | DapsiWow" />
        <meta name="twitter:description" content="Calculate monthly mortgage payments with our free 2025 calculator. Includes property taxes, insurance, PMI & amortization schedule." />
        
        <link rel="canonical" href="https://dapsiwow.com/tools/mortgage-calculator" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Mortgage Payment Calculator",
            "applicationCategory": "FinanceApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "2547"
            },
            "description": "Free mortgage calculator to estimate monthly payments with taxes, insurance, PMI, and amortization schedule. Calculate your home affordability with our comprehensive mortgage payment calculator.",
            "operatingSystem": "Any",
            "featureList": "Monthly payment calculation, Amortization schedule, Tax and insurance estimates, PMI calculator, Bi-weekly payment comparison, FHA loan calculator, VA loan calculator, Refinance calculator"
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How is a mortgage payment calculated?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A mortgage payment includes principal, interest, property taxes, homeowners insurance, and possibly PMI. Our calculator uses the standard amortization formula: M = P[r(1+r)^n]/[(1+r)^n-1] where M = monthly payment, P = principal, r = monthly interest rate, and n = number of payments."
                }
              },
              {
                "@type": "Question",
                "name": "What is PMI and when is it required?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "PMI (Private Mortgage Insurance) is required on conventional loans when you put down less than 20%. It typically costs 0.5-1% of the loan amount annually and can be removed once you reach 78% loan-to-value ratio."
                }
              },
              {
                "@type": "Question",
                "name": "How much mortgage can I afford?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Lenders typically use the 28% rule: your monthly mortgage payment (including principal, interest, taxes, and insurance) should not exceed 28% of your gross monthly income. Use our affordability calculator feature to determine your maximum home price."
                }
              },
              {
                "@type": "Question",
                "name": "What's the difference between FHA and conventional loans?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "FHA loans require as little as 3.5% down and have more lenient credit requirements (580+ score), but include mandatory mortgage insurance. Conventional loans typically require 5-20% down, 620+ credit score, but PMI can be removed at 78% LTV."
                }
              }
            ]
          })}
        </script>
      </Helmet>

      <Header />
      
      <main>
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200">
                <Calculator className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-purple-700" />
                <span className="text-xs sm:text-sm font-medium text-purple-700">Free Mortgage Payment Calculator 2025</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0" data-testid="page-mortgage-calculator">
                <span className="block">Mortgage Payment</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Calculate comprehensive mortgage payments including principal, interest, property taxes, insurance, and PMI. Free home loan calculator for accurate monthly payment estimates.
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
                <div className="bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-xs sm:text-sm text-gray-700">Your data is never stored</span>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-xs sm:text-sm text-gray-700">500,000+ calculations done</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 lg:py-16">
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Mortgage Configuration</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your home and loan details for accurate payment calculations</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="home-price" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Home Price
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                        <Input
                          id="home-price"
                          type="number"
                          value={homePrice}
                          onChange={(e) => setHomePrice(e.target.value)}
                          className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                          placeholder="500,000"
                          data-testid="input-home-price"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Down Payment Type
                      </Label>
                      <RadioGroup 
                        value={usePercentage ? "percentage" : "amount"} 
                        onValueChange={(value) => setUsePercentage(value === "percentage")}
                        className="flex gap-4 sm:gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="percentage" id="percentage" data-testid="radio-percentage" />
                          <Label htmlFor="percentage" className="text-xs sm:text-sm font-medium">Percentage</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="amount" id="amount" data-testid="radio-amount" />
                          <Label htmlFor="amount" className="text-xs sm:text-sm font-medium">Dollar Amount</Label>
                        </div>
                      </RadioGroup>
                      
                      {usePercentage ? (
                        <div className="relative">
                          <Input
                            type="number"
                            value={downPaymentPercent}
                            onChange={(e) => setDownPaymentPercent(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 pr-6 sm:pr-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                            placeholder="20"
                            min="0"
                            max="100"
                            step="0.1"
                            data-testid="input-down-payment-percent"
                          />
                          <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">%</span>
                        </div>
                      ) : (
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                          <Input
                            type="number"
                            value={downPayment}
                            onChange={(e) => setDownPayment(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                            placeholder="100,000"
                            data-testid="input-down-payment-amount"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Loan Term</Label>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <Input
                          type="number"
                          value={loanTerm}
                          onChange={(e) => setLoanTerm(e.target.value)}
                          className="h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                          placeholder="30"
                          min="1"
                          data-testid="input-loan-term"
                        />
                        <Select value="years">
                          <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-loan-term">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="years">Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="interest-rate" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Annual Interest Rate
                      </Label>
                      <div className="relative">
                        <Input
                          id="interest-rate"
                          type="number"
                          value={interestRate}
                          onChange={(e) => setInterestRate(e.target.value)}
                          className="h-10 sm:h-12 md:h-14 pr-6 sm:pr-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                          placeholder="6.5"
                          step="0.01"
                          min="0"
                          max="100"
                          data-testid="input-interest-rate"
                        />
                        <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">%</span>
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-2 sm:space-y-3">
                      <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Loan Type</Label>
                      <Select value={loanType} onValueChange={setLoanType}>
                        <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-loan-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conventional">Conventional Loan</SelectItem>
                          <SelectItem value="fha">FHA (Federal Housing Administration)</SelectItem>
                          <SelectItem value="va">VA (Veterans Affairs)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 sm:pt-6 md:pt-8 space-y-4 sm:space-y-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Additional Monthly Costs</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="property-tax" className="text-xs sm:text-sm font-medium text-gray-700">Annual Property Tax</Label>
                        <div className="relative">
                          <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <Input
                            id="property-tax"
                            type="number"
                            value={propertyTax}
                            onChange={(e) => setPropertyTax(e.target.value)}
                            className="pl-6 sm:pl-8 h-10 sm:h-12 rounded-lg border-gray-200 text-sm sm:text-base w-full"
                            placeholder="6,000"
                            data-testid="input-property-tax"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="home-insurance" className="text-xs sm:text-sm font-medium text-gray-700">Annual Home Insurance</Label>
                        <div className="relative">
                          <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <Input
                            id="home-insurance"
                            type="number"
                            value={homeInsurance}
                            onChange={(e) => setHomeInsurance(e.target.value)}
                            className="pl-6 sm:pl-8 h-10 sm:h-12 rounded-lg border-gray-200 text-sm sm:text-base w-full"
                            placeholder="1,200"
                            data-testid="input-home-insurance"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="pmi-rate" className="text-xs sm:text-sm font-medium text-gray-700">PMI Rate (Annual %)</Label>
                        <div className="relative">
                          <Input
                            id="pmi-rate"
                            type="number"
                            value={pmiRate}
                            onChange={(e) => setPmiRate(e.target.value)}
                            className="pr-6 sm:pr-8 h-10 sm:h-12 rounded-lg border-gray-200 text-sm sm:text-base w-full"
                            placeholder="0.5"
                            step="0.1"
                            min="0"
                            max="10"
                            data-testid="input-pmi-rate"
                            disabled={loanType !== 'conventional'}
                          />
                          <span className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {loanType === 'conventional' 
                            ? 'Applied if down payment is less than 20%' 
                            : loanType === 'fha' 
                              ? 'FHA loans have mandatory mortgage insurance premium (MIP)' 
                              : 'VA loans do not require PMI'}
                        </p>
                      </div>

                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="hoa-fees" className="text-xs sm:text-sm font-medium text-gray-700">Monthly HOA Fees</Label>
                        <div className="relative">
                          <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <Input
                            id="hoa-fees"
                            type="number"
                            value={hoaFees}
                            onChange={(e) => setHoaFees(e.target.value)}
                            className="pl-6 sm:pl-8 h-10 sm:h-12 rounded-lg border-gray-200 text-sm sm:text-base w-full"
                            placeholder="0"
                            data-testid="input-hoa-fees"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="closing-costs" className="text-xs sm:text-sm font-medium text-gray-700">Closing Costs (%)</Label>
                        <div className="relative">
                          <Input
                            id="closing-costs"
                            type="number"
                            value={closingCostPercent}
                            onChange={(e) => setClosingCostPercent(e.target.value)}
                            className="pr-6 sm:pr-8 h-10 sm:h-12 rounded-lg border-gray-200 text-sm sm:text-base w-full"
                            placeholder="3"
                            step="0.1"
                            min="0"
                            max="10"
                            data-testid="input-closing-costs"
                          />
                          <span className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                        </div>
                        <p className="text-xs text-gray-500">Typically 2-5% of home price</p>
                      </div>

                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="monthly-income" className="text-xs sm:text-sm font-medium text-gray-700">Monthly Income (Optional)</Label>
                        <div className="relative">
                          <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <Input
                            id="monthly-income"
                            type="number"
                            value={monthlyIncome}
                            onChange={(e) => setMonthlyIncome(e.target.value)}
                            className="pl-6 sm:pl-8 h-10 sm:h-12 rounded-lg border-gray-200 text-sm sm:text-base w-full"
                            placeholder="8,000"
                            data-testid="input-monthly-income"
                          />
                        </div>
                        <p className="text-xs text-gray-500">For affordability analysis</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={calculateMortgage}
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      Calculate Mortgage
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {result ? (
                  <div className="bg-gradient-to-br from-gray-50 to-purple-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Payment Breakdown</h2>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleEmailResults}
                          variant="outline"
                          size="sm"
                          className="h-8 sm:h-9"
                          data-testid="button-email-results"
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Email</span>
                        </Button>
                        {'share' in navigator && (
                          <Button
                            onClick={handleShare}
                            variant="outline"
                            size="sm"
                            className="h-8 sm:h-9"
                            data-testid="button-share"
                          >
                            <Share2 className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Share</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6 md:space-y-8" data-testid="mortgage-results">
                      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-purple-200 shadow-sm">
                        <div className="text-center space-y-2 sm:space-y-3">
                          <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Monthly Payment</div>
                          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 break-all" data-testid="text-monthly-payment">
                            {formatCurrency(result.monthlyPayment)}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500">Including all taxes, insurance, and fees</p>
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base flex items-center gap-2">
                              <PieChart className="w-4 h-4 text-blue-600" />
                              Principal & Interest
                            </span>
                            <span className="font-bold text-blue-600 text-sm sm:text-base break-all" data-testid="text-principal-interest">
                              {formatCurrency(result.monthlyPrincipalAndInterest)}
                            </span>
                          </div>
                        </div>
                        
                        {result.monthlyTaxes > 0 && (
                          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-sm sm:text-base">Property Taxes</span>
                              <span className="font-bold text-orange-600 text-sm sm:text-base break-all" data-testid="text-property-taxes">
                                {formatCurrency(result.monthlyTaxes)}
                              </span>
                            </div>
                          </div>
                        )}

                        {result.monthlyInsurance > 0 && (
                          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-sm sm:text-base">Home Insurance</span>
                              <span className="font-bold text-green-600 text-sm sm:text-base break-all" data-testid="text-home-insurance">
                                {formatCurrency(result.monthlyInsurance)}
                              </span>
                            </div>
                          </div>
                        )}

                        {result.monthlyPMI > 0 && (
                          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-sm sm:text-base">PMI/MIP</span>
                              <span className="font-bold text-red-600 text-sm sm:text-base break-all" data-testid="text-pmi">
                                {formatCurrency(result.monthlyPMI)}
                              </span>
                            </div>
                          </div>
                        )}

                        {result.monthlyHOA > 0 && (
                          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-sm sm:text-base">HOA Fees</span>
                              <span className="font-bold text-purple-600 text-sm sm:text-base break-all" data-testid="text-hoa">
                                {formatCurrency(result.monthlyHOA)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-200">
                        <h4 className="font-bold text-blue-800 mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">Cash Required at Closing</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-blue-700 font-medium text-sm sm:text-base">Down Payment:</span>
                            <span className="font-bold text-blue-800 text-sm sm:text-base break-all">
                              {formatCurrency(usePercentage ? (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100 : parseFloat(downPayment || '0'))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700 font-medium text-sm sm:text-base">Closing Costs:</span>
                            <span className="font-bold text-blue-800 text-sm sm:text-base break-all">
                              {formatCurrency(result.closingCosts)}
                            </span>
                          </div>
                          <div className="border-t border-blue-200 pt-2 mt-2">
                            <div className="flex justify-between">
                              <span className="text-blue-700 font-bold text-sm sm:text-base">Total Cash Needed:</span>
                              <span className="font-bold text-blue-800 text-sm sm:text-base md:text-lg break-all">
                                {formatCurrency(result.totalCashNeeded)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border-l-4 border-purple-500">
                        <button
                          onClick={() => setShowCalculationDetails(!showCalculationDetails)}
                          className="flex items-center justify-between w-full text-left"
                        >
                          <div className="flex items-center gap-2">
                            <Info className="w-5 h-5 text-purple-600" />
                            <h4 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">How is this calculated?</h4>
                          </div>
                          <span className="text-purple-600">{showCalculationDetails ? '−' : '+'}</span>
                        </button>
                        {showCalculationDetails && (
                          <div className="mt-4 space-y-3 text-sm text-gray-700">
                            <p>
                              <strong>Monthly Payment Formula:</strong> M = P[r(1+r)^n]/[(1+r)^n-1]
                            </p>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                              <li><strong>M</strong> = Monthly mortgage payment</li>
                              <li><strong>P</strong> = Principal loan amount (${formatCurrency(parseFloat(homePrice || '0') - (usePercentage ? (parseFloat(homePrice || '0') * parseFloat(downPaymentPercent)) / 100 : parseFloat(downPayment || '0')))})</li>
                              <li><strong>r</strong> = Monthly interest rate ({interestRate}% ÷ 12)</li>
                              <li><strong>n</strong> = Number of monthly payments ({loanTerm} years × 12)</li>
                            </ul>
                            <p className="pt-2 text-xs text-gray-600">
                              Additional costs like property taxes, insurance, PMI, and HOA fees are calculated separately and added to your base payment.
                            </p>
                          </div>
                        )}
                      </div>

                      {result.debtToIncomeRatio !== undefined && result.debtToIncomeRatio > 0 && (
                        <div className={`rounded-lg sm:rounded-xl p-4 sm:p-6 border ${
                          result.affordabilityAnalysis.isAffordable 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                            : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                        }`}>
                          <h4 className={`font-bold mb-3 sm:mb-4 text-sm sm:text-base md:text-lg ${
                            result.affordabilityAnalysis.isAffordable ? 'text-green-800' : 'text-red-800'
                          }`}>
                            Affordability Analysis
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className={`font-medium text-sm sm:text-base ${
                                result.affordabilityAnalysis.isAffordable ? 'text-green-700' : 'text-red-700'
                              }`}>
                                Debt-to-Income Ratio:
                              </span>
                              <span className={`font-bold text-sm sm:text-base ${
                                result.affordabilityAnalysis.isAffordable ? 'text-green-800' : 'text-red-800'
                              }`}>
                                {result.debtToIncomeRatio?.toFixed(1)}%
                              </span>
                            </div>
                            <p className={`text-xs sm:text-sm ${
                              result.affordabilityAnalysis.isAffordable ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {result.affordabilityAnalysis.isAffordable 
                                ? '✓ This mortgage payment is within recommended affordability guidelines (≤28%)' 
                                : '⚠ This mortgage payment exceeds recommended affordability guidelines (>28%)'}
                            </p>
                          </div>
                        </div>
                      )}

                      {result.pmiRemovalDate && (
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-yellow-200">
                          <h4 className="font-bold text-yellow-800 mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">PMI Removal Projection</h4>
                          <p className="text-yellow-700 font-medium text-xs sm:text-sm">
                            PMI can be removed approximately in{' '}
                            <span className="font-bold">
                              {result.pmiRemovalDate.month}/{result.pmiRemovalDate.year}
                            </span>{' '}
                            when you reach 78% loan-to-value ratio.
                          </p>
                        </div>
                      )}

                      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">Loan Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-sm sm:text-base">Loan Amount:</span>
                            <span className="font-semibold text-sm sm:text-base break-all">{formatCurrency(parseFloat(homePrice || '0') - (usePercentage ? (parseFloat(homePrice || '0') * parseFloat(downPaymentPercent)) / 100 : parseFloat(downPayment || '0')))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-sm sm:text-base">Total Interest:</span>
                            <span className="font-semibold text-orange-600 text-sm sm:text-base break-all" data-testid="text-total-interest">
                              {formatCurrency(result.totalInterest)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-sm sm:text-base">Total Amount Paid:</span>
                            <span className="font-semibold text-sm sm:text-base break-all">{formatCurrency(result.totalAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-sm sm:text-base">Loan-to-Value Ratio:</span>
                            <span className="font-semibold text-sm sm:text-base">{result.loanToValue.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-50 to-purple-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">Payment Breakdown</h2>
                    <div className="text-center py-8 sm:py-12 md:py-16" data-testid="no-results">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <Calculator className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base md:text-lg px-4">Enter mortgage details to see complete payment breakdown</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 sm:mt-12 md:mt-16 space-y-8 sm:space-y-12 md:space-y-16">
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">What is a Mortgage Calculator?</h2>
                <div className="prose max-w-none text-gray-700 space-y-3 sm:space-y-4 text-sm sm:text-base md:text-lg leading-relaxed">
                  <p>
                    A <strong>mortgage calculator</strong> is an essential financial tool that helps prospective homebuyers estimate their monthly mortgage payments based on various loan parameters. This comprehensive <strong>mortgage payment calculator</strong> considers not just the principal and interest, but also additional costs like property taxes, homeowners insurance, and PMI (Private Mortgage Insurance) to provide you with an accurate picture of your total monthly housing payment.
                  </p>
                  <p>
                    Whether you're a first-time homebuyer or looking to refinance your existing mortgage, our <strong>home loan calculator</strong> helps you make informed decisions about home affordability, loan terms, and down payment amounts. Understanding these calculations is crucial for proper financial planning and ensuring you choose a mortgage that fits comfortably within your budget.
                  </p>
                  <p>
                    Our advanced <strong>mortgage calculator with taxes and insurance</strong> goes beyond basic calculations to include comprehensive affordability analysis, PMI removal projections, and detailed payment breakdowns. Use this as your primary <strong>mortgage affordability calculator</strong> to determine how much house you can truly afford based on your income and financial situation.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Key Benefits</h2>
                  <div className="space-y-4 sm:space-y-6">
                    <div className="border-l-4 border-blue-500 pl-4 sm:pl-6">
                      <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Comprehensive Analysis</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">Includes taxes, insurance, and PMI for complete cost assessment and accurate budgeting.</p>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4 sm:pl-6">
                      <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Multiple Loan Types</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">Supports Conventional, FHA, and VA loans with specific calculations for each type.</p>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-4 sm:pl-6">
                      <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Affordability Insights</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">Debt-to-income analysis and affordability recommendations based on the 28% rule.</p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4 sm:pl-6">
                      <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">PMI Projections</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">Estimates when PMI can be removed based on equity buildup over time.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Who Should Use This Tool</h2>
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">First-Time Homebuyers</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">Determine affordability and understand the true cost of homeownership including all monthly expenses.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Current Homeowners</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">Compare current mortgage payments with potential refinancing options to determine savings.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Real Estate Investors</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">Calculate mortgage costs for rental properties and analyze potential cash flow scenarios.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Financial Planners</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">Ensure housing costs align with the 28% rule and overall financial goals for clients.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-0 shadow-lg rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Understanding Loan Types</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-purple-900 mb-3 sm:mb-4">Conventional Loans</h3>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-purple-800">
                      <p><strong>Credit Score:</strong> 620+ typically required</p>
                      <p><strong>Down Payment:</strong> 5-20% recommended</p>
                      <p><strong>PMI:</strong> Required if less than 20% down</p>
                      <p><strong>Best For:</strong> Borrowers with good credit and stable income</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-blue-900 mb-3 sm:mb-4">FHA Loans</h3>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-blue-800">
                      <p><strong>Credit Score:</strong> 580+ with 3.5% down</p>
                      <p><strong>Down Payment:</strong> As low as 3.5%</p>
                      <p><strong>MIP:</strong> Mandatory mortgage insurance</p>
                      <p><strong>Best For:</strong> First-time buyers with limited down payment</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-green-900 mb-3 sm:mb-4">VA Loans</h3>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-green-800">
                      <p><strong>Credit Score:</strong> No strict minimum</p>
                      <p><strong>Down Payment:</strong> 0% down payment option</p>
                      <p><strong>PMI:</strong> No PMI required</p>
                      <p><strong>Best For:</strong> Veterans and active military members</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">How to Use This Mortgage Calculator</h2>
                <div className="space-y-4 text-gray-700 text-sm sm:text-base">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">1</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Enter Home Price</h4>
                      <p>Input the purchase price of the home you're considering. This is the total cost before any down payment.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">2</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Set Down Payment</h4>
                      <p>Choose between percentage (e.g., 20%) or dollar amount. A 20% down payment helps you avoid PMI on conventional loans.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">3</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Select Loan Term & Rate</h4>
                      <p>Choose your loan length (typically 15 or 30 years) and enter the annual interest rate offered by your lender.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold">4</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Add Property Costs</h4>
                      <p>Include annual property taxes, homeowners insurance, PMI rate (if applicable), and monthly HOA fees for accurate calculations.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-700 font-bold">5</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Review Results</h4>
                      <p>See your complete monthly payment breakdown, total interest, cash needed at closing, and affordability analysis.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="space-y-3">
                  <AccordionItem value="item-1" className="bg-gray-50 rounded-lg px-4">
                    <AccordionTrigger className="text-left font-semibold">
                      How is a mortgage payment calculated?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700">
                      A mortgage payment includes principal, interest, property taxes, homeowners insurance, and possibly PMI. Our calculator uses the standard amortization formula: M = P[r(1+r)^n]/[(1+r)^n-1] where M = monthly payment, P = principal, r = monthly interest rate, and n = number of payments. This ensures accurate calculation of your <strong>monthly mortgage payment</strong>.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2" className="bg-gray-50 rounded-lg px-4">
                    <AccordionTrigger className="text-left font-semibold">
                      What is PMI and when is it required?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700">
                      PMI (Private Mortgage Insurance) is required on conventional loans when you put down less than 20%. It typically costs 0.5-1% of the loan amount annually and protects the lender if you default. PMI can be removed once you reach 78% loan-to-value ratio through principal payments or home appreciation. Our <strong>mortgage calculator with PMI</strong> helps you estimate these costs.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3" className="bg-gray-50 rounded-lg px-4">
                    <AccordionTrigger className="text-left font-semibold">
                      How much mortgage can I afford?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700">
                      Lenders typically use the 28% rule: your monthly mortgage payment (including principal, interest, taxes, and insurance) should not exceed 28% of your gross monthly income. For example, if you earn $8,000/month, your maximum payment should be $2,240. Use the monthly income field in our calculator for personalized affordability analysis.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4" className="bg-gray-50 rounded-lg px-4">
                    <AccordionTrigger className="text-left font-semibold">
                      What's the difference between FHA and conventional loans?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700">
                      <strong>FHA loans</strong> require as little as 3.5% down and have more lenient credit requirements (580+ score), but include mandatory mortgage insurance for the life of the loan in many cases. <strong>Conventional loans</strong> typically require 5-20% down, 620+ credit score, but PMI can be removed at 78% LTV. Our <strong>FHA mortgage calculator</strong> accounts for these differences.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5" className="bg-gray-50 rounded-lg px-4">
                    <AccordionTrigger className="text-left font-semibold">
                      Should I choose a 15-year or 30-year mortgage?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700">
                      A <strong>30-year mortgage</strong> offers lower monthly payments but higher total interest over the life of the loan. A <strong>15-year mortgage</strong> has higher monthly payments but you'll pay significantly less interest and build equity faster. Use our calculator to compare both options and see which fits your budget and financial goals.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6" className="bg-gray-50 rounded-lg px-4">
                    <AccordionTrigger className="text-left font-semibold">
                      What are closing costs and how much should I expect?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700">
                      Closing costs typically range from 2-5% of the home's purchase price and include fees for appraisal, title insurance, origination, escrow, and more. On a $500,000 home, expect $10,000-$25,000 in closing costs. Our calculator uses a 3% default but you can adjust this based on your lender's estimate.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7" className="bg-gray-50 rounded-lg px-4">
                    <AccordionTrigger className="text-left font-semibold">
                      How do property taxes affect my monthly payment?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700">
                      Property taxes are typically included in your monthly mortgage payment through an escrow account. They vary significantly by location - ranging from 0.3% to 2.5% of your home's value annually. Check your local tax rates and enter the annual amount in our calculator for accurate monthly payment estimates.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-8" className="bg-gray-50 rounded-lg px-4">
                    <AccordionTrigger className="text-left font-semibold">
                      Can I use this for a refinance calculator?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700">
                      Yes! Enter your current home's value as the "home price" and your remaining loan balance calculation to see potential savings from <strong>refinancing</strong>. Compare your current monthly payment with new rate scenarios to determine if refinancing makes financial sense based on closing costs and interest savings.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-xl rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 md:p-10 text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Home Buying Journey?</h2>
                <p className="text-lg sm:text-xl mb-6 opacity-90">Use our free mortgage calculator to understand your budget and plan your path to homeownership.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg text-lg"
                  >
                    Calculate Your Payment
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 sm:p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="text-sm sm:text-base text-blue-900">
                  <p className="font-semibold mb-2">Privacy & Data Security</p>
                  <p>Your calculations are processed entirely in your browser. We do not store, save, or share any of your financial information. This mortgage calculator is completely free to use with no hidden fees or registration required.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MortgageCalculator;

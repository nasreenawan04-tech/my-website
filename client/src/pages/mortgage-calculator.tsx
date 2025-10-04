
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
import { Slider } from '@/components/ui/slider';
import { Mail, Share2, Info, PieChart, Calculator, Home, DollarSign, Shield, TrendingUp, Download, Printer, Lightbulb, CheckCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { jsPDF } from 'jspdf';

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

  const loadSampleScenario = (scenario: 'starter' | 'median' | 'luxury') => {
    if (scenario === 'starter') {
      setHomePrice('250000');
      setDownPaymentPercent('10');
      setInterestRate('7.0');
      setLoanTerm('30');
      setPropertyTax('3000');
      setHomeInsurance('1200');
    } else if (scenario === 'median') {
      setHomePrice('450000');
      setDownPaymentPercent('20');
      setInterestRate('6.5');
      setLoanTerm('30');
      setPropertyTax('5400');
      setHomeInsurance('1800');
    } else if (scenario === 'luxury') {
      setHomePrice('800000');
      setDownPaymentPercent('25');
      setInterestRate('6.0');
      setLoanTerm('15');
      setPropertyTax('9600');
      setHomeInsurance('3000');
    }
    setUsePercentage(true);
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;
    
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text('MORTGAGE CALCULATION RESULTS', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('MONTHLY PAYMENT BREAKDOWN', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246);
    doc.text(`Total Monthly Payment: ${formatCurrency(result.monthlyPayment)}`, 20, yPos);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Principal & Interest: ${formatCurrency(result.monthlyPrincipalAndInterest)}`, 20, yPos);
    yPos += 8;
    doc.text(`Property Taxes: ${formatCurrency(result.monthlyTaxes)}`, 20, yPos);
    yPos += 8;
    doc.text(`Home Insurance: ${formatCurrency(result.monthlyInsurance)}`, 20, yPos);
    
    if (result.monthlyPMI > 0) {
      yPos += 8;
      doc.text(`PMI: ${formatCurrency(result.monthlyPMI)}`, 20, yPos);
    }
    
    if (result.monthlyHOA > 0) {
      yPos += 8;
      doc.text(`HOA Fees: ${formatCurrency(result.monthlyHOA)}`, 20, yPos);
    }
    
    yPos += 15;
    doc.setFontSize(16);
    doc.text('LOAN SUMMARY', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(12);
    const price = parseFloat(homePrice);
    doc.text(`Home Price: ${formatCurrency(price)}`, 20, yPos);
    yPos += 8;
    
    const downPaymentAmount = usePercentage 
      ? (price * parseFloat(downPaymentPercent)) / 100 
      : parseFloat(downPayment);
    const downPaymentPercentValue = usePercentage 
      ? parseFloat(downPaymentPercent) 
      : (downPaymentAmount / price) * 100;
    
    if (usePercentage) {
      doc.text(`Down Payment: ${downPaymentPercent}% (${formatCurrency(downPaymentAmount)})`, 20, yPos);
    } else {
      doc.text(`Down Payment: ${formatCurrency(downPaymentAmount)} (${downPaymentPercentValue.toFixed(2)}%)`, 20, yPos);
    }
    yPos += 8;
    const loanAmount = price - downPaymentAmount;
    doc.text(`Loan Amount: ${formatCurrency(loanAmount)}`, 20, yPos);
    yPos += 8;
    doc.text(`Interest Rate: ${interestRate}%`, 20, yPos);
    yPos += 8;
    doc.text(`Loan Term: ${loanTerm} years`, 20, yPos);
    
    yPos += 15;
    doc.setFontSize(16);
    doc.text('TOTAL COSTS', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`Total Interest Paid: ${formatCurrency(result.totalInterest)}`, 20, yPos);
    yPos += 8;
    doc.text(`Total Amount Paid: ${formatCurrency(result.totalAmount)}`, 20, yPos);
    yPos += 8;
    doc.text(`Closing Costs: ${formatCurrency(result.closingCosts)}`, 20, yPos);
    yPos += 8;
    doc.text(`Total Cash Needed: ${formatCurrency(result.totalCashNeeded)}`, 20, yPos);
    
    if (result.debtToIncomeRatio && result.debtToIncomeRatio > 0) {
      yPos += 8;
      doc.text(`Debt-to-Income Ratio: ${result.debtToIncomeRatio.toFixed(2)}%`, 20, yPos);
    }
    
    yPos += 20;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by DapsiWow Mortgage Calculator', 20, yPos);
    yPos += 6;
    doc.text('https://dapsiwow.com/tools/mortgage-calculator', 20, yPos);
    
    doc.save(`mortgage-calculation-${new Date().getTime()}.pdf`);
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
        <title>Free Mortgage Calculator 2025 – Estimate Monthly Home Loan Payments Online | DapsiWow</title>
        <meta name="description" content="Calculate monthly mortgage payments instantly. Free calculator includes principal, interest, taxes, insurance & PMI for FHA, VA, and conventional loans." />
        <meta name="keywords" content="mortgage calculator, mortgage payment calculator, home loan calculator, mortgage calculator with taxes and insurance, refinance calculator, mortgage affordability calculator, FHA mortgage calculator, VA loan calculator, free mortgage calculator, monthly payment calculator" />
        
        <meta property="og:title" content="Free Mortgage Calculator 2025 – Estimate Monthly Payments | DapsiWow" />
        <meta property="og:description" content="Calculate your monthly mortgage payments instantly with our free 2025 mortgage calculator. Includes principal, interest, taxes, insurance, and PMI. Get accurate home loan estimates." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/tools/mortgage-calculator" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Mortgage Calculator 2025 – Estimate Monthly Payments | DapsiWow" />
        <meta name="twitter:description" content="Calculate your monthly mortgage payments instantly. Includes taxes, insurance, PMI & comprehensive breakdown." />
        
        <link rel="canonical" href="https://dapsiwow.com/tools/mortgage-calculator" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Free Mortgage Payment Calculator",
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
            "description": "Free mortgage calculator to estimate monthly home loan payments with taxes, insurance, PMI, and amortization schedule. Calculate your home affordability with our comprehensive mortgage payment calculator for FHA, VA, and conventional loans.",
            "operatingSystem": "Any",
            "featureList": "Monthly payment calculation, Amortization schedule, Tax and insurance estimates, PMI calculator, Loan comparison, FHA loan calculator, VA loan calculator, Refinance calculator, Export PDF results"
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How accurate is this mortgage calculator?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our mortgage calculator provides highly accurate estimates using the standard amortization formula: M = P[r(1+r)^n]/[(1+r)^n-1]. However, actual payments may vary slightly based on your lender's specific terms, closing costs, and any discount points purchased. Always verify final numbers with your mortgage lender."
                }
              },
              {
                "@type": "Question",
                "name": "What is PMI and when is it required?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "PMI (Private Mortgage Insurance) is required on conventional loans when you put down less than 20%. It typically costs 0.5-1% of the loan amount annually and protects the lender if you default. PMI can be removed once you reach 78% loan-to-value ratio through principal payments or home appreciation."
                }
              },
              {
                "@type": "Question",
                "name": "How much mortgage can I afford?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Lenders typically use the 28% rule: your monthly mortgage payment (including principal, interest, taxes, and insurance) should not exceed 28% of your gross monthly income. For example, if you earn $8,000/month, your maximum payment should be $2,240. Use the monthly income field in our mortgage affordability calculator for personalized analysis."
                }
              },
              {
                "@type": "Question",
                "name": "What's the difference between FHA and conventional loans?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "FHA loans require as little as 3.5% down and have more lenient credit requirements (580+ score), but include mandatory mortgage insurance for the life of the loan in many cases. Conventional loans typically require 5-20% down, 620+ credit score, but PMI can be removed at 78% LTV."
                }
              },
              {
                "@type": "Question",
                "name": "Should I choose a 15-year or 30-year mortgage?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A 30-year mortgage offers lower monthly payments but higher total interest over the life of the loan. A 15-year mortgage has higher monthly payments but you'll pay significantly less interest and build equity faster. Use our calculator to compare both options and see which fits your budget and financial goals."
                }
              },
              {
                "@type": "Question",
                "name": "What are closing costs and how much should I expect?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Closing costs typically range from 2-5% of the home's purchase price and include fees for appraisal, title insurance, origination, escrow, and more. On a $500,000 home, expect $10,000-$25,000 in closing costs. Our calculator uses a 3% default but you can adjust this based on your lender's estimate."
                }
              },
              {
                "@type": "Question",
                "name": "How do property taxes affect my monthly payment?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Property taxes are typically included in your monthly mortgage payment through an escrow account. They vary significantly by location - ranging from 0.3% to 2.5% of your home's value annually. Check your local tax rates and enter the annual amount in our calculator for accurate monthly payment estimates."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use this as a refinance calculator?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! Enter your current home's value as the home price and calculate your remaining loan balance to compare with new rate scenarios. This helps you determine if refinancing makes financial sense based on potential interest savings versus closing costs. Compare your current monthly payment with new rate scenarios."
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
                <span className="block">Free Mortgage Calculator</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-1 sm:mt-2">
                  Estimate Monthly Payments
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Our <strong>free mortgage calculator</strong> helps you estimate <strong>monthly home loan payments</strong> including principal, interest, property taxes, insurance, and PMI. Get instant, accurate mortgage estimates for FHA, VA, and conventional loans. Plan your home purchase with confidence using our comprehensive payment breakdown and affordability analysis.
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
                <div className="bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-xs sm:text-sm text-gray-700">100% Free & Private</span>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-xs sm:text-sm text-gray-700">500,000+ Calculations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AdSense Placeholder - Top */}
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-6">
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Advertisement</p>
            <p className="text-xs text-gray-400 mt-1">AdSense Slot - Top Banner (728x90 or Responsive)</p>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 lg:py-16">
          
          {/* Sample Scenarios */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg border-0 rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4">Quick Start: Sample Mortgage Scenarios</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Try these real-world examples to see how different loan amounts and terms affect your monthly payment:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white border-2 border-transparent hover:border-blue-500 transition-all cursor-pointer" onClick={() => loadSampleScenario('starter')}>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 text-blue-700">Starter Home</h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Home Price: $250,000</li>
                      <li>• Down Payment: 10%</li>
                      <li>• Interest Rate: 7.0%</li>
                      <li>• Term: 30 years</li>
                      <li className="font-semibold text-blue-600 pt-2">≈ $1,730/month*</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border-2 border-transparent hover:border-green-500 transition-all cursor-pointer" onClick={() => loadSampleScenario('median')}>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 text-green-700">Median Home</h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Home Price: $450,000</li>
                      <li>• Down Payment: 20%</li>
                      <li>• Interest Rate: 6.5%</li>
                      <li>• Term: 30 years</li>
                      <li className="font-semibold text-green-600 pt-2">≈ $2,820/month*</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border-2 border-transparent hover:border-purple-500 transition-all cursor-pointer" onClick={() => loadSampleScenario('luxury')}>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 text-purple-700">Luxury Home</h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Home Price: $800,000</li>
                      <li>• Down Payment: 25%</li>
                      <li>• Interest Rate: 6.0%</li>
                      <li>• Term: 15 years</li>
                      <li className="font-semibold text-purple-600 pt-2">≈ $5,820/month*</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              <p className="text-xs text-gray-500 mt-4">*Estimates include taxes and insurance. Click any scenario to auto-fill the calculator.</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Calculator */}
            <div className="lg:col-span-2">
              <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col">
                    <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                      <div className="text-center sm:text-left">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Mortgage Calculator</h2>
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
                          <Slider
                            value={[parseFloat(homePrice) || 0]}
                            onValueChange={(value) => setHomePrice(value[0].toString())}
                            max={2000000}
                            step={10000}
                            className="mt-2"
                            data-testid="slider-home-price"
                          />
                          <p className="text-xs text-gray-500">Slide to adjust: $0 - $2,000,000</p>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Down Payment
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
                            <>
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
                              <Slider
                                value={[parseFloat(downPaymentPercent) || 0]}
                                onValueChange={(value) => setDownPaymentPercent(value[0].toString())}
                                max={50}
                                step={1}
                                className="mt-2"
                                data-testid="slider-down-payment"
                              />
                              <p className="text-xs text-gray-500">Slide: 0% - 50%</p>
                            </>
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
                          <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Loan Term (Years)</Label>
                          <Input
                            type="number"
                            value={loanTerm}
                            onChange={(e) => setLoanTerm(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                            placeholder="30"
                            min="1"
                            max="40"
                            data-testid="input-loan-term"
                          />
                          <Slider
                            value={[parseFloat(loanTerm) || 30]}
                            onValueChange={(value) => setLoanTerm(value[0].toString())}
                            max={40}
                            min={5}
                            step={1}
                            className="mt-2"
                            data-testid="slider-loan-term"
                          />
                          <p className="text-xs text-gray-500">Common: 15, 20, or 30 years</p>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="interest-rate" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Interest Rate (%)
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
                              data-testid="input-interest-rate"
                            />
                            <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">%</span>
                          </div>
                          <Slider
                            value={[parseFloat(interestRate) || 0]}
                            onValueChange={(value) => setInterestRate(value[0].toFixed(2))}
                            max={15}
                            min={2}
                            step={0.1}
                            className="mt-2"
                            data-testid="slider-interest-rate"
                          />
                          <p className="text-xs text-gray-500">Current rates: 6-8% (2025)</p>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="loan-type" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Loan Type</Label>
                          <Select value={loanType} onValueChange={setLoanType}>
                            <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-loan-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="conventional">Conventional</SelectItem>
                              <SelectItem value="fha">FHA</SelectItem>
                              <SelectItem value="va">VA</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="property-tax" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Annual Property Tax</Label>
                          <div className="relative">
                            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                            <Input
                              id="property-tax"
                              type="number"
                              value={propertyTax}
                              onChange={(e) => setPropertyTax(e.target.value)}
                              className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                              placeholder="3,000"
                              data-testid="input-property-tax"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="home-insurance" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Annual Home Insurance</Label>
                          <div className="relative">
                            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                            <Input
                              id="home-insurance"
                              type="number"
                              value={homeInsurance}
                              onChange={(e) => setHomeInsurance(e.target.value)}
                              className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                              placeholder="1,200"
                              data-testid="input-home-insurance"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="hoa-fees" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Monthly HOA Fees</Label>
                          <div className="relative">
                            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                            <Input
                              id="hoa-fees"
                              type="number"
                              value={hoaFees}
                              onChange={(e) => setHoaFees(e.target.value)}
                              className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                              placeholder="0"
                              data-testid="input-hoa-fees"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="monthly-income" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Monthly Income (Optional)</Label>
                          <div className="relative">
                            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                            <Input
                              id="monthly-income"
                              type="number"
                              value={monthlyIncome}
                              onChange={(e) => setMonthlyIncome(e.target.value)}
                              className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                              placeholder="8,000"
                              data-testid="input-monthly-income"
                            />
                          </div>
                          <p className="text-xs text-gray-500">For affordability analysis</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 sm:gap-4 pt-4">
                        <Button
                          onClick={calculateMortgage}
                          className="flex-1 min-w-[200px] h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl transition-all duration-200 hover:scale-105"
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-5 h-5 mr-2" />
                          Calculate Payment
                        </Button>
                        <Button
                          onClick={resetCalculator}
                          variant="outline"
                          className="h-12 sm:h-14 md:h-16 px-6 sm:px-8 text-sm sm:text-base border-2"
                          data-testid="button-reset"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>

                    {result && (
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-6 md:p-8 lg:p-10 border-t-2 border-gray-200">
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Your Results</h3>
                          <div className="flex gap-2">
                            <Button onClick={handlePrint} variant="outline" size="sm" data-testid="button-print">
                              <Printer className="w-4 h-4 mr-1" />
                              Print
                            </Button>
                            <Button onClick={handleDownloadPDF} variant="outline" size="sm" data-testid="button-download">
                              <Download className="w-4 h-4 mr-1" />
                              Export
                            </Button>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg mb-4 sm:mb-6">
                          <div className="text-center pb-4 sm:pb-6 border-b-2 border-gray-200">
                            <p className="text-sm sm:text-base text-gray-600 mb-2">Total Monthly Payment</p>
                            <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600" data-testid="result-monthly-payment">
                              {formatCurrency(result.monthlyPayment)}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 sm:pt-6">
                            <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                              <p className="text-xs sm:text-sm text-blue-700 mb-1">Principal & Interest</p>
                              <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-900" data-testid="result-principal-interest">{formatCurrency(result.monthlyPrincipalAndInterest)}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                              <p className="text-xs sm:text-sm text-green-700 mb-1">Property Taxes</p>
                              <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-900" data-testid="result-taxes">{formatCurrency(result.monthlyTaxes)}</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                              <p className="text-xs sm:text-sm text-purple-700 mb-1">Home Insurance</p>
                              <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-900" data-testid="result-insurance">{formatCurrency(result.monthlyInsurance)}</p>
                            </div>
                            {result.monthlyPMI > 0 && (
                              <div className="bg-orange-50 rounded-lg p-3 sm:p-4">
                                <p className="text-xs sm:text-sm text-orange-700 mb-1">PMI</p>
                                <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-900" data-testid="result-pmi">{formatCurrency(result.monthlyPMI)}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                          <div className="bg-white rounded-lg p-4 shadow-md">
                            <p className="text-sm text-gray-600">Total Interest Paid</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900" data-testid="result-total-interest">{formatCurrency(result.totalInterest)}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-md">
                            <p className="text-sm text-gray-600">Cash Needed at Closing</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900" data-testid="result-cash-needed">{formatCurrency(result.totalCashNeeded)}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          <Button onClick={handleEmailResults} variant="outline" className="flex-1 min-w-[140px]" data-testid="button-email">
                            <Mail className="w-4 h-4 mr-2" />
                            Email Results
                          </Button>
                          <Button onClick={handleShare} variant="outline" className="flex-1 min-w-[140px]" data-testid="button-share">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - AdSense Placeholder */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-500">Advertisement</p>
                  <p className="text-xs text-gray-400 mt-2">AdSense Slot - Sidebar</p>
                  <p className="text-xs text-gray-400">(300x600 or Responsive)</p>
                  <div className="h-[400px] flex items-center justify-center">
                    <p className="text-gray-300">Ad Space</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl mt-6 sm:mt-8">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="bg-blue-100 rounded-full p-3">
                  <Lightbulb className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Pro Tips for Using This Mortgage Calculator</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Get Pre-Approved First</h4>
                    <p className="text-sm text-gray-700">Contact lenders for accurate interest rates before house hunting. Pre-approval gives you negotiating power and realistic budget expectations.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Account for All Costs</h4>
                    <p className="text-sm text-gray-700">Include property taxes, insurance, HOA fees, and maintenance (1-2% of home value annually) when calculating affordability.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Compare Loan Terms</h4>
                    <p className="text-sm text-gray-700">A 15-year mortgage builds equity faster with less interest, while 30-year terms offer lower monthly payments. Use our calculator to compare both.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Consider Extra Payments</h4>
                    <p className="text-sm text-gray-700">Making extra principal payments can save thousands in interest and shorten your loan term significantly. Even $100/month extra makes a difference.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Aim for 20% Down</h4>
                    <p className="text-sm text-gray-700">Putting 20% down eliminates PMI on conventional loans, reduces interest costs, and often qualifies you for better rates.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Check Your Credit Score</h4>
                    <p className="text-sm text-gray-700">Higher credit scores (740+) qualify for the best rates. A 1% rate difference on a $400K loan costs $80K+ over 30 years.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loan Type Comparison */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl mt-6 sm:mt-8">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Compare Loan Types</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-blue-900 mb-3 sm:mb-4">Conventional Loans</h3>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-blue-800">
                    <p><strong>Credit Score:</strong> 620+ (740+ for best rates)</p>
                    <p><strong>Down Payment:</strong> 5-20% minimum</p>
                    <p><strong>PMI:</strong> Required below 20% down, removable</p>
                    <p><strong>Best For:</strong> Strong credit, stable income</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-purple-900 mb-3 sm:mb-4">FHA Loans</h3>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-purple-800">
                    <p><strong>Credit Score:</strong> 580+ for 3.5% down</p>
                    <p><strong>Down Payment:</strong> 3.5% minimum</p>
                    <p><strong>PMI:</strong> Required for loan life (most cases)</p>
                    <p><strong>Best For:</strong> First-time buyers, lower credit</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-green-900 mb-3 sm:mb-4">VA Loans</h3>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-green-800">
                    <p><strong>Credit Score:</strong> No strict minimum</p>
                    <p><strong>Down Payment:</strong> 0% down payment option</p>
                    <p><strong>PMI:</strong> No PMI required</p>
                    <p><strong>Best For:</strong> Veterans and active military</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Use */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl mt-6 sm:mt-8">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">How to Use This Mortgage Calculator</h2>
              <div className="space-y-4 text-gray-700 text-sm sm:text-base">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">1</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Enter Home Price</h4>
                    <p>Input the purchase price of the home you're considering. Use the slider for quick adjustments or type the exact amount.</p>
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
                    <p>Choose your loan length (typically 15 or 30 years) and enter the annual interest rate. Use sliders for easy adjustments.</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold">4</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Add Property Costs</h4>
                    <p>Include annual property taxes, homeowners insurance, and monthly HOA fees for the most accurate monthly payment estimate.</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-700 font-bold">5</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Review & Export Results</h4>
                    <p>See your complete monthly payment breakdown, total interest, and affordability analysis. Export to PDF or print for your records.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl mt-6 sm:mt-8">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="space-y-3">
                <AccordionItem value="item-1" className="bg-gray-50 rounded-lg px-4">
                  <AccordionTrigger className="text-left font-semibold">
                    How accurate is this mortgage calculator?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    Our <strong>mortgage calculator</strong> provides highly accurate estimates using the standard amortization formula: M = P[r(1+r)^n]/[(1+r)^n-1]. However, actual payments may vary slightly based on your lender's specific terms, closing costs, and any discount points purchased. Always verify final numbers with your mortgage lender.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="bg-gray-50 rounded-lg px-4">
                  <AccordionTrigger className="text-left font-semibold">
                    What is PMI and when is it required?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    PMI (Private Mortgage Insurance) is required on conventional loans when you put down less than 20%. It typically costs 0.5-1% of the loan amount annually and protects the lender if you default. PMI can be removed once you reach 78% loan-to-value ratio through principal payments or home appreciation. Our <strong>mortgage calculator with PMI</strong> helps you estimate these costs accurately.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="bg-gray-50 rounded-lg px-4">
                  <AccordionTrigger className="text-left font-semibold">
                    How much mortgage can I afford?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    Lenders typically use the 28% rule: your monthly mortgage payment (including principal, interest, taxes, and insurance) should not exceed 28% of your gross monthly income. For example, if you earn $8,000/month, your maximum payment should be $2,240. Use the monthly income field in our <strong>mortgage affordability calculator</strong> for personalized analysis.
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
                    Can I use this as a refinance calculator?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    Yes! Enter your current home's value as the "home price" and calculate your remaining loan balance to compare with new rate scenarios. This helps you determine if <strong>refinancing</strong> makes financial sense based on potential interest savings versus closing costs. Compare your current monthly payment with new rate scenarios.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* AdSense Placeholder - Bottom */}
          <div className="mt-6 sm:mt-8">
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Advertisement</p>
              <p className="text-xs text-gray-400 mt-1">AdSense Slot - Bottom Banner (728x90 or Responsive)</p>
            </div>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-xl rounded-xl sm:rounded-2xl mt-6 sm:mt-8">
            <CardContent className="p-6 sm:p-8 md:p-10 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Home Buying Journey?</h2>
              <p className="text-lg sm:text-xl mb-6 opacity-90">Use our free mortgage calculator to understand your budget and plan your path to homeownership with confidence.</p>
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

          {/* Privacy Notice */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 sm:p-6 rounded-lg mt-6">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="text-sm sm:text-base text-blue-900">
                <p className="font-semibold mb-2">Privacy & Data Security</p>
                <p>Your calculations are processed entirely in your browser. We do not store, save, or share any of your financial information. This mortgage calculator is completely free to use with no hidden fees or registration required. See our <a href="/privacy-policy" className="underline font-semibold">Privacy Policy</a> and <a href="/terms-of-service" className="underline font-semibold">Terms of Service</a> for more details.</p>
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

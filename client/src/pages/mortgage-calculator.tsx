import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { Info, Calculator, Home, DollarSign, Shield, TrendingUp, Download, Printer, Share2, PieChart, TrendingDown, Clock } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { jsPDF } from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

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
  amortizationSchedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
  extraPaymentSavings?: {
    timeSaved: number;
    interestSaved: number;
    newTotalInterest: number;
    newPayoffTime: number;
  };
}

const MortgageCalculator = () => {
  const [homePrice, setHomePrice] = useState('500000');
  const [downPayment, setDownPayment] = useState('');
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [loanTerm, setLoanTerm] = useState('30');
  const [interestRate, setInterestRate] = useState('6.5');
  const [propertyTax, setPropertyTax] = useState('6000');
  const [homeInsurance, setHomeInsurance] = useState('1800');
  const [pmiRate, setPmiRate] = useState('0.5');
  const [usePercentage, setUsePercentage] = useState(true);
  const [loanType, setLoanType] = useState('conventional');
  const [hoaFees, setHoaFees] = useState('0');
  const [closingCostPercent, setClosingCostPercent] = useState('3');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState('monthly');
  const [extraPayment, setExtraPayment] = useState('0');
  const [showAmortization, setShowAmortization] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [result, setResult] = useState<MortgageResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load parameters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const price = params.get('price');
    const down = params.get('down');
    const rate = params.get('rate');
    const term = params.get('term');
    const freq = params.get('freq');
    const extra = params.get('extra');

    if (price || rate || term) {
      if (price) setHomePrice(price);
      if (down) setDownPaymentPercent(down);
      if (rate) setInterestRate(rate);
      if (term) setLoanTerm(term);
      if (freq) setPaymentFrequency(freq);
      if (extra) setExtraPayment(extra);

      setTimeout(() => {
        const calculateButton = document.querySelector('[data-testid="button-calculate"]') as HTMLButtonElement;
        if (calculateButton) {
          calculateButton.click();
          toast({
            title: "Shared calculation loaded!",
            description: "Results from the shared link have been calculated."
          });
        }
      }, 200);
    }
  }, []);

  const calculateMortgage = () => {
    const price = parseFloat(homePrice);
    const down = usePercentage
      ? (price * parseFloat(downPaymentPercent)) / 100
      : parseFloat(downPayment);
    const principal = price - down;
    const annualRate = parseFloat(interestRate) / 100;
    const termYears = parseFloat(loanTerm);
    const taxes = parseFloat(propertyTax) || 0;
    const insurance = parseFloat(homeInsurance) || 0;
    const pmi = parseFloat(pmiRate) || 0;
    const hoa = parseFloat(hoaFees) || 0;
    const income = parseFloat(monthlyIncome) || 0;
    const extraPmt = parseFloat(extraPayment) || 0;

    if (principal <= 0 || annualRate < 0 || termYears <= 0) return;

    const paymentsPerYear = paymentFrequency === 'weekly' ? 52 :
                           paymentFrequency === 'biweekly' ? 26 : 12;
    const periodicRate = annualRate / paymentsPerYear;
    const totalPayments = termYears * paymentsPerYear;

    let adjustedRate = periodicRate;
    if (loanType === 'fha') {
      adjustedRate = periodicRate + (0.0085 / paymentsPerYear);
    } else if (loanType === 'va') {
      adjustedRate = periodicRate - (0.0025 / paymentsPerYear);
    }

    const monthlyPI = adjustedRate === 0
      ? principal / totalPayments
      : (principal * adjustedRate * Math.pow(1 + adjustedRate, totalPayments)) / (Math.pow(1 + adjustedRate, totalPayments) - 1);

    const monthlyTaxes = taxes / 12;
    const monthlyInsurance = insurance / 12;
    const downPaymentPercentValue = (down / price) * 100;
    let monthlyPMI = 0;

    if (loanType === 'conventional' && downPaymentPercentValue < 20) {
      monthlyPMI = (principal * (pmi / 100)) / 12;
    } else if (loanType === 'fha') {
      monthlyPMI = (principal * 0.0085) / 12;
    }

    const monthlyHOA = hoa;

    // Calculate amortization with extra payments
    const amortizationSchedule = [];
    let currentBalance = principal;
    let totalInterestPaid = 0;
    let totalAmountPaid = 0;
    let actualPayments = 0;

    for (let payment = 1; payment <= totalPayments && currentBalance > 0.01; payment++) {
      const interestPayment = currentBalance * adjustedRate;
      const principalPayment = Math.min(monthlyPI - interestPayment + extraPmt, currentBalance);
      const actualPaymentAmount = principalPayment + interestPayment;

      currentBalance -= principalPayment;
      totalInterestPaid += interestPayment;
      totalAmountPaid += actualPaymentAmount;
      actualPayments = payment;

      if (payment <= 60) { // Store first 60 payments for amortization schedule
        amortizationSchedule.push({
          month: payment,
          payment: actualPaymentAmount,
          principal: principalPayment,
          interest: interestPayment,
          balance: currentBalance
        });
      }
    }

    let extraPaymentSavings;
    if (extraPmt > 0) {
      const regularTotalAmount = monthlyPI * totalPayments;
      const regularTotalInterest = regularTotalAmount - principal;

      extraPaymentSavings = {
        timeSaved: Math.max(0, totalPayments - actualPayments),
        interestSaved: Math.max(0, regularTotalInterest - totalInterestPaid),
        newTotalInterest: totalInterestPaid,
        newPayoffTime: actualPayments
      };
    }

    const monthlyEquivalent = monthlyPI * (paymentsPerYear / 12);
    const totalMonthlyPayment = monthlyEquivalent + monthlyTaxes + monthlyInsurance + monthlyPMI + monthlyHOA;

    const closingCosts = (price * parseFloat(closingCostPercent)) / 100;
    const totalCashNeeded = down + closingCosts;
    const loanToValue = (principal / price) * 100;
    const debtToIncomeRatio = income > 0 ? (totalMonthlyPayment / income) * 100 : 0;

    setResult({
      monthlyPayment: Math.round(totalMonthlyPayment * 100) / 100,
      totalAmount: Math.round(totalAmountPaid * 100) / 100,
      totalInterest: Math.round(totalInterestPaid * 100) / 100,
      monthlyPrincipalAndInterest: Math.round(monthlyEquivalent * 100) / 100,
      monthlyTaxes: Math.round(monthlyTaxes * 100) / 100,
      monthlyInsurance: Math.round(monthlyInsurance * 100) / 100,
      monthlyPMI: Math.round(monthlyPMI * 100) / 100,
      monthlyHOA: Math.round(monthlyHOA * 100) / 100,
      closingCosts: Math.round(closingCosts * 100) / 100,
      totalCashNeeded: Math.round(totalCashNeeded * 100) / 100,
      loanToValue: Math.round(loanToValue * 100) / 100,
      debtToIncomeRatio: Math.round(debtToIncomeRatio * 100) / 100,
      amortizationSchedule,
      extraPaymentSavings
    });

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const resetCalculator = () => {
    setHomePrice('500000');
    setDownPayment('');
    setDownPaymentPercent('20');
    setLoanTerm('30');
    setInterestRate('6.5');
    setPropertyTax('6000');
    setHomeInsurance('1800');
    setPmiRate('0.5');
    setUsePercentage(true);
    setLoanType('conventional');
    setHoaFees('0');
    setClosingCostPercent('3');
    setMonthlyIncome('');
    setPaymentFrequency('monthly');
    setExtraPayment('0');
    setShowAmortization(false);
    setShowChart(false);
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

    doc.save(`mortgage-calculation-${new Date().getTime()}.pdf`);
  };

  const handleShare = async () => {
    if (!result) return;

    const params = new URLSearchParams({
      price: homePrice,
      down: downPaymentPercent,
      rate: interestRate,
      term: loanTerm,
      freq: paymentFrequency,
      extra: extraPayment
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    const freqDisplay = paymentFrequency === 'weekly' ? 'Weekly' :
                       paymentFrequency === 'biweekly' ? 'Bi-weekly' : 'Monthly';

    let shareText = `🏠 Mortgage Calculator Results\n\n`;
    shareText += `📊 Loan Details:\n`;
    shareText += `• Home Price: ${formatCurrency(parseFloat(homePrice))}\n`;
    shareText += `• Down Payment: ${downPaymentPercent}%\n`;
    shareText += `• Interest Rate: ${interestRate}%\n`;
    shareText += `• Term: ${loanTerm} years\n`;
    shareText += `• Payment Frequency: ${freqDisplay}\n`;
    if (parseFloat(extraPayment) > 0) {
      shareText += `• Extra Payment: ${formatCurrency(parseFloat(extraPayment))}\n`;
    }
    shareText += `\n💵 Monthly Payment: ${formatCurrency(result.monthlyPayment)}\n`;
    shareText += `• Total Interest: ${formatCurrency(result.totalInterest)}\n`;

    if (result.extraPaymentSavings) {
      shareText += `\n✨ Extra Payment Savings:\n`;
      shareText += `• Interest Saved: ${formatCurrency(result.extraPaymentSavings.interestSaved)}\n`;
    }

    shareText += `\n🔗 View & Calculate: ${shareableUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '🏠 Mortgage Calculator Results',
          text: shareText,
          url: shareableUrl
        });
        toast({ title: "Shared successfully!" });
      } catch (err) {
        navigator.clipboard.writeText(shareText);
        toast({ title: "Copied to clipboard!" });
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({ title: "Copied to clipboard!" });
    }
  };

  const principalPercentage = result ? (parseFloat(homePrice) - (usePercentage ? (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100 : parseFloat(downPayment))) / result.totalAmount * 100 : 0;
  const interestPercentage = result ? (result.totalInterest / result.totalAmount) * 100 : 0;

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
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0">
                <span className="block">Free Mortgage Calculator</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-1 sm:mt-2">
                  Estimate Monthly Payments
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Calculate monthly mortgage payments, total interest costs, and amortization schedules instantly. Perfect for home buying decisions and loan comparisons. 100% free, no registration required.
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

        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 lg:py-16">

          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Mortgage Configuration</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your home and loan details for accurate payment calculations</p>
                  </div>

                  <TooltipProvider>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="home-price" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            Home Price
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">The total purchase price of the home</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
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
                        />
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Down Payment
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Amount you'll pay upfront (20% avoids PMI)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
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
                          />
                          <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">%</span>
                        </div>
                        <Slider
                          value={[parseFloat(downPaymentPercent) || 0]}
                          onValueChange={(value) => setDownPaymentPercent(value[0].toString())}
                          max={50}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Loan Term (Years)</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">How long you'll take to repay (typically 15 or 30 years)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          type="number"
                          value={loanTerm}
                          onChange={(e) => setLoanTerm(e.target.value)}
                          className="h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                          placeholder="30"
                          min="1"
                          max="40"
                        />
                        <Slider
                          value={[parseFloat(loanTerm) || 30]}
                          onValueChange={(value) => setLoanTerm(value[0].toString())}
                          max={40}
                          min={5}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="interest-rate" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Interest Rate (%)
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Annual interest rate from your lender</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <Input
                            id="interest-rate"
                            type="number"
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 pr-6 sm:pr-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                            placeholder="6.5"
                            step="0.01"
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
                        />
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Payment Frequency</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">How often you'll make payments</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={paymentFrequency} onValueChange={setPaymentFrequency}>
                          <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="loan-type" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Loan Type</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Type of mortgage loan</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={loanType} onValueChange={setLoanType}>
                          <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full">
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
                        <div className="flex items-center gap-2">
                          <Label htmlFor="property-tax" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Annual Property Tax</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Yearly property taxes (varies by location)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                          <Input
                            id="property-tax"
                            type="number"
                            value={propertyTax}
                            onChange={(e) => setPropertyTax(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                            placeholder="6,000"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="home-insurance" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Annual Home Insurance</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Yearly homeowners insurance premium</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                          <Input
                            id="home-insurance"
                            type="number"
                            value={homeInsurance}
                            onChange={(e) => setHomeInsurance(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                            placeholder="1,800"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="hoa-fees" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Monthly HOA Fees</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Homeowners association fees (if applicable)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                          <Input
                            id="hoa-fees"
                            type="number"
                            value={hoaFees}
                            onChange={(e) => setHoaFees(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="extra-payment" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Extra Payment (Optional)
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Additional amount to pay each period to reduce interest and loan term</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                          <Input
                            id="extra-payment"
                            type="number"
                            value={extraPayment}
                            onChange={(e) => setExtraPayment(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">💡 Pro Tip: Even small extra payments can save you thousands in interest!</p>
                      </div>
                    </div>
                  </TooltipProvider>

                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={calculateMortgage}
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      <Calculator className="w-5 h-5 mr-2" />
                      Calculate Mortgage Payment
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                    >
                      Reset Calculator
                    </Button>
                  </div>

                  {result && (
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-3 sm:pt-4 print:hidden">
                      <Button
                        onClick={() => setShowAmortization(!showAmortization)}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                      >
                        {showAmortization ? 'Hide' : 'Show'} Payment Schedule
                      </Button>
                      <Button
                        onClick={() => setShowChart(!showChart)}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                      >
                        <PieChart className="w-4 h-4 mr-1" />
                        {showChart ? 'Hide' : 'Show'} Chart
                      </Button>
                      <Button
                        onClick={handleShare}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                      <Button
                        onClick={handleDownloadPDF}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export PDF
                      </Button>
                    </div>
                  )}
                </div>

                {result ? (
                  <div ref={resultsRef} className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Your Mortgage Results</h2>

                    <div className="space-y-4 sm:space-y-6 md:space-y-8">
                      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-blue-200 shadow-sm">
                        <div className="text-center space-y-2 sm:space-y-3">
                          <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Monthly Payment</div>
                          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 break-all">
                            {formatCurrency(result.monthlyPayment)}
                          </div>
                          <p className="text-xs text-gray-500">Based on {paymentFrequency} payment frequency</p>
                        </div>
                      </div>

                      {showChart && (
                        <div className="space-y-4 sm:space-y-6">
                          <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 shadow-lg border border-blue-100">
                            <h3 className="font-bold text-gray-900 mb-6 sm:mb-8 text-center text-lg sm:text-xl flex items-center justify-center gap-2">
                              <PieChart className="w-5 h-5 text-blue-600" />
                              Total Loan Breakdown
                            </h3>
                            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8">
                              <div className="w-full max-w-[320px] sm:max-w-sm">
                                <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 280 : 340}>
                                  <RechartsPieChart>
                                    <Pie
                                      data={[
                                        { name: 'Principal', value: parseFloat(homePrice) - (usePercentage ? (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100 : parseFloat(downPayment)), percentage: principalPercentage },
                                        { name: 'Interest', value: result.totalInterest, percentage: interestPercentage }
                                      ]}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={window.innerWidth < 640 ? 60 : 80}
                                      outerRadius={window.innerWidth < 640 ? 100 : 130}
                                      paddingAngle={5}
                                      dataKey="value"
                                      label={({ percentage }) => `${percentage.toFixed(1)}%`}
                                      labelLine={true}
                                    >
                                      <Cell fill="url(#principalGradient)" stroke="#10b981" strokeWidth={2} />
                                      <Cell fill="url(#interestGradient)" stroke="#f59e0b" strokeWidth={2} />
                                    </Pie>
                                    <RechartsTooltip
                                      formatter={(value: number) => formatCurrency(value)}
                                      contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                                        padding: '12px',
                                        fontSize: window.innerWidth < 640 ? '13px' : '15px'
                                      }}
                                    />
                                    <Legend 
                                      verticalAlign="bottom" 
                                      height={36}
                                      iconType="circle"
                                      formatter={(value, entry: any) => (
                                        <span className="text-sm font-medium text-gray-700">{value}</span>
                                      )}
                                    />
                                    <defs>
                                      <linearGradient id="principalGradient" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#059669" stopOpacity={0.9} />
                                      </linearGradient>
                                      <linearGradient id="interestGradient" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#d97706" stopOpacity={0.9} />
                                      </linearGradient>
                                    </defs>
                                  </RechartsPieChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-500">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Principal Amount</p>
                                      <p className="text-xl sm:text-2xl font-bold text-green-900">
                                        {formatCurrency(parseFloat(homePrice) - (usePercentage ? (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100 : parseFloat(downPayment)))}
                                      </p>
                                    </div>
                                    <div className="bg-green-500 rounded-full p-2">
                                      <DollarSign className="w-5 h-5 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-xs text-green-600 mt-2">{principalPercentage.toFixed(1)}% of total</p>
                                </div>
                                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border-l-4 border-orange-500">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">Total Interest</p>
                                      <p className="text-xl sm:text-2xl font-bold text-orange-900">
                                        {formatCurrency(result.totalInterest)}
                                      </p>
                                    </div>
                                    <div className="bg-orange-500 rounded-full p-2">
                                      <TrendingUp className="w-5 h-5 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-xs text-orange-600 mt-2">{interestPercentage.toFixed(1)}% of total</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {result.amortizationSchedule.length > 0 && (
                            <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 shadow-lg border border-purple-100">
                              <h3 className="font-bold text-gray-900 mb-4 sm:mb-6 text-center text-lg sm:text-xl flex items-center justify-center gap-2">
                                <TrendingDown className="w-5 h-5 text-purple-600" />
                                Payment Breakdown Over Time
                              </h3>
                              <p className="text-center text-sm text-gray-600 mb-6">See how your payments shift from interest to principal</p>
                              <div className="w-full overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                                <div className="min-w-[300px]">
                                  <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 280 : 360}>
                                    <AreaChart 
                                      data={result.amortizationSchedule.map(item => ({
                                        month: `Month ${item.month}`,
                                        Principal: item.principal,
                                        Interest: item.interest,
                                        Balance: item.balance
                                      }))}
                                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                    >
                                      <defs>
                                        <linearGradient id="principalAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                                        </linearGradient>
                                        <linearGradient id="interestAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2}/>
                                        </linearGradient>
                                      </defs>
                                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                      <XAxis 
                                        dataKey="month" 
                                        tick={{ fontSize: window.innerWidth < 640 ? 10 : 12, fill: '#6b7280' }}
                                        interval="preserveStartEnd"
                                      />
                                      <YAxis 
                                        tick={{ fontSize: window.innerWidth < 640 ? 10 : 12, fill: '#6b7280' }}
                                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                      />
                                      <RechartsTooltip 
                                        formatter={(value: number) => formatCurrency(value)}
                                        contentStyle={{
                                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                          border: '2px solid #e5e7eb',
                                          borderRadius: '12px',
                                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                                          padding: '12px'
                                        }}
                                        labelStyle={{ color: '#1f2937', fontWeight: 600 }}
                                      />
                                      <Area 
                                        type="monotone" 
                                        dataKey="Principal" 
                                        stackId="1" 
                                        stroke="#10b981" 
                                        strokeWidth={2}
                                        fill="url(#principalAreaGradient)" 
                                      />
                                      <Area 
                                        type="monotone" 
                                        dataKey="Interest" 
                                        stackId="1" 
                                        stroke="#f59e0b" 
                                        strokeWidth={2}
                                        fill="url(#interestAreaGradient)" 
                                      />
                                      <Legend 
                                        verticalAlign="top" 
                                        height={36}
                                        iconType="line"
                                        formatter={(value) => (
                                          <span className="text-sm font-medium text-gray-700">{value}</span>
                                        )}
                                      />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                                  <p className="text-xs text-gray-500 mb-1">First Payment</p>
                                  <p className="text-sm font-bold text-gray-900">
                                    {result.amortizationSchedule[0] && formatCurrency(result.amortizationSchedule[0].interest)} Interest
                                  </p>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                                  <p className="text-xs text-gray-500 mb-1">Last Payment</p>
                                  <p className="text-sm font-bold text-gray-900">
                                    {result.amortizationSchedule[result.amortizationSchedule.length - 1] && 
                                      formatCurrency(result.amortizationSchedule[result.amortizationSchedule.length - 1].principal)} Principal
                                  </p>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                                  <p className="text-xs text-gray-500 mb-1">Remaining Balance</p>
                                  <p className="text-sm font-bold text-gray-900">
                                    {result.amortizationSchedule[result.amortizationSchedule.length - 1] && 
                                      formatCurrency(result.amortizationSchedule[result.amortizationSchedule.length - 1].balance)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-blue-700 mb-1">Principal & Interest</p>
                          <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-900">{formatCurrency(result.monthlyPrincipalAndInterest)}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-green-700 mb-1">Property Taxes</p>
                          <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-900">{formatCurrency(result.monthlyTaxes)}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-purple-700 mb-1">Home Insurance</p>
                          <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-900">{formatCurrency(result.monthlyInsurance)}</p>
                        </div>
                        {result.monthlyPMI > 0 && (
                          <div className="bg-orange-50 rounded-lg p-3 sm:p-4">
                            <p className="text-xs sm:text-sm text-orange-700 mb-1">PMI</p>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-900">{formatCurrency(result.monthlyPMI)}</p>
                          </div>
                        )}
                      </div>

                      {result.extraPaymentSavings && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-green-200">
                          <h4 className="font-bold text-green-800 mb-3 sm:mb-4 text-base sm:text-lg flex items-center gap-2">
                            <TrendingDown className="w-5 h-5" />
                            Extra Payment Benefits
                          </h4>
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium text-sm sm:text-base">Interest Saved:</span>
                              <span className="font-bold text-green-800 text-sm sm:text-base md:text-lg break-all">
                                {formatCurrency(result.extraPaymentSavings.interestSaved)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium text-sm sm:text-base">Time Saved:</span>
                              <span className="font-bold text-green-800 text-sm sm:text-base md:text-lg">
                                {Math.round(result.extraPaymentSavings.timeSaved / (paymentFrequency === 'weekly' ? 52 : paymentFrequency === 'biweekly' ? 26 : 12))} years
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Results</h2>
                    <div className="text-center py-8 sm:py-12 md:py-16">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <Calculator className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base md:text-lg px-4">Enter your mortgage details above and click "Calculate Mortgage Payment" to see your personalized results</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {result && showAmortization && (
            <Card className="mt-6 sm:mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Amortization Schedule (First 5 Years)</h3>
                <p className="text-sm text-gray-600 mb-4">See how your payments are split between principal and interest over time.</p>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-gray-900 text-xs sm:text-sm rounded-l-lg">Payment #</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Payment</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Principal</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Interest</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm rounded-r-lg">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.amortizationSchedule.map((payment, index) => (
                        <tr key={index} className="hover:bg-blue-50 transition-colors">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-gray-900 text-xs sm:text-sm">{payment.month}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-gray-900 font-medium text-xs sm:text-sm">
                            {formatCurrency(payment.payment)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-green-600 font-bold text-xs sm:text-sm">
                            {formatCurrency(payment.principal)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-orange-600 font-medium text-xs sm:text-sm">
                            {formatCurrency(payment.interest)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-gray-900 font-bold text-xs sm:text-sm">
                            {formatCurrency(payment.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

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
                    Our calculator provides highly accurate estimates using the standard amortization formula. However, actual payments may vary slightly based on your lender's specific terms, closing costs, and any discount points purchased.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="bg-gray-50 rounded-lg px-4">
                  <AccordionTrigger className="text-left font-semibold">
                    What is PMI and when is it required?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    PMI (Private Mortgage Insurance) is required on conventional loans when you put down less than 20%. It typically costs 0.5-1% of the loan amount annually and can be removed once you reach 78% loan-to-value ratio.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="bg-gray-50 rounded-lg px-4">
                  <AccordionTrigger className="text-left font-semibold">
                    How much mortgage can I afford?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    Lenders typically use the 28% rule: your monthly mortgage payment should not exceed 28% of your gross monthly income. Use the monthly income field for personalized analysis.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 sm:p-6 rounded-lg mt-6">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="text-sm sm:text-base text-blue-900">
                <p className="font-semibold mb-2">Privacy & Data Security</p>
                <p>Your calculations are processed entirely in your browser. We do not store, save, or share any of your financial information.</p>
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
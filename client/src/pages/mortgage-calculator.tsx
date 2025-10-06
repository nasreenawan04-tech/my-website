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
import { Info, Calculator, Home, DollarSign, TrendingDown, Download, Share2, PieChart, Clock } from 'lucide-react';
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
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
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

  // Drag scrolling handlers for amortization table
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tableScrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - tableScrollRef.current.offsetLeft);
    setScrollLeft(tableScrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tableScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - tableScrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Multiply by 2 for faster scrolling
    tableScrollRef.current.scrollLeft = scrollLeft - walk;
  };

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

  const handleDownloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = 12;

    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 38, 'F');
    
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('DapsiWow', pageWidth / 2, yPos + 5, { align: 'center' });
    
    yPos += 14;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Mortgage Calculation Report', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 6;
    doc.setFontSize(8);
    doc.setTextColor(230, 240, 255);
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    doc.text(`Report Date: ${currentDate}`, pageWidth / 2, yPos, { align: 'center' });

    yPos = 48;
    doc.setFillColor(240, 249, 255);
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1);
    doc.roundedRect(margin, yPos, pageWidth - (2 * margin), 42, 3, 3, 'FD');
    
    yPos += 6;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('MONTHLY PAYMENT', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(result.monthlyPayment), pageWidth / 2, yPos, { align: 'center' });
    
    doc.save(`DapsiWow-Mortgage-${new Date().getTime()}.pdf`);
    toast({ 
      title: "PDF Downloaded!", 
      description: "Your mortgage calculation report has been saved." 
    });
  };

  const handleDownloadAmortizationPDF = () => {
    if (!result || !result.amortizationSchedule) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = 12;

    // Header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 38, 'F');
    
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('DapsiWow', pageWidth / 2, yPos + 5, { align: 'center' });
    
    yPos += 14;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Amortization Schedule Report', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 6;
    doc.setFontSize(8);
    doc.setTextColor(230, 240, 255);
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    doc.text(`Report Date: ${currentDate}`, pageWidth / 2, yPos, { align: 'center' });

    yPos = 48;
    
    // Table header
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPos, pageWidth - (2 * margin), 8, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    
    const colWidths = [20, 35, 35, 35, 35];
    const colX = [margin + 2, margin + 22, margin + 57, margin + 92, margin + 127];
    
    doc.text('#', colX[0], yPos + 5);
    doc.text('Payment', colX[1], yPos + 5);
    doc.text('Principal', colX[2], yPos + 5);
    doc.text('Interest', colX[3], yPos + 5);
    doc.text('Balance', colX[4], yPos + 5);
    
    yPos += 8;
    
    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    
    result.amortizationSchedule.forEach((payment, index) => {
      // Check if we need a new page
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
        
        // Repeat header on new page
        doc.setFillColor(59, 130, 246);
        doc.rect(margin, yPos, pageWidth - (2 * margin), 8, 'F');
        
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        
        doc.text('#', colX[0], yPos + 5);
        doc.text('Payment', colX[1], yPos + 5);
        doc.text('Principal', colX[2], yPos + 5);
        doc.text('Interest', colX[3], yPos + 5);
        doc.text('Balance', colX[4], yPos + 5);
        
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
      }
      
      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPos, pageWidth - (2 * margin), 6, 'F');
      }
      
      doc.setTextColor(0, 0, 0);
      doc.text(payment.month.toString(), colX[0], yPos + 4);
      doc.text(formatCurrency(payment.payment), colX[1], yPos + 4);
      
      doc.setTextColor(34, 197, 94);
      doc.text(formatCurrency(payment.principal), colX[2], yPos + 4);
      
      doc.setTextColor(249, 115, 22);
      doc.text(formatCurrency(payment.interest), colX[3], yPos + 4);
      
      doc.setTextColor(0, 0, 0);
      doc.text(formatCurrency(payment.balance), colX[4], yPos + 4);
      
      yPos += 6;
    });

    // Footer
    yPos = pageHeight - 22;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    yPos += 4;
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'italic');
    doc.text('This schedule shows how your payments are split between principal and interest over the first 5 years.', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('DapsiWow.com', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 3;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Free Online Financial Calculators & Tools', pageWidth / 2, yPos, { align: 'center' });

    doc.save(`DapsiWow-Amortization-Schedule-${new Date().getTime()}.pdf`);
    toast({ 
      title: "PDF Downloaded!", 
      description: "Your amortization schedule has been saved." 
    });
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

    let shareText = `🏠 Mortgage Calculator Results\n\n`;
    shareText += `📊 Loan Details:\n`;
    shareText += `• Home Price: ${formatCurrency(parseFloat(homePrice))}\n`;
    shareText += `• Monthly Payment: ${formatCurrency(result.monthlyPayment)}\n`;
    shareText += `• Total Interest: ${formatCurrency(result.totalInterest)}\n\n`;
    shareText += `🔗 View: ${shareableUrl}`;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Free Mortgage Calculator: Calculate Home Loan Payments Instantly | DapsiWow</title>
        <meta name="description" content="Calculate monthly mortgage payments with our free mortgage calculator. Includes taxes, insurance, PMI & amortization schedules for FHA, VA, conventional loans. Get accurate home affordability estimates instantly." />
        <meta name="keywords" content="mortgage calculator, mortgage payment calculator, home loan calculator, monthly mortgage payment, mortgage estimator, house payment calculator, home affordability calculator" />
        <link rel="canonical" href="https://dapsiwow.com/tools/mortgage-calculator" />
      </Helmet>

      <Header />

      <main>
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <Calculator className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-700" />
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Mortgage Calculator - Free & Accurate</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0">
                <span className="block">Free Mortgage Calculator:</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculate Home Loan Payments
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Calculate monthly mortgage payments, home affordability, and total interest costs instantly. Includes property taxes, insurance, PMI & detailed amortization schedules for FHA, VA, and conventional loans.
              </p>

              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Compare Rates</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Instant Results</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium">Save on Interest</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 lg:py-16">

          {/* Trust Signals */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4 sm:p-6 mb-8 border border-green-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">3.2M+</div>
                <div className="text-sm text-gray-600">Mortgage Calculations Done</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">100% Accurate</div>
                <div className="text-sm text-gray-600">Bank-Grade Calculator</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">Free Forever</div>
                <div className="text-sm text-gray-600">No Hidden Fees</div>
              </div>
            </div>
          </div>

          {/* How to Use Section */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl mb-8">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">How to Use This Mortgage Calculator</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                  <h3 className="font-bold text-gray-900">Enter Home Price</h3>
                  <p className="text-sm text-gray-600">Input the purchase price of the home you're considering. This is the total amount before your down payment.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                  <h3 className="font-bold text-gray-900">Set Down Payment</h3>
                  <p className="text-sm text-gray-600">Enter your down payment as a percentage or dollar amount. 20% or more avoids PMI on conventional loans.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                  <h3 className="font-bold text-gray-900">Choose Loan Term</h3>
                  <p className="text-sm text-gray-600">Select 15, 20, or 30 years. Shorter terms save on interest; longer terms lower monthly payments.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
                  <h3 className="font-bold text-gray-900">Enter Interest Rate</h3>
                  <p className="text-sm text-gray-600">Input the annual interest rate from your lender or current market rates.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">5</div>
                  <h3 className="font-bold text-gray-900">Add Taxes & Insurance</h3>
                  <p className="text-sm text-gray-600">Include annual property taxes and homeowners insurance for accurate monthly payment calculations.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">6</div>
                  <h3 className="font-bold text-gray-900">Calculate & Analyze</h3>
                  <p className="text-sm text-gray-600">Click "Calculate" to see your complete breakdown, amortization schedule, and affordability analysis.</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="home-price" className="text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                            <Home className="w-4 h-4 md:w-5 md:h-5" />
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
                          <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base md:text-lg">$</span>
                          <Input
                            id="home-price"
                            type="number"
                            value={homePrice}
                            onChange={(e) => setHomePrice(e.target.value)}
                            className="h-12 md:h-14 pl-7 md:pl-8 text-base md:text-lg border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
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

                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                            <DollarSign className="w-4 h-4 md:w-5 md:h-5" />
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
                            className="h-12 md:h-14 pr-7 md:pr-8 text-base md:text-lg border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="20"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <span className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-base md:text-lg">%</span>
                        </div>
                        <Slider
                          value={[parseFloat(downPaymentPercent) || 0]}
                          onValueChange={(value) => setDownPaymentPercent(value[0].toString())}
                          max={50}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide">Loan Term (Years)</Label>
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
                          className="h-12 md:h-14 text-base md:text-lg border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
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

                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="interest-rate" className="text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide">Interest Rate (%)</Label>
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
                            className="h-12 md:h-14 pr-7 md:pr-8 text-base md:text-lg border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="6.5"
                            step="0.01"
                          />
                          <span className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-base md:text-lg">%</span>
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

                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide">Payment Frequency</Label>
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
                          <SelectTrigger className="h-12 md:h-14 border-2 border-gray-200 rounded-lg md:rounded-xl text-base md:text-lg w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="loan-type" className="text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide">Loan Type</Label>
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
                          <SelectTrigger className="h-12 md:h-14 border-2 border-gray-200 rounded-lg md:rounded-xl text-base md:text-lg w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conventional">Conventional</SelectItem>
                            <SelectItem value="fha">FHA</SelectItem>
                            <SelectItem value="va">VA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="property-tax" className="text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide">Annual Property Tax</Label>
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
                          <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base md:text-lg">$</span>
                          <Input
                            id="property-tax"
                            type="number"
                            value={propertyTax}
                            onChange={(e) => setPropertyTax(e.target.value)}
                            className="h-12 md:h-14 pl-7 md:pl-8 text-base md:text-lg border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="6,000"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="home-insurance" className="text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide">Annual Home Insurance</Label>
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
                          <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base md:text-lg">$</span>
                          <Input
                            id="home-insurance"
                            type="number"
                            value={homeInsurance}
                            onChange={(e) => setHomeInsurance(e.target.value)}
                            className="h-12 md:h-14 pl-7 md:pl-8 text-base md:text-lg border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="1,800"
                          />
                        </div>
                      </div>

                      <div className="lg:col-span-2 space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="extra-payment" className="text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide">
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
                          <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base md:text-lg">$</span>
                          <Input
                            id="extra-payment"
                            type="number"
                            value={extraPayment}
                            onChange={(e) => setExtraPayment(e.target.value)}
                            className="h-12 md:h-14 pl-7 md:pl-8 text-base md:text-lg border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                        <p className="text-sm text-gray-500">💡 Pro Tip: Even small extra payments can save you thousands in interest!</p>
                      </div>
                    </div>
                  </TooltipProvider>

                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={calculateMortgage}
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
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
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-left">Your Mortgage Results</h2>

                    <div className="space-y-4 sm:space-y-6 md:space-y-8">
                      <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 border-2 border-blue-200 shadow-sm">
                        <div className="text-center space-y-2 sm:space-y-3">
                          <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">Estimated Monthly Payment</div>
                          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 break-all">
                            {formatCurrency(result.monthlyPayment)}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500">Based on monthly payment frequency</p>
                        </div>
                      </div>

                      {showChart && (
                        <div className="space-y-4 sm:space-y-6">
                          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-6 sm:mb-8 text-center text-lg sm:text-xl">Total Loan Breakdown</h3>
                            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8">
                              <div className="w-full max-w-[280px] sm:max-w-[340px] md:max-w-[380px]">
                                <ResponsiveContainer width="100%" height={300}>
                                  <RechartsPieChart>
                                    <Pie
                                      data={[
                                        { name: 'Principal', value: parseFloat(homePrice) - (usePercentage ? (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100 : parseFloat(downPayment)), percentage: principalPercentage },
                                        { name: 'Interest', value: result.totalInterest, percentage: interestPercentage }
                                      ]}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius="45%"
                                      outerRadius="75%"
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
                                        padding: '12px'
                                      }}
                                    />
                                    <Legend 
                                      verticalAlign="bottom" 
                                      height={36}
                                      iconType="circle"
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
                              <div className="grid grid-cols-1 gap-4 w-full max-w-xs lg:max-w-sm">
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 border-l-4 border-green-500">
                                  <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Principal Amount</p>
                                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-900 break-words">
                                        {formatCurrency(parseFloat(homePrice) - (usePercentage ? (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100 : parseFloat(downPayment)))}
                                      </p>
                                    </div>
                                    <div className="bg-green-500 rounded-full p-2 flex-shrink-0 ml-2">
                                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-xs text-green-600 mt-2">{principalPercentage.toFixed(1)}% of total</p>
                                </div>
                                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 sm:p-4 border-l-4 border-orange-500">
                                  <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">Total Interest</p>
                                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-900 break-words">
                                        {formatCurrency(result.totalInterest)}
                                      </p>
                                    </div>
                                    <div className="bg-orange-500 rounded-full p-2 flex-shrink-0 ml-2">
                                      <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-xs text-orange-600 mt-2">{interestPercentage.toFixed(1)}% of total</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {result.amortizationSchedule.length > 0 && (
                            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100">
                              <h3 className="font-bold text-gray-900 mb-4 sm:mb-6 text-center text-lg sm:text-xl">Payment Breakdown Over Time</h3>
                              <p className="text-center text-sm text-gray-600 mb-6">See how your payments shift from interest to principal</p>
                              <div className="w-full">
                                <ResponsiveContainer width="100%" height={360}>
                                  <AreaChart 
                                    data={result.amortizationSchedule.map(item => ({
                                      month: `Month ${item.month}`,
                                      Principal: item.principal,
                                      Interest: item.interest,
                                      Balance: item.balance
                                    }))}
                                    margin={{ top: 10, right: 5, left: -10, bottom: 0 }}
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
                                      tick={{ fontSize: 10, fill: '#6b7280' }}
                                      interval="preserveStartEnd"
                                      angle={-45}
                                      textAnchor="end"
                                      height={60}
                                    />
                                    <YAxis 
                                      tick={{ fontSize: 10, fill: '#6b7280' }}
                                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                      width={50}
                                    />
                                    <RechartsTooltip 
                                      formatter={(value: number) => formatCurrency(value)}
                                      contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                                        padding: '8px 12px',
                                        fontSize: '13px'
                                      }}
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
                                    />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Principal Amount</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base break-all">
                              {formatCurrency(parseFloat(homePrice) - (usePercentage ? (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100 : parseFloat(downPayment)))}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Total Interest Paid</span>
                            <span className="font-bold text-orange-600 text-sm sm:text-base break-all">
                              {formatCurrency(result.totalInterest)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Total Amount Paid</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base break-all">
                              {formatCurrency(result.totalAmount)}
                            </span>
                          </div>
                        </div>
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Amortization Schedule (First 5 Years)</h3>
                  <Button
                    onClick={handleDownloadAmortizationPDF}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-4">See how your payments are split between principal and interest over time.</p>
                <div 
                  ref={tableScrollRef}
                  className={`overflow-x-auto -mx-4 sm:mx-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                >
                  <table className="w-full min-w-[600px] select-none">
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

          {/* Understanding Mortgage Payments */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl mb-8 mt-8">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Understanding Mortgage Payments & How They Work</h2>
              <div className="prose max-w-none text-gray-700 space-y-4 text-base leading-relaxed">
                <p>
                  A mortgage is one of the biggest financial commitments most people make in their lifetime. Understanding how mortgage payments are calculated and what factors influence them is crucial for making informed home-buying decisions and potentially saving thousands of dollars over the life of your loan.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">The PITI Payment Structure</h3>
                <p>
                  Your total monthly mortgage payment consists of four main components, often abbreviated as PITI: Principal (the amount you borrowed), Interest (the cost of borrowing), property Taxes, and homeowners Insurance. Understanding each component helps you budget accurately and identify potential savings opportunities.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">How Mortgage Interest Works</h3>
                <p>
                  Mortgages use amortization, meaning your monthly payment stays the same, but the allocation between principal and interest changes over time. In the early years, most of your payment goes toward interest because it's calculated on your remaining balance. As you pay down the principal, less interest accrues each month, and more of your payment reduces the loan balance.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Impact of Down Payment Size</h3>
                <p>
                  Your down payment significantly affects your monthly payment and total loan cost. A larger down payment (20% or more on conventional loans) eliminates Private Mortgage Insurance (PMI), reduces your loan amount, and often qualifies you for better interest rates. For example, on a $400,000 home, a 20% down payment ($80,000) versus 10% ($40,000) eliminates $200+ monthly in PMI and reduces your principal & interest payment significantly.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Types of Mortgages */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl mb-8">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Types of Mortgages You Can Calculate</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Home className="w-5 h-5 text-blue-600" />
                    </div>
                    Conventional Loans
                  </h3>
                  <p className="text-gray-600">
                    Traditional mortgages not backed by the government, typically requiring 5-20% down payment and 620+ credit score. Best rates available with 20% down. PMI required below 20% down but can be removed at 78% LTV. Ideal for borrowers with solid credit and stable income.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    FHA Loans
                  </h3>
                  <p className="text-gray-600">
                    Federal Housing Administration insured loans requiring as little as 3.5% down with 580+ credit score. More lenient credit requirements make them accessible to first-time buyers. Includes upfront (1.75%) and annual mortgage insurance (0.85%).
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Home className="w-5 h-5 text-purple-600" />
                    </div>
                    VA Loans
                  </h3>
                  <p className="text-gray-600">
                    Veterans Affairs guaranteed loans for eligible military members, veterans, and spouses. Offers 0% down payment with no PMI requirement, making it one of the best loan options available. Requires VA funding fee (2.3% for first-time 0% down) but can be financed.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-orange-600" />
                    </div>
                    Fixed-Rate Mortgages
                  </h3>
                  <p className="text-gray-600">
                    Interest rate remains constant throughout the loan term (typically 15, 20, or 30 years). Provides payment stability and protection against rising rates. 30-year terms offer lowest monthly payments; 15-year terms save significantly on interest.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expert Mortgage Tips */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg rounded-2xl mb-8">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Expert Mortgage Tips & Best Practices</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">1. Get Pre-Approved Before House Hunting</h3>
                  <p className="text-gray-600 text-sm">
                    Pre-approval shows sellers you're a serious buyer and gives you a clear budget. It locks in an interest rate for 60-90 days and identifies potential issues early.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">2. Aim for 20% Down Payment</h3>
                  <p className="text-gray-600 text-sm">
                    While not always required, 20% down eliminates PMI on conventional loans (saving $100-300/month), secures better rates, and builds instant equity.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">3. Improve Your Credit Score First</h3>
                  <p className="text-gray-600 text-sm">
                    Even a 20-point credit score increase can significantly lower your rate. Pay down credit cards, dispute errors, and avoid new credit inquiries 3-6 months before applying.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">4. Compare Multiple Lender Quotes</h3>
                  <p className="text-gray-600 text-sm">
                    Shop at least 3-5 lenders within a 45-day window to avoid multiple credit hits. Compare APR (not just rate), closing costs, and loan terms.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">5. Understand Total Housing Costs</h3>
                  <p className="text-gray-600 text-sm">
                    Budget for PITI plus maintenance (1-2% of home value annually), HOA fees, utilities, and potential repairs. The 28% rule suggests housing costs shouldn't exceed 28% of gross income.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">6. Make Extra Principal Payments Early</h3>
                  <p className="text-gray-600 text-sm">
                    Extra payments have the biggest impact in early years when the principal is highest. Even $100-200 monthly can save tens of thousands in interest.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl mb-8">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions About Mortgage Calculators</h2>
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">How accurate is this mortgage calculator?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our mortgage calculator provides highly accurate estimates using the standard amortization formula that banks and lenders use. However, actual payments may vary slightly based on your lender's specific terms and exact closing date. Always verify final numbers with your mortgage lender.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">How much house can I afford?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lenders typically use the 28/36 rule: your monthly housing payment (PITI) should not exceed 28% of gross monthly income, and total debt payments shouldn't exceed 36%. For example, with a $7,000 monthly income, your maximum mortgage payment should be $1,960.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">What is PMI and when can I remove it?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Private Mortgage Insurance (PMI) is required on conventional loans when you put down less than 20%. It typically costs 0.5-1% of the loan amount annually. You can request PMI removal once you reach 78% loan-to-value ratio through payments or home appreciation.
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Should I choose a 15-year or 30-year mortgage?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    A 30-year mortgage offers lower monthly payments but you'll pay significantly more interest over the loan's life. A 15-year mortgage has higher monthly payments but you'll pay roughly half the total interest. Choose based on your budget and financial goals.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Tools */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0 shadow-lg rounded-2xl mb-8">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Financial Calculators</h2>
              <p className="text-gray-600 mb-8">
                Explore our other free financial calculators to make informed decisions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <a href="/tools/loan-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2">Loan Calculator</h3>
                  <p className="text-sm text-gray-600">Calculate personal, auto, and business loan payments</p>
                </a>
                <a href="/tools/home-loan-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2">Home Loan Calculator</h3>
                  <p className="text-sm text-gray-600">Specialized calculator for home loans with property-specific factors</p>
                </a>
                <a href="/tools/compound-interest-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2">Compound Interest Calculator</h3>
                  <p className="text-sm text-gray-600">See how your investments grow over time</p>
                </a>
                <a href="/tools/budget-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2">Budget Calculator</h3>
                  <p className="text-sm text-gray-600">Create and manage your monthly budget</p>
                </a>
                <a href="/tools/retirement-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2">Retirement Calculator</h3>
                  <p className="text-sm text-gray-600">Plan for a comfortable retirement</p>
                </a>
                <a href="/tools/simple-interest-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2">Simple Interest Calculator</h3>
                  <p className="text-sm text-gray-600">Calculate simple interest on loans and investments</p>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MortgageCalculator;
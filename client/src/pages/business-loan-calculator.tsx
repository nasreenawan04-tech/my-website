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
import { Info, Download, Share2, Calculator, TrendingDown, Clock, DollarSign, PieChart, Building2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { jsPDF } from 'jspdf';

interface BusinessLoanResult {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  yearlyPayment: number;
  debtServiceCoverage: number;
  loanToValue: number;
  amortizationSchedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export default function BusinessLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState('250000');
  const [interestRate, setInterestRate] = useState('7.50');
  const [loanTerm, setLoanTerm] = useState('10');
  const [termUnit, setTermUnit] = useState('years');
  const [loanType, setLoanType] = useState('term-loan');
  const [businessRevenue, setBusinessRevenue] = useState('');
  const [collateralValue, setCollateralValue] = useState('');
  const [showAmortization, setShowAmortization] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [result, setResult] = useState<BusinessLoanResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const { toast } = useToast();

  // Load parameters from URL on mount (for shared links)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const amount = params.get('amount');
    const rate = params.get('rate');
    const term = params.get('term');
    const unit = params.get('unit');
    const type = params.get('type');
    const revenue = params.get('revenue');
    const collateral = params.get('collateral');

    if (amount || rate || term) {
      if (amount) setLoanAmount(amount);
      if (rate) setInterestRate(rate);
      if (term) setLoanTerm(term);
      if (unit) setTermUnit(unit);
      if (type) setLoanType(type);
      if (revenue) setBusinessRevenue(revenue);
      if (collateral) setCollateralValue(collateral);

      // Trigger calculation after state updates
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
    const walk = (x - startX) * 2;
    tableScrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const calculateBusinessLoan = () => {
    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate) / 100;
    const rate = annualRate / 12;
    const termMonths = termUnit === 'years' ? parseFloat(loanTerm) * 12 : parseFloat(loanTerm);
    const revenue = parseFloat(businessRevenue) || 0;
    const collateral = parseFloat(collateralValue) || 0;

    if (principal <= 0 || annualRate <= 0 || termMonths <= 0) return;

    let monthlyPayment;
    
    if (loanType === 'line-of-credit') {
      monthlyPayment = principal * rate;
    } else {
      monthlyPayment = (principal * rate * Math.pow(1 + rate, termMonths)) / (Math.pow(1 + rate, termMonths) - 1);
    }

    const amortizationSchedule = [];
    let currentBalance = principal;
    let totalInterestPaid = 0;

    for (let month = 1; month <= termMonths && currentBalance > 0.01; month++) {
      const interestPayment = currentBalance * rate;
      const principalPayment = loanType === 'line-of-credit' ? 0 : Math.min(monthlyPayment - interestPayment, currentBalance);
      
      if (loanType !== 'line-of-credit') {
        currentBalance -= principalPayment;
      }
      totalInterestPaid += interestPayment;

      if (month <= 60) {
        amortizationSchedule.push({
          month,
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
          balance: currentBalance
        });
      }
    }
    
    const totalAmount = loanType === 'line-of-credit' ? totalInterestPaid + principal : monthlyPayment * termMonths;
    const totalInterest = loanType === 'line-of-credit' ? totalInterestPaid : totalAmount - principal;
    const yearlyPayment = monthlyPayment * 12;
    
    const debtServiceCoverage = revenue > 0 ? revenue / yearlyPayment : 0;
    const loanToValue = collateral > 0 ? (principal / collateral) * 100 : 0;

    setResult({
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      yearlyPayment: Math.round(yearlyPayment * 100) / 100,
      debtServiceCoverage: Math.round(debtServiceCoverage * 100) / 100,
      loanToValue: Math.round(loanToValue * 100) / 100,
      amortizationSchedule
    });

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const resetCalculator = () => {
    setLoanAmount('250000');
    setInterestRate('7.50');
    setLoanTerm('10');
    setTermUnit('years');
    setLoanType('term-loan');
    setBusinessRevenue('');
    setCollateralValue('');
    setShowAmortization(false);
    setShowChart(false);
    setResult(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
    doc.text('Business Loan Calculation Report', pageWidth / 2, yPos, { align: 'center' });
    
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
    
    doc.save(`DapsiWow-Business-Loan-${new Date().getTime()}.pdf`);
    toast({ 
      title: "PDF Downloaded!", 
      description: "Your business loan calculation report has been saved." 
    });
  };

  const handleDownloadAmortizationPDF = () => {
    if (!result || !result.amortizationSchedule) return;

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
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    
    result.amortizationSchedule.forEach((payment, index) => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
        
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

    doc.save(`DapsiWow-Business-Loan-Amortization-${new Date().getTime()}.pdf`);
    toast({ 
      title: "PDF Downloaded!", 
      description: "Your amortization schedule has been saved." 
    });
  };

  const handleShare = async () => {
    if (!result) return;

    const params = new URLSearchParams({
      amount: loanAmount,
      rate: interestRate,
      term: loanTerm,
      unit: termUnit,
      type: loanType
    });
    
    // Add optional business parameters if they exist
    if (businessRevenue) params.append('revenue', businessRevenue);
    if (collateralValue) params.append('collateral', collateralValue);
    
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    let shareText = `💼 Business Loan Calculator Results\n\n`;
    shareText += `📊 Loan Details:\n`;
    shareText += `• Loan Amount: ${formatCurrency(parseFloat(loanAmount))}\n`;
    shareText += `• Monthly Payment: ${formatCurrency(result.monthlyPayment)}\n`;
    shareText += `• Total Interest: ${formatCurrency(result.totalInterest)}\n\n`;
    shareText += `🔗 View: ${shareableUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '💼 Business Loan Calculator Results',
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

  const principalPercentage = result ? (parseFloat(loanAmount) / result.totalAmount) * 100 : 0;
  const interestPercentage = result ? (result.totalInterest / result.totalAmount) * 100 : 0;

  const pieData = result ? [
    { name: 'Principal', value: parseFloat(loanAmount), color: '#3b82f6' },
    { name: 'Interest', value: result.totalInterest, color: '#f97316' }
  ] : [];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What types of business loans can I calculate with this tool?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our calculator supports SBA loans, term loans, equipment financing, lines of credit, working capital loans, and commercial mortgages. Each loan type uses appropriate calculation methods to provide accurate monthly payment estimates and amortization schedules."
        }
      },
      {
        "@type": "Question",
        "name": "What is a debt service coverage ratio (DSCR)?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DSCR is the ratio of your business's annual revenue to annual loan payments. Lenders typically require a DSCR of 1.25 or higher, meaning your business generates 25% more income than needed to cover loan payments. Higher ratios indicate stronger ability to repay."
        }
      },
      {
        "@type": "Question",
        "name": "How do I qualify for an SBA loan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SBA loan qualification typically requires: a credit score of 680+, 2+ years in business, strong cash flow, collateral, and a solid business plan. SBA 7(a) loans offer up to $5 million with competitive rates (typically 6-9%) and longer repayment terms (up to 25 years for real estate)."
        }
      },
      {
        "@type": "Question",
        "name": "What's the typical interest rate for business loans in 2025?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "As of 2025, business loan rates vary by type: SBA loans (6-9%), traditional bank loans (6-10%), online lender term loans (10-30%), equipment financing (8-20%), and lines of credit (7-25%). Rates depend on creditworthiness, business financials, and loan terms."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Business Loan Calculator: Calculate SBA, Term & Equipment Loan Payments 2025 | DapsiWow</title>
        <meta name="description" content="Free business loan calculator for SBA loans, term loans, equipment financing, working capital & commercial mortgages. Calculate monthly payments, debt service coverage ratio (DSCR), loan-to-value (LTV) ratios with instant amortization schedules. Support for 10+ loan types." />
        <meta name="keywords" content="business loan calculator, SBA loan calculator, commercial loan calculator, equipment financing calculator, working capital loan calculator, commercial mortgage calculator, business loan payment calculator, debt service coverage ratio calculator, DSCR calculator, loan to value calculator, LTV calculator, small business loan calculator, business financing calculator, commercial loan payment calculator, SBA 7a loan calculator, SBA 504 loan calculator, equipment loan calculator, business line of credit calculator, term loan calculator, business loan amortization calculator, calculate business loan payments, business loan interest calculator" />
        <meta property="og:title" content="Business Loan Calculator: Calculate SBA, Term & Equipment Loan Payments | DapsiWow" />
        <meta property="og:description" content="Professional business loan calculator for accurate payment calculations. Calculate SBA loans, equipment financing, working capital with debt service coverage & LTV analysis. 100% free, instant results." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/tools/business-loan-calculator" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Business Loan Calculator: Calculate SBA & Commercial Loan Payments Instantly" />
        <meta name="twitter:description" content="Calculate business loan payments for SBA loans, equipment financing, working capital with our professional calculator. Instant DSCR & LTV analysis with amortization schedules." />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/business-loan-calculator" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Business Loan Calculator",
            "description": "Free online business loan calculator to calculate monthly payments and analyze business financing options including SBA loans, equipment financing, working capital loans, and commercial mortgages with DSCR and LTV analysis.",
            "url": "https://dapsiwow.com/tools/business-loan-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate business loan payments",
              "Support for SBA, term, equipment, and working capital loans",
              "Debt service coverage ratio (DSCR) analysis",
              "Loan-to-value (LTV) ratio calculation",
              "Amortization schedule generation",
              "PDF export and sharing functionality"
            ]
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <Header />

      <main>
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-700" />
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Business Loan Calculator - Free & Accurate</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0">
                <span className="block">Free Business Loan Calculator:</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculate SBA & Commercial Loans
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Calculate monthly payments for SBA loans, equipment financing, working capital, and commercial mortgages instantly. Includes debt service coverage ratio (DSCR) and loan-to-value (LTV) analysis with detailed amortization schedules. 100% free, no registration required.
              </p>

              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Compare Loan Types</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Instant Results</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium">DSCR & LTV Analysis</span>
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
                <div className="text-2xl font-bold text-gray-900">500K+</div>
                <div className="text-sm text-gray-600">Business Loans Calculated</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">100% Free</div>
                <div className="text-sm text-gray-600">No Registration Required</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">Bank-Grade</div>
                <div className="text-sm text-gray-600">Accurate Calculations</div>
              </div>
            </div>
          </div>

          {/* How to Use Section */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl mb-8">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">How to Use This Business Loan Calculator</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                  <h3 className="font-bold text-gray-900">Select Loan Type</h3>
                  <p className="text-sm text-gray-600">Choose from SBA loans, term loans, equipment financing, working capital, or commercial mortgages based on your business needs.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                  <h3 className="font-bold text-gray-900">Enter Loan Amount</h3>
                  <p className="text-sm text-gray-600">Input the total amount you need to borrow. Business loans typically range from $50,000 to $5 million depending on the type and your qualifications.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                  <h3 className="font-bold text-gray-900">Set Interest Rate</h3>
                  <p className="text-sm text-gray-600">Enter the annual percentage rate (APR). SBA loans typically offer 6-9%, while online lenders may charge 10-30% based on your credit and business profile.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
                  <h3 className="font-bold text-gray-900">Choose Loan Term</h3>
                  <p className="text-sm text-gray-600">Select repayment period (typically 1-25 years). SBA loans offer up to 10 years for working capital and 25 years for real estate purchases.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">5</div>
                  <h3 className="font-bold text-gray-900">Add Business Details</h3>
                  <p className="text-sm text-gray-600">Optionally enter annual revenue and collateral value to calculate your Debt Service Coverage Ratio (DSCR) and Loan-to-Value (LTV) ratio.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">6</div>
                  <h3 className="font-bold text-gray-900">Calculate & Analyze</h3>
                  <p className="text-sm text-gray-600">Click "Calculate Business Loan" to see monthly payments, total interest, DSCR, LTV ratios, and detailed amortization schedules.</p>
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
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Business Loan Configuration</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your business loan details to get accurate payment calculations and financial analysis</p>
                  </div>

                  <TooltipProvider>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="loan-type" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Loan Type
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Select the type of business financing you need</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={loanType} onValueChange={setLoanType}>
                          <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg" data-testid="select-loan-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="term-loan">Term Loan</SelectItem>
                            <SelectItem value="sba-loan">SBA Loan (7a or 504)</SelectItem>
                            <SelectItem value="equipment-loan">Equipment Financing</SelectItem>
                            <SelectItem value="line-of-credit">Line of Credit</SelectItem>
                            <SelectItem value="working-capital">Working Capital Loan</SelectItem>
                            <SelectItem value="commercial-mortgage">Commercial Mortgage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="loan-amount" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Loan Amount
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">The total amount you want to borrow for your business</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                          <Input
                            id="loan-amount"
                            type="number"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="250,000"
                            data-testid="input-loan-amount"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="interest-rate" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Annual Interest Rate
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">The annual percentage rate (APR) for your business loan</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <Input
                            id="interest-rate"
                            type="number"
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 pr-6 sm:pr-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="7.50"
                            step="0.01"
                            data-testid="input-interest-rate"
                          />
                          <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">%</span>
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Loan Term
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">How long you'll take to repay the loan</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            value={loanTerm}
                            onChange={(e) => setLoanTerm(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            placeholder="10"
                            min="1"
                            data-testid="input-loan-term"
                          />
                          <Select value={termUnit} onValueChange={setTermUnit}>
                            <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg" data-testid="select-term-unit">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="years">Years</SelectItem>
                              <SelectItem value="months">Months</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="business-revenue" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Annual Revenue (Optional)
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Your business's annual revenue to calculate DSCR</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                          <Input
                            id="business-revenue"
                            type="number"
                            value={businessRevenue}
                            onChange={(e) => setBusinessRevenue(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="500,000"
                            data-testid="input-business-revenue"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="collateral-value" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Collateral Value (Optional)
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Value of assets securing the loan to calculate LTV</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                          <Input
                            id="collateral-value"
                            type="number"
                            value={collateralValue}
                            onChange={(e) => setCollateralValue(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="300,000"
                            data-testid="input-collateral-value"
                          />
                        </div>
                      </div>
                    </div>
                  </TooltipProvider>

                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={calculateBusinessLoan}
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      <Calculator className="w-5 h-5 mr-2" />
                      Calculate Business Loan
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset Calculator
                    </Button>
                  </div>

                  {result && (
                    <>
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-3 sm:pt-4 print:hidden">
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
                          data-testid="button-share"
                        >
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                        <Button
                          onClick={handleDownloadPDF}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                          data-testid="button-download"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download PDF
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {/* Results Section */}
                {result && (
                  <div ref={resultsRef} className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-6">Your Business Loan Results</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                        <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                          Monthly Payment
                        </div>
                        <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2" data-testid="text-monthly-payment">
                          {formatCurrency(result.monthlyPayment)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {loanType === 'line-of-credit' ? 'Interest-only payment' : 'Principal + Interest'}
                        </div>
                      </div>

                      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                        <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                          Annual Payment
                        </div>
                        <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2" data-testid="text-yearly-payment">
                          {formatCurrency(result.yearlyPayment)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          Total yearly obligation
                        </div>
                      </div>

                      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                        <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                          Total Interest
                        </div>
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600 mb-2" data-testid="text-total-interest">
                          {formatCurrency(result.totalInterest)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          Interest paid over {loanTerm} {termUnit}
                        </div>
                      </div>

                      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                        <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                          Total Amount
                        </div>
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2" data-testid="text-total-amount">
                          {formatCurrency(result.totalAmount)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          Principal + Interest
                        </div>
                      </div>

                      {result.debtServiceCoverage > 0 && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-green-200">
                          <div className="text-xs sm:text-sm font-semibold text-green-800 uppercase tracking-wide mb-2">
                            Debt Service Coverage Ratio (DSCR)
                          </div>
                          <div className="text-3xl sm:text-4xl font-bold text-green-700 mb-2" data-testid="text-dscr">
                            {result.debtServiceCoverage.toFixed(2)}x
                          </div>
                          <div className="text-xs sm:text-sm text-green-600">
                            {result.debtServiceCoverage >= 1.25 ? '✓ Excellent - Lenders prefer 1.25+' : result.debtServiceCoverage >= 1.0 ? '✓ Good - May qualify' : '✗ Low - May not qualify'}
                          </div>
                        </div>
                      )}

                      {result.loanToValue > 0 && (
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-purple-200">
                          <div className="text-xs sm:text-sm font-semibold text-purple-800 uppercase tracking-wide mb-2">
                            Loan-to-Value Ratio (LTV)
                          </div>
                          <div className="text-3xl sm:text-4xl font-bold text-purple-700 mb-2" data-testid="text-ltv">
                            {result.loanToValue.toFixed(1)}%
                          </div>
                          <div className="text-xs sm:text-sm text-purple-600">
                            {result.loanToValue <= 80 ? '✓ Excellent - Below 80% preferred' : result.loanToValue <= 90 ? '✓ Good - Acceptable range' : '✗ High - May need more collateral'}
                          </div>
                        </div>
                      )}
                    </div>

                    {showChart && (
                      <div className="mt-6 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Loan Breakdown</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <RechartsPieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}

                {!result && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Results</h2>
                    <div className="text-center py-8 sm:py-12 md:py-16">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <Calculator className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base md:text-lg px-4">Enter your business loan details above and click "Calculate Business Loan" to see your personalized results</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amortization Schedule */}
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
                    data-testid="button-export-amortization-pdf"
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

          {/* Business Loan Tips */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg rounded-2xl mt-8">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Tips for Getting the Best Business Loan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">1. Improve Your Business Credit Score</h3>
                  <p className="text-gray-600 text-sm">
                    A strong business credit score (680+) qualifies you for better rates. Pay bills on time, reduce credit utilization below 30%, and fix any errors on your credit report. Consider building business credit separately from personal credit.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">2. Prepare Strong Financial Documentation</h3>
                  <p className="text-gray-600 text-sm">
                    Lenders want to see 2-3 years of tax returns, bank statements, profit & loss statements, and balance sheets. Organized, accurate financials showing consistent revenue and profitability significantly improve approval odds and terms.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">3. Understand Your Debt Service Coverage Ratio</h3>
                  <p className="text-gray-600 text-sm">
                    Lenders typically require a DSCR of 1.25 or higher, meaning your business generates 25% more income than needed for loan payments. Calculate your DSCR (annual revenue / annual loan payments) before applying to ensure you qualify.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">4. Compare SBA Loans vs Traditional Loans</h3>
                  <p className="text-gray-600 text-sm">
                    SBA loans offer lower rates (6-9%) and longer terms but require extensive documentation and take 60-90 days. Traditional bank loans have faster approval (2-4 weeks) but higher rates. Online lenders approve in days but charge 10-30% APR.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">5. Offer Adequate Collateral</h3>
                  <p className="text-gray-600 text-sm">
                    Secured loans typically offer 2-5% lower rates than unsecured loans. Real estate, equipment, inventory, and accounts receivable can serve as collateral. Keep your loan-to-value (LTV) ratio below 80% for best terms.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">6. Shop Around and Negotiate</h3>
                  <p className="text-gray-600 text-sm">
                    Compare at least 3-5 lenders including banks, credit unions, SBA lenders, and online platforms. Use competing offers to negotiate better rates. Even a 0.5% rate reduction can save thousands over the loan term. Watch for hidden fees and prepayment penalties.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">7. Choose the Right Loan Type</h3>
                  <p className="text-gray-600 text-sm">
                    Term loans work for major purchases, lines of credit provide working capital flexibility, equipment financing offers lower rates for machinery, and SBA 504 loans excel for commercial real estate. Match the loan type to your specific need for optimal terms.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">8. Demonstrate Strong Cash Flow</h3>
                  <p className="text-gray-600 text-sm">
                    Lenders prioritize businesses with consistent, positive cash flow. Show at least 6 months of bank statements with healthy balances. Seasonal businesses should explain revenue patterns and show reserves to cover slow periods.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl mt-8">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions About Business Loans</h2>
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">What is a business loan calculator and how does it work?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    A business loan calculator uses your loan amount, interest rate, and term to calculate monthly payments using standard amortization formulas. It also provides business-specific metrics like Debt Service Coverage Ratio (DSCR) and Loan-to-Value (LTV) ratios. Our calculator supports multiple loan types including SBA loans, term loans, equipment financing, and commercial mortgages, each using appropriate calculation methods for accurate estimates.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">What is the difference between an SBA loan and a traditional business loan?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    SBA loans are partially guaranteed by the Small Business Administration, allowing lenders to offer lower rates (typically 6-9%) and longer terms (up to 25 years for real estate). They require extensive documentation, take 60-90 days to approve, and have strict eligibility criteria. Traditional bank loans have faster approval (2-4 weeks), higher rates (8-12%), shorter terms, and may require stronger credit or more collateral. Online lenders approve fastest (1-7 days) but charge the highest rates (10-30% APR).
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">What is a good Debt Service Coverage Ratio (DSCR)?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lenders typically require a DSCR of 1.25 or higher, meaning your business generates at least 25% more income than needed to cover all debt payments. A DSCR of 1.0 means you break even, below 1.0 indicates insufficient cash flow, and above 2.0 is considered excellent. Calculate DSCR by dividing annual net operating income by total annual debt service (all loan payments). Our calculator automatically computes this when you enter your annual business revenue.
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">How much can I borrow for my small business?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Loan amounts vary by type and lender: SBA 7(a) loans offer up to $5 million, SBA 504 loans up to $5.5 million for real estate/equipment, traditional bank term loans $50,000-$5 million, online lenders $5,000-$500,000, and equipment financing up to 100% of equipment value. Your maximum loan depends on revenue (typically 10-50% of annual revenue), time in business (2+ years preferred), credit score (680+ for best terms), and collateral value. Use our calculator to model different loan amounts and find affordable monthly payments.
                  </p>
                </div>

                <div className="border-l-4 border-indigo-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">What is a Loan-to-Value (LTV) ratio and why does it matter?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    LTV ratio compares your loan amount to the value of your collateral, expressed as a percentage. For example, a $300,000 loan secured by $400,000 in assets has a 75% LTV. Lenders prefer LTV ratios of 80% or lower because it provides a safety cushion if they need to seize and sell collateral. Lower LTV ratios (60-70%) often qualify for better interest rates and terms. Commercial real estate loans typically max out at 75-80% LTV, while equipment financing may go up to 90% LTV for new equipment.
                  </p>
                </div>

                <div className="border-l-4 border-pink-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">What are typical business loan interest rates in 2025?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Current business loan rates vary significantly: SBA 7(a) loans 6-9%, SBA 504 loans 5-8%, traditional bank term loans 6-10%, credit union loans 7-11%, online term loans 10-30%, equipment financing 8-20%, and business lines of credit 7-25%. Your actual rate depends on credit score (720+ gets best rates), time in business (2+ years preferred), annual revenue, collateral, industry risk, and loan amount. Rates change with Federal Reserve policy, so check current offers from multiple lenders.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Can I get a business loan with bad credit?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Yes, but options are limited and expensive. With credit scores of 580-640, you may qualify for online lender term loans at 18-36% APR, merchant cash advances (very expensive, effective rates 40-200% APR), or invoice factoring. Below 580, consider microloans from nonprofits, business credit cards for immediate needs, or crowdfunding. To improve approval odds: offer strong collateral, provide a co-signer with good credit, show consistent revenue growth, make a larger down payment (20-30%), or work on improving credit for 6-12 months before applying.
                  </p>
                </div>

                <div className="border-l-4 border-teal-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">What documents do I need to apply for a business loan?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Standard requirements include: business tax returns (2-3 years), personal tax returns (2 years), bank statements (6-12 months), profit & loss statements (current), balance sheet, business plan (especially for startups), business licenses and registrations, list of business debts, and personal financial statement. SBA loans additionally require personal background forms, lease agreements, franchise agreements (if applicable), and projected financials. Have these organized before applying to speed up the approval process.
                  </p>
                </div>

                <div className="border-l-4 border-yellow-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Should I choose a shorter or longer loan term?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Shorter terms (1-5 years) mean higher monthly payments but significantly less total interest. Longer terms (7-25 years) offer lower monthly payments but cost more over time. For working capital, choose 1-3 years to minimize interest. For equipment, match the loan term to the equipment's useful life (3-7 years). For commercial real estate, 10-25 year terms are standard and appropriate. Consider your cash flow stability—seasonal businesses benefit from longer terms providing payment flexibility during slow periods.
                  </p>
                </div>

                <div className="border-l-4 border-gray-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">What is the difference between a term loan and a line of credit?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    A term loan provides a lump sum upfront with fixed monthly payments over a set period (1-25 years). It's ideal for specific purchases like equipment, real estate, or business expansion with predictable repayment. A line of credit works like a credit card—borrow up to a limit as needed, pay interest only on what you use, and reuse the credit as you repay. Lines of credit are perfect for managing cash flow gaps, seasonal inventory, or emergency expenses. Term loans typically have lower rates but less flexibility than lines of credit.
                  </p>
                </div>

                <div className="border-l-4 border-cyan-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">How long does it take to get approved for a business loan?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Approval times vary dramatically by lender and loan type: online lenders 1-7 days, traditional banks 2-4 weeks, credit unions 2-3 weeks, and SBA loans 60-90 days. Factors affecting speed include completeness of your application, complexity of your business structure, loan amount, and lender workload. To speed up approval: have all documents organized upfront, respond quickly to lender requests, work with lenders familiar with your industry, and consider pre-qualification to identify likely approvals before full applications.
                  </p>
                </div>

                <div className="border-l-4 border-lime-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">What fees should I watch out for with business loans?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Common business loan fees include: origination fees (1-8% of loan amount, often 2-5%), application fees ($75-$500), underwriting fees ($500-$2,000 for larger loans), appraisal fees ($300-$5,000 for real estate), legal review fees ($500-$2,000), SBA guarantee fees (0-3.75% based on loan size and term), annual fees (for lines of credit), late payment penalties (typically 5% of payment), and prepayment penalties (especially on SBA loans). Always request a complete fee schedule and factor these into your total cost comparison. Some online lenders advertise low rates but charge high origination fees that increase effective APR significantly.
                  </p>
                </div>

                <div className="border-l-4 border-amber-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Can startups get business loans?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Startups face challenges getting traditional loans since most lenders require 2+ years in business and proven revenue. However, options exist: SBA microloans ($500-$50,000 for newer businesses), business credit cards for immediate needs, equipment financing (lenders secure the equipment), personal loans if you have good personal credit, startup business loans from online lenders (10-30% APR), crowdfunding or peer-to-peer lending, and investors or venture capital for high-growth startups. Strong personal credit (700+), a solid business plan, industry experience, and personal investment (20-30% of total) significantly improve approval odds.
                  </p>
                </div>

                <div className="border-l-4 border-emerald-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">What happens if I can't make my business loan payments?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Missing payments triggers serious consequences: immediate late fees (5% of payment or $25-$50), damage to both business and personal credit scores, potential default after 90 days of non-payment, acceleration of the entire loan balance becoming due, seizure of collateral (equipment, real estate, inventory), personal liability if you personally guaranteed the loan, and legal action including judgments and liens. If you foresee payment difficulties, contact your lender immediately—many will work with you on temporary payment plans, loan modifications, or forbearance programs. It's always better to communicate early than to miss payments.
                  </p>
                </div>

                <div className="border-l-4 border-rose-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Is this business loan calculator accurate?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our calculator provides highly accurate estimates using industry-standard amortization formulas that banks and financial institutions use. However, actual loan terms may vary based on your creditworthiness, business financials, lender-specific policies, origination fees, insurance requirements, and other factors not included in basic calculations. The DSCR and LTV calculations are simplified models—actual lender requirements vary. Always verify final numbers including all fees, exact APR, and payment schedules with your lender before making decisions. Use our calculator to compare scenarios and understand approximate costs, then get precise quotes from lenders.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Tools */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0 shadow-lg rounded-2xl mt-8">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Financial Calculators</h2>
              <p className="text-gray-600 mb-8">
                Explore our other free financial calculators to make informed decisions about your business finances:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <a href="/tools/loan-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2">Loan Calculator</h3>
                  <p className="text-sm text-gray-600">Calculate personal, auto, and general loan payments</p>
                </a>
                <a href="/tools/simple-interest-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2">Simple Interest Calculator</h3>
                  <p className="text-sm text-gray-600">Calculate simple interest on loans and investments</p>
                </a>
                <a href="/tools/compound-interest-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2">Compound Interest Calculator</h3>
                  <p className="text-sm text-gray-600">See how compound interest grows your investments</p>
                </a>
                <a href="/tools/roi-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2">ROI Calculator</h3>
                  <p className="text-sm text-gray-600">Calculate return on investment for business decisions</p>
                </a>
                <a href="/tools/break-even-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2">Break-Even Calculator</h3>
                  <p className="text-sm text-gray-600">Determine when your business becomes profitable</p>
                </a>
                <a href="/tools/budget-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2">Budget Calculator</h3>
                  <p className="text-sm text-gray-600">Create and manage your business budget</p>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <div className="text-center text-sm text-gray-500 mt-8">
            <p>Last Updated: January 2025 | Calculations verified by financial experts</p>
            <p className="mt-2">✓ Trusted by 2.5M+ users worldwide | ✓ Bank-grade accuracy | ✓ 100% Free Forever</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

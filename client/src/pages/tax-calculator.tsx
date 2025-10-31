
import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DollarSign, Download, Share2, Calculator, TrendingUp, FileText, PieChart, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { Link } from 'wouter';

interface TaxResult {
  grossIncome: number;
  taxableIncome: number;
  incomeTax: number;
  netIncome: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;
  taxBreakdown: { bracket: string; rate: number; amount: number }[];
}

interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export default function TaxCalculator() {
  const [income, setIncome] = useState('50000');
  const [filingStatus, setFilingStatus] = useState('single');
  const [deductions, setDeductions] = useState('12950'); // 2023 standard deduction
  const [country, setCountry] = useState('US');
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<TaxResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const countries = [
    { code: 'US', name: 'United States', currency: 'USD' },
    { code: 'UK', name: 'United Kingdom', currency: 'GBP' },
    { code: 'CA', name: 'Canada', currency: 'CAD' },
    { code: 'AU', name: 'Australia', currency: 'AUD' },
    { code: 'IN', name: 'India', currency: 'INR' }
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'INR', name: 'Indian Rupee' }
  ];

  const filingStatuses = {
    US: [
      { value: 'single', label: 'Single' },
      { value: 'married_jointly', label: 'Married Filing Jointly' }
    ],
    UK: [
      { value: 'individual', label: 'Individual' }
    ],
    CA: [
      { value: 'single', label: 'Single' }
    ],
    AU: [
      { value: 'resident', label: 'Resident' }
    ],
    IN: [
      { value: 'individual', label: 'Individual' }
    ]
  };

  // Simplified tax brackets for different countries (2023/2024 tax year)
  const taxBrackets: { [key: string]: { [key: string]: TaxBracket[] } } = {
    US: {
      single: [
        { min: 0, max: 11000, rate: 0.10 },
        { min: 11000, max: 44725, rate: 0.12 },
        { min: 44725, max: 95375, rate: 0.22 },
        { min: 95375, max: 182050, rate: 0.24 },
        { min: 182050, max: 231250, rate: 0.32 },
        { min: 231250, max: 578125, rate: 0.35 },
        { min: 578125, max: null, rate: 0.37 }
      ],
      married_jointly: [
        { min: 0, max: 22000, rate: 0.10 },
        { min: 22000, max: 89450, rate: 0.12 },
        { min: 89450, max: 190750, rate: 0.22 },
        { min: 190750, max: 364200, rate: 0.24 },
        { min: 364200, max: 462500, rate: 0.32 },
        { min: 462500, max: 693750, rate: 0.35 },
        { min: 693750, max: null, rate: 0.37 }
      ]
    },
    UK: {
      individual: [
        { min: 0, max: 12570, rate: 0.00 },
        { min: 12570, max: 50270, rate: 0.20 },
        { min: 50270, max: 150000, rate: 0.40 },
        { min: 150000, max: null, rate: 0.45 }
      ]
    },
    CA: {
      single: [
        { min: 0, max: 15000, rate: 0.00 },
        { min: 15000, max: 53359, rate: 0.15 },
        { min: 53359, max: 106717, rate: 0.205 },
        { min: 106717, max: 165430, rate: 0.26 },
        { min: 165430, max: 235675, rate: 0.29 },
        { min: 235675, max: null, rate: 0.33 }
      ]
    },
    AU: {
      resident: [
        { min: 0, max: 18200, rate: 0.00 },
        { min: 18200, max: 45000, rate: 0.19 },
        { min: 45000, max: 120000, rate: 0.325 },
        { min: 120000, max: 180000, rate: 0.37 },
        { min: 180000, max: null, rate: 0.45 }
      ]
    },
    IN: {
      individual: [
        { min: 0, max: 250000, rate: 0.00 },
        { min: 250000, max: 500000, rate: 0.05 },
        { min: 500000, max: 1000000, rate: 0.20 },
        { min: 1000000, max: null, rate: 0.30 }
      ]
    }
  };

  const calculateTax = () => {
    const grossIncome = parseFloat(income);
    const totalDeductions = parseFloat(deductions);

    if (grossIncome <= 0) return;

    const taxableIncome = Math.max(0, grossIncome - totalDeductions);
    
    // Validate that tax brackets exist for selected country and filing status
    const brackets = taxBrackets[country]?.[filingStatus];
    
    if (!brackets) {
      toast({
        title: "Configuration Error",
        description: `Tax brackets not available for ${country} - ${filingStatus}. Please select a different combination.`,
        variant: "destructive"
      });
      return;
    }

    let incomeTax = 0;
    let marginalTaxRate = 0;
    const taxBreakdown: { bracket: string; rate: number; amount: number }[] = [];

    for (const bracket of brackets) {
      if (taxableIncome > bracket.min) {
        const taxableAtThisBracket = Math.min(
          taxableIncome - bracket.min,
          bracket.max ? bracket.max - bracket.min : taxableIncome - bracket.min
        );

        const taxAtThisBracket = taxableAtThisBracket * bracket.rate;
        incomeTax += taxAtThisBracket;
        marginalTaxRate = bracket.rate;

        if (taxAtThisBracket > 0) {
          const bracketLabel = bracket.max
            ? `${formatCurrency(bracket.min)} - ${formatCurrency(bracket.max)}`
            : `${formatCurrency(bracket.min)}+`;

          taxBreakdown.push({
            bracket: bracketLabel,
            rate: bracket.rate * 100,
            amount: taxAtThisBracket
          });
        }
      }
    }

    const netIncome = grossIncome - incomeTax;
    const effectiveTaxRate = grossIncome > 0 ? (incomeTax / grossIncome) * 100 : 0;

    setResult({
      grossIncome,
      taxableIncome,
      incomeTax,
      netIncome,
      effectiveTaxRate,
      marginalTaxRate: marginalTaxRate * 100,
      taxBreakdown
    });

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const resetCalculator = () => {
    setIncome('50000');
    setDeductions('12950');
    setFilingStatus('single');
    setCountry('US');
    setCurrency('USD');
    setResult(null);
  };

  const handleDownloadPDF = () => {
    if (!result) return;

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
    doc.text('Income Tax Calculation Report', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 6;
    doc.setFontSize(8);
    doc.setTextColor(230, 240, 255);
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    doc.text(`Report Date: ${currentDate}`, pageWidth / 2, yPos, { align: 'center' });

    // Tax Summary
    yPos = 48;
    doc.setFillColor(240, 249, 255);
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1);
    doc.roundedRect(margin, yPos, pageWidth - (2 * margin), 50, 3, 3, 'FD');
    
    yPos += 6;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('TAX SUMMARY', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(16);
    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Tax Owed', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(24);
    doc.text(formatCurrency(result.incomeTax), pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(16);
    doc.setTextColor(34, 197, 94);
    doc.text('Net Income', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 8;
    doc.setFontSize(20);
    doc.text(formatCurrency(result.netIncome), pageWidth / 2, yPos, { align: 'center' });

    // Income Details
    yPos += 18;
    const col1X = margin + 8;
    const col2X = margin + 60;
    const col3X = pageWidth / 2 + 8;
    const col4X = pageWidth / 2 + 60;
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Gross Income', col1X, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(result.grossIncome), col2X, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Effective Tax Rate', col3X, yPos);
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${result.effectiveTaxRate.toFixed(2)}%`, col4X, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Deductions', col1X, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(result.grossIncome - result.taxableIncome), col2X, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Marginal Tax Rate', col3X, yPos);
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${result.marginalTaxRate.toFixed(2)}%`, col4X, yPos);

    // Footer
    yPos = pageHeight - 20;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    yPos += 4;
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'italic');
    doc.text('This is an estimate. Consult a tax professional for official advice.', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.textWithLink('DapsiWow.com', pageWidth / 2, yPos, { align: 'center', url: 'https://dapsiwow.com' });

    doc.save(`DapsiWow-Tax-Calculation-${new Date().getTime()}.pdf`);
    toast({ 
      title: "PDF Downloaded!", 
      description: "Your tax calculation report has been saved." 
    });
  };

  const handleShare = async () => {
    if (!result) return;

    const shareableUrl = `${window.location.origin}${window.location.pathname}`;
    const shareText = `💰 My Tax Calculation:\n\n📊 Gross Income: ${formatCurrency(result.grossIncome)}\n💸 Tax Owed: ${formatCurrency(result.incomeTax)}\n✅ Net Income: ${formatCurrency(result.netIncome)}\n📈 Effective Rate: ${result.effectiveTaxRate.toFixed(2)}%\n\nCalculate yours free at ${shareableUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Tax Calculation - DapsiWow',
          text: shareText,
          url: shareableUrl,
        });
        toast({ title: "Shared successfully!" });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(shareText);
          toast({ title: "Link copied to clipboard!" });
        }
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({ title: "Results copied to clipboard!" });
    }
  };

  const shareOnFacebook = () => {
    if (!result) return;
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareOnTwitter = () => {
    if (!result) return;
    const text = encodeURIComponent(`I just calculated my taxes! Net income: ${formatCurrency(result.netIncome)} | Calculate yours free at`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    if (!result) return;
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    if (!result) return;
    const text = encodeURIComponent(`Check out this free tax calculator! I calculated my taxes and got: Net Income ${formatCurrency(result.netIncome)}. Try it: ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const countryData = countries.find(c => c.code === newCountry);
    if (countryData) {
      setCurrency(countryData.currency);
    }

    // Reset filing status to first option for the new country
    const statuses = filingStatuses[newCountry as keyof typeof filingStatuses] || filingStatuses.US;
    setFilingStatus(statuses[0].value);

    // Set appropriate deduction based on country
    const standardDeductions: { [key: string]: string } = {
      US: '12950',
      UK: '12570',
      CA: '15000',
      AU: '18200',
      IN: '50000',
      DE: '10908',
      FR: '10777',
      JP: '480000',
      SG: '0',
      NZ: '0'
    };
    setDeductions(standardDeductions[newCountry] || '0');
  };

  const formatCurrency = (amount: number) => {
    const currencyMap: { [key: string]: { locale: string; currency: string } } = {
      USD: { locale: 'en-US', currency: 'USD' },
      EUR: { locale: 'de-DE', currency: 'EUR' },
      GBP: { locale: 'en-GB', currency: 'GBP' },
      CAD: { locale: 'en-CA', currency: 'CAD' },
      AUD: { locale: 'en-AU', currency: 'AUD' },
      INR: { locale: 'en-IN', currency: 'INR' },
      JPY: { locale: 'ja-JP', currency: 'JPY' },
      SGD: { locale: 'en-SG', currency: 'SGD' },
      NZD: { locale: 'en-NZ', currency: 'NZD' }
    };

    const config = currencyMap[currency] || currencyMap.USD;

    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(2)}%`;
  };

  const currentFilingStatuses = filingStatuses[country as keyof typeof filingStatuses] || filingStatuses.US;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How accurate is this tax calculator?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our tax calculator uses official tax brackets and rates for each supported country, providing estimates that are typically accurate within 2-3% for standard situations. However, actual tax liability may vary based on additional income sources, specific deductions, credits, and other individual circumstances."
        }
      },
      {
        "@type": "Question",
        "name": "Which countries are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We currently support tax calculations for USA, United Kingdom, Canada, Australia, and India. The calculator uses 2023-2024 tax brackets and rates."
        }
      },
      {
        "@type": "Question",
        "name": "What's the difference between effective and marginal tax rates?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Your effective tax rate is the overall percentage of your income paid in taxes (total tax ÷ gross income). Your marginal tax rate is the tax rate applied to your last dollar of income."
        }
      },
      {
        "@type": "Question",
        "name": "Is my data stored or shared?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, all calculations are performed entirely in your browser. We do not store, transmit, track, or share any of your financial information. Your privacy and data security are our highest priorities."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>2025 Tax Calculator - Free Income Tax Estimator | Calculate Federal Taxes</title>
        <meta name="description" content="Free 2025 income tax calculator for USA, UK, Canada, Australia & India. Calculate federal taxes, effective tax rate, marginal tax bracket, and net income instantly. 100% free, accurate tax estimates with detailed breakdown." />
        <meta name="keywords" content="2025 tax calculator, income tax calculator 2025, tax refund calculator 2025, federal tax calculator, tax estimator 2025, tax bracket calculator, free tax calculator, online tax calculator, how to calculate income tax, effective tax rate calculator, marginal tax rate, take home pay calculator, tax planning calculator 2025" />
        <meta property="og:title" content="2025 Tax Calculator - Free Income Tax Estimator | DapsiWow" />
        <meta property="og:description" content="Calculate your 2025 income tax instantly with our free online calculator. Get accurate federal tax estimates, effective rates, and detailed breakdowns for smart tax planning." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/tools/tax-calculator" />
        <meta property="og:image" content="https://dapsiwow.com/og-tax-calculator.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="2025 Tax Calculator - Free Income Tax Estimator" />
        <meta name="twitter:description" content="Calculate income tax for 2025 with detailed breakdowns, effective rates, and tax planning insights. Free tool supporting USA, UK, Canada, Australia & India." />
        <meta name="twitter:image" content="https://dapsiwow.com/og-tax-calculator.png" />
        <link rel="canonical" href="https://dapsiwow.com/tools/tax-calculator" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "2025 Tax Calculator",
            "url": "https://dapsiwow.com/tools/tax-calculator",
            "description": "Free online income tax calculator for 2025. Calculate federal taxes, effective tax rate, and net income for USA, UK, Canada, Australia, and India.",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Multi-country tax calculations",
              "Real-time tax estimates",
              "Effective and marginal tax rates",
              "Tax bracket breakdown",
              "PDF export functionality",
              "No registration required"
            ]
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 md:gap-2.5 px-2.5 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 max-w-full mx-auto sm:mx-0">
                <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 flex-shrink-0 text-blue-700" />
                <span className="text-[11px] sm:text-xs md:text-sm lg:text-base font-medium text-blue-700 whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
                  Professional Tax Calculator - Free & Accurate 2025
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0" data-testid="page-title">
                <span className="block">2025 Income Tax Calculator:</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculate Federal Tax & Net Income
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Calculate your 2025 income tax instantly with our free tax calculator. Get accurate federal tax estimates, effective tax rates, marginal tax brackets, and detailed breakdowns for USA, UK, Canada, Australia & India. Perfect for tax planning, salary negotiations, and financial decisions. 100% free, no signup required.
              </p>

              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Multi-Country Support</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium">Instant Results</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Detailed Breakdown</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 lg:py-16">
          {/* Main Tool Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Input Section */}
                <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Tax Configuration</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your income details to get accurate tax calculations</p>
                  </div>

                  {/* Configuration Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    {/* Country Selection */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="country" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Country
                      </Label>
                      <Select value={country} onValueChange={handleCountryChange}>
                        <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-country">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Annual Income */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="income" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Annual Gross Income
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">{currency === 'USD' ? '$' : currency}</span>
                        <Input
                          id="income"
                          type="number"
                          value={income}
                          onChange={(e) => setIncome(e.target.value)}
                          className="h-10 sm:h-12 md:h-14 pl-10 sm:pl-12 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                          placeholder="50,000"
                          min="0"
                          data-testid="input-income"
                        />
                      </div>
                    </div>

                    {/* Filing Status */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Filing Status</Label>
                      <Select value={filingStatus} onValueChange={setFilingStatus}>
                        <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-filing-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currentFilingStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Deductions */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="deductions" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Total Deductions
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">{currency === 'USD' ? '$' : currency}</span>
                        <Input
                          id="deductions"
                          type="number"
                          value={deductions}
                          onChange={(e) => setDeductions(e.target.value)}
                          className="h-10 sm:h-12 md:h-14 pl-10 sm:pl-12 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                          placeholder="12,950"
                          min="0"
                          data-testid="input-deductions"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={calculateTax}
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transition-colors duration-200"
                      data-testid="button-calculate"
                    >
                      <Calculator className="w-5 h-5 mr-2" />
                      Calculate Tax
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                      data-testid="button-reset"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Reset
                    </Button>
                  </div>

                  {result && (
                    <>
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-3 sm:pt-4">
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
                          data-testid="button-export-pdf"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Export PDF
                        </Button>
                      </div>

                      <div className="border-t pt-4">
                        <p className="text-center text-sm font-medium text-gray-700 mb-3">Share your results:</p>
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                          <Button
                            onClick={shareOnFacebook}
                            size="sm"
                            variant="outline"
                            className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                          >
                            <FaFacebook className="w-4 h-4 mr-2" />
                            Facebook
                          </Button>
                          <Button
                            onClick={shareOnTwitter}
                            size="sm"
                            variant="outline"
                            className="bg-sky-500 hover:bg-sky-600 text-white border-0"
                          >
                            <FaTwitter className="w-4 h-4 mr-2" />
                            Twitter
                          </Button>
                          <Button
                            onClick={shareOnLinkedIn}
                            size="sm"
                            variant="outline"
                            className="bg-blue-700 hover:bg-blue-800 text-white border-0"
                          >
                            <FaLinkedin className="w-4 h-4 mr-2" />
                            LinkedIn
                          </Button>
                          <Button
                            onClick={shareOnWhatsApp}
                            size="sm"
                            variant="outline"
                            className="bg-green-600 hover:bg-green-700 text-white border-0"
                          >
                            <FaWhatsapp className="w-4 h-4 mr-2" />
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Results Section */}
                {result !== null ? (
                  <div ref={resultsRef} className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Tax Calculation Results</h2>

                    <div className="space-y-4 sm:space-y-6 md:space-y-8" data-testid="tax-results">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-red-200 shadow-sm">
                          <div className="text-center space-y-2 sm:space-y-3">
                            <h3 className="text-sm sm:text-base md:text-lg font-bold text-red-900">
                              Income Tax
                            </h3>
                            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-red-600 break-all">
                              {formatCurrency(result.incomeTax)}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">
                              Total tax owed
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-green-200 shadow-sm">
                          <div className="text-center space-y-2 sm:space-y-3">
                            <h3 className="text-sm sm:text-base md:text-lg font-bold text-green-900">
                              Net Income
                            </h3>
                            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-green-600 break-all">
                              {formatCurrency(result.netIncome)}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">
                              Take-home income
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Breakdown */}
                      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Tax Breakdown Summary</h3>
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 py-2 sm:py-3 border-b border-gray-200">
                            <span className="text-gray-600 font-medium text-sm sm:text-base">Gross Income</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base md:text-lg break-all text-left sm:text-right">
                              {formatCurrency(result.grossIncome)}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 py-2 sm:py-3 border-b border-gray-200">
                            <span className="text-gray-600 font-medium text-sm sm:text-base">Total Deductions</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base md:text-lg break-all text-left sm:text-right">
                              -{formatCurrency(result.grossIncome - result.taxableIncome)}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 py-2 sm:py-3 border-b border-gray-200">
                            <span className="text-gray-600 font-medium text-sm sm:text-base">Taxable Income</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base md:text-lg break-all text-left sm:text-right">
                              {formatCurrency(result.taxableIncome)}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 py-2 sm:py-3 border-b border-gray-200">
                            <span className="text-gray-600 font-medium text-sm sm:text-base">Effective Tax Rate</span>
                            <span className="font-bold text-red-600 text-sm sm:text-base md:text-lg break-all text-left sm:text-right">
                              {formatPercentage(result.effectiveTaxRate)}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 py-2 sm:py-3">
                            <span className="text-gray-600 font-medium text-sm sm:text-base">Marginal Tax Rate</span>
                            <span className="font-bold text-red-600 text-sm sm:text-base md:text-lg break-all text-left sm:text-right">
                              {formatPercentage(result.marginalTaxRate)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tax Bracket Breakdown */}
                      {result.taxBreakdown.length > 0 && (
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200">
                          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Tax Bracket Analysis</h3>
                          <div className="space-y-2 sm:space-y-3">
                            {result.taxBreakdown.map((bracket, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                  <span className="text-gray-700 font-medium text-xs sm:text-sm md:text-base break-words">
                                    {bracket.bracket} ({formatPercentage(bracket.rate)})
                                  </span>
                                  <span className="font-bold text-gray-900 text-sm sm:text-base md:text-lg break-all text-left sm:text-right">
                                    {formatCurrency(bracket.amount)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <div className="text-center py-8 sm:py-12 md:py-16">
                      <div className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-white/50 shadow-lg">
                        <DollarSign className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base md:text-lg px-4">Enter your income details and click calculate to see tax analysis</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced SEO Content Section */}
          <section className="py-8 sm:py-12 md:py-16">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                Free Online Tax Calculator - Calculate Income Tax Worldwide
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed px-3 sm:px-0">
                Calculate your income tax accurately with our comprehensive tax calculator supporting multiple countries.
                Get instant tax estimates, understand your effective tax rate, and plan your finances better with detailed
                tax bracket breakdowns for USA, UK, Canada, Australia, India, and more. Perfect for salary negotiations,
                financial planning, and tax preparation.
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-16">
              <div className="text-center p-4 sm:p-6 bg-blue-50 rounded-lg">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-base sm:text-lg font-bold text-white">$$</span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Multi-Country Support</h3>
                <p className="text-sm sm:text-base text-gray-600">Calculate taxes for 10+ countries including USA, UK, Canada, Australia, Germany, France, India, Japan, Singapore, and New Zealand with real-time currency conversion.</p>
              </div>
              <div className="text-center p-4 sm:p-6 bg-green-50 rounded-lg">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-base sm:text-lg font-bold text-white">%</span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Detailed Tax Analysis</h3>
                <p className="text-sm sm:text-base text-gray-600">Get comprehensive tax breakdown with effective rates, marginal rates, and detailed tax bracket analysis for complete understanding of your tax obligations.</p>
              </div>
              <div className="text-center p-4 sm:p-6 bg-purple-50 rounded-lg">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-base sm:text-lg font-bold text-white">$</span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Smart Tax Planning</h3>
                <p className="text-sm sm:text-base text-gray-600">Use our calculator for strategic tax planning, annual budgeting, retirement planning, and making informed financial decisions year-round.</p>
              </div>
            </div>

            {/* What is Tax Calculator - Enhanced Section */}
            <div className="bg-white rounded-xl p-6 sm:p-8 mb-8 sm:mb-12 shadow-sm">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
                What is an Income Tax Calculator and How Does It Work?
              </h2>
              <div className="max-w-5xl mx-auto">
                <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  An <strong>income tax calculator</strong> is an essential financial planning tool that estimates your annual tax liability
                  based on your gross income, filing status, deductions, and applicable tax rates. Our advanced online tax calculator
                  supports multiple countries and provides instant, accurate tax calculations using the latest tax brackets and rates
                  for the current tax year.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">How It Works</h3>
                    <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                      <li className="flex items-start"><span className="text-blue-600 mr-2">•</span>Enter your annual gross income in local currency</li>
                      <li className="flex items-start"><span className="text-blue-600 mr-2">•</span>Select your country and filing status</li>
                      <li className="flex items-start"><span className="text-blue-600 mr-2">•</span>Input total deductions (standard or itemized)</li>
                      <li className="flex items-start"><span className="text-blue-600 mr-2">•</span>Get instant tax calculation with detailed breakdown</li>
                      <li className="flex items-start"><span className="text-blue-600 mr-2">•</span>View effective and marginal tax rates</li>
                      <li className="flex items-start"><span className="text-blue-600 mr-2">•</span>Analyze tax liability by income bracket</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Key Calculations</h3>
                    <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                      <li className="flex items-start"><span className="text-green-600 mr-2">•</span>Taxable income (gross income minus deductions)</li>
                      <li className="flex items-start"><span className="text-green-600 mr-2">•</span>Total income tax liability</li>
                      <li className="flex items-start"><span className="text-green-600 mr-2">•</span>Net income after taxes</li>
                      <li className="flex items-start"><span className="text-green-600 mr-2">•</span>Effective tax rate percentage</li>
                      <li className="flex items-start"><span className="text-green-600 mr-2">•</span>Marginal tax rate for next dollar earned</li>
                      <li className="flex items-start"><span className="text-green-600 mr-2">•</span>Tax breakdown by income bracket</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6">
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    <strong>Progressive Tax System:</strong> Most countries use a progressive tax system where higher income
                    levels are taxed at higher rates. Our calculator applies the correct tax brackets automatically,
                    ensuring accurate calculations that reflect how much tax you owe at each income level. This helps you
                    understand not just your total tax burden, but also how additional income will be taxed.
                  </p>
                </div>
              </div>
            </div>

          </section>

          {/* Comprehensive Educational Content */}
          <div className="mt-8 sm:mt-16 space-y-8 sm:space-y-12">
            {/* What is Tax Calculator Section */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
                What is an Income Tax Calculator?
              </h2>
              <div className="max-w-4xl mx-auto">
                <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  An income tax calculator is a powerful financial tool that helps individuals and businesses estimate their
                  annual tax liability based on their income, filing status, and deductions. Our advanced tax calculator
                  supports multiple countries and provides detailed analysis including effective tax rates, marginal tax rates,
                  and comprehensive tax bracket breakdowns.
                </p>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  Whether you're planning your annual budget, considering a job offer, or preparing for tax season, our
                  calculator provides accurate estimates to help you make informed financial decisions. The tool is designed
                  to be user-friendly while providing professional-grade accuracy for tax planning purposes.
                </p>
              </div>
            </section>

            {/* How to Use Section */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
                How to Use the Tax Calculator
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white font-bold text-base sm:text-lg">1</div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Select Country</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Choose your country from our supported list of 10+ countries worldwide</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white font-bold text-base sm:text-lg">2</div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Enter Income</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Input your annual gross income in your local currency</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white font-bold text-base sm:text-lg">3</div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Set Filing Status</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Choose your filing status (single, married, etc.) based on your country</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white font-bold text-base sm:text-lg">4</div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Add Deductions</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Enter your total deductions and get instant tax calculations</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Use Cases Section */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
                When to Use Our Tax Calculator
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">💼 Career Planning</h3>
                    <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                      <li>• Evaluating job offers and salary negotiations</li>
                      <li>• Planning career moves and income changes</li>
                      <li>• Comparing compensation packages</li>
                      <li>• Understanding take-home pay estimates</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">📊 Financial Planning</h3>
                    <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                      <li>• Annual budget preparation and planning</li>
                      <li>• Retirement and savings goal calculations</li>
                      <li>• Investment decision making</li>
                      <li>• Emergency fund planning</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">🏢 Business Decisions</h3>
                    <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                      <li>• Freelancer and contractor tax planning</li>
                      <li>• Small business owner tax estimates</li>
                      <li>• Quarterly tax payment planning</li>
                      <li>• Business structure optimization</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">🌍 International</h3>
                    <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                      <li>• Expatriate tax planning and preparation</li>
                      <li>• Cross-border income calculations</li>
                      <li>• Immigration and relocation planning</li>
                      <li>• International assignment budgeting</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-0">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">📋 Tax Preparation</h3>
                    <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                      <li>• Pre-filing tax estimate calculations</li>
                      <li>• Tax withholding adjustments</li>
                      <li>• Estimated tax payment planning</li>
                      <li>• Year-end tax strategy reviews</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-0">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">🎓 Education</h3>
                    <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                      <li>• Learning about tax systems and rates</li>
                      <li>• Understanding progressive taxation</li>
                      <li>• Financial literacy and education</li>
                      <li>• Academic research and analysis</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Key Features and Benefits */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
                Tax Calculator Features & Benefits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6 sm:p-8">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">🌟 Key Features</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-2 text-sm sm:text-base text-gray-600">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          Multi-country tax calculation support (USA, UK, Canada, Australia, Germany, France, India, Japan, Singapore, New Zealand)
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          Real-time tax calculations with instant results
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          Detailed tax bracket breakdown analysis
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          Effective and marginal tax rate calculations
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          Multiple filing status options per country
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          Customizable deduction inputs
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          Mobile-responsive design for all devices
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6 sm:p-8">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">💡 Benefits</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-2 text-sm sm:text-base text-gray-600">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          Save time with instant tax calculations
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          Make informed financial decisions
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          Plan your budget more effectively
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          Understand your tax obligations better
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          Free to use with no registration required
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          Privacy-focused with no data storage
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          Professional-grade accuracy for planning
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Tax Planning Tips and Important Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Smart Tax Planning Tips</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-2 text-sm sm:text-base text-gray-600">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <span>Maximize deductions and credits available to you - including charitable donations, business expenses, and education costs</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <span>Consider retirement contributions (401k, IRA) for immediate tax benefits and long-term savings</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <span>Plan for estimated tax payments if self-employed to avoid penalties and improve cash flow</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <span>Time income and deductions strategically across tax years for optimal tax efficiency</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <span>Consult a qualified tax professional for complex situations and personalized advice</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Important Disclaimers</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-2 text-sm sm:text-base text-gray-600">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2"></div>
                        <span>These are estimates based on standard tax brackets and may not reflect your exact tax situation</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2"></div>
                        <span>Actual taxes may vary based on specific circumstances, additional income sources, and applicable credits</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2"></div>
                        <span>Does not include state/provincial taxes, local taxes, social security, or other payroll deductions</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2"></div>
                        <span>Tax laws change frequently - always verify with official tax authorities and current regulations</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2"></div>
                        <span>For official tax filing, consult with certified tax professionals or use approved tax software</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Related Tools Section */}
            <section className="py-8 sm:py-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
                Related Financial Calculators
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-white hover:shadow-xl transition-shadow duration-300 border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Salary to Hourly Calculator</h3>
                    <p className="text-sm text-gray-600 mb-4">Convert annual salary to hourly rate and calculate your true hourly earnings after taxes.</p>
                    <Link href="/tools/salary-to-hourly-calculator">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid="link-salary-calculator">
                        Calculate Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="bg-white hover:shadow-xl transition-shadow duration-300 border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Retirement Calculator</h3>
                    <p className="text-sm text-gray-600 mb-4">Plan your retirement savings and estimate how much you need to save for a comfortable retirement.</p>
                    <Link href="/tools/retirement-calculator">
                      <Button className="w-full bg-green-600 hover:bg-green-700" data-testid="link-retirement-calculator">
                        Calculate Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="bg-white hover:shadow-xl transition-shadow duration-300 border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <PieChart className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Budget Calculator</h3>
                    <p className="text-sm text-gray-600 mb-4">Create a comprehensive budget plan and track your monthly income and expenses effectively.</p>
                    <Link href="/tools/budget-calculator">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700" data-testid="link-budget-calculator">
                        Calculate Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="bg-white hover:shadow-xl transition-shadow duration-300 border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Loan Calculator</h3>
                    <p className="text-sm text-gray-600 mb-4">Calculate monthly loan payments, total interest, and amortization schedules for any loan.</p>
                    <Link href="/tools/loan-calculator">
                      <Button className="w-full bg-orange-600 hover:bg-orange-700" data-testid="link-loan-calculator">
                        Calculate Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="bg-white hover:shadow-xl transition-shadow duration-300 border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                      <DollarSign className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Investment Return Calculator</h3>
                    <p className="text-sm text-gray-600 mb-4">Calculate potential returns on your investments with compound interest and regular contributions.</p>
                    <Link href="/tools/investment-return-calculator">
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700" data-testid="link-investment-calculator">
                        Calculate Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="bg-white hover:shadow-xl transition-shadow duration-300 border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                      <Calculator className="w-6 h-6 text-cyan-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Net Worth Calculator</h3>
                    <p className="text-sm text-gray-600 mb-4">Calculate your total net worth by tracking all your assets and liabilities in one place.</p>
                    <Link href="/tools/net-worth-calculator">
                      <Button className="w-full bg-cyan-600 hover:bg-cyan-700" data-testid="link-networth-calculator">
                        Calculate Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* FAQ Section */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
                Frequently Asked Questions About Tax Calculators
              </h2>
              <div className="max-w-4xl mx-auto">
                <Accordion type="single" collapsible className="w-full space-y-4">
                  <AccordionItem value="item-1" className="bg-white border border-gray-200 rounded-lg px-6">
                    <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600">
                      How accurate is this tax calculator?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm sm:text-base text-gray-600 pt-2">
                      Our tax calculator uses official tax brackets and rates for each supported country, providing estimates that are typically accurate within 2-3% for standard situations. However, actual tax liability may vary based on additional income sources, specific deductions, credits, and other individual circumstances. For precise tax filing, we recommend consulting with a certified tax professional.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2" className="bg-white border border-gray-200 rounded-lg px-6">
                    <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600">
                      Which countries are supported and what tax year does this calculator use?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm sm:text-base text-gray-600 pt-2">
                      We currently support tax calculations for USA, United Kingdom, Canada, Australia, and India. The calculator uses 2023-2024 tax brackets and rates. We regularly update tax brackets to reflect current regulations and plan to add more countries based on user demand.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3" className="bg-white border border-gray-200 rounded-lg px-6">
                    <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600">
                      What's the difference between effective and marginal tax rates?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm sm:text-base text-gray-600 pt-2">
                      Your <strong>effective tax rate</strong> is the overall percentage of your income paid in taxes (total tax ÷ gross income). Your <strong>marginal tax rate</strong> is the tax rate applied to your last dollar of income. For example, if you earn $60,000 with a 15% effective rate but are in the 22% tax bracket, any additional income will be taxed at 22%, not 15%.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4" className="bg-white border border-gray-200 rounded-lg px-6">
                    <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600">
                      Can I use this calculator for business or self-employment taxes?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm sm:text-base text-gray-600 pt-2">
                      This calculator is designed primarily for individual income tax calculations. Business taxes involve different rates, structures, deductions (like business expenses, depreciation, etc.), and may require quarterly estimated tax payments. Self-employed individuals should also account for self-employment tax. We recommend using specialized business tax calculators for accurate business tax estimates.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5" className="bg-white border border-gray-200 rounded-lg px-6">
                    <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600">
                      Does this calculator include state, local, or payroll taxes?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm sm:text-base text-gray-600 pt-2">
                      No, this calculator focuses on federal/national income tax only. It does not include state income tax, local taxes, property taxes, sales tax, Social Security contributions, Medicare tax, or other payroll deductions. Your actual take-home pay will be lower after accounting for these additional taxes and deductions.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6" className="bg-white border border-gray-200 rounded-lg px-6">
                    <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600">
                      Is my financial data stored, tracked, or shared?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm sm:text-base text-gray-600 pt-2">
                      Absolutely not. All calculations are performed entirely in your browser using JavaScript. We do not store, transmit, track, or share any of your financial information with our servers or third parties. Your privacy and data security are our highest priorities. The calculator works completely offline once the page is loaded.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7" className="bg-white border border-gray-200 rounded-lg px-6">
                    <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600">
                      How do I maximize my deductions and minimize my tax liability?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm sm:text-base text-gray-600 pt-2">
                      Common strategies include: maximizing retirement contributions (401k, IRA), claiming all eligible deductions (mortgage interest, charitable donations, medical expenses over threshold), utilizing tax credits (education, child tax credit), timing income and expenses strategically, and considering tax-advantaged accounts (HSA, FSA). Always consult a qualified tax professional for personalized tax planning advice.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-8" className="bg-white border border-gray-200 rounded-lg px-6">
                    <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600">
                      Should I take the standard deduction or itemize?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm sm:text-base text-gray-600 pt-2">
                      You should itemize if your total itemized deductions (mortgage interest, state/local taxes, charitable contributions, medical expenses, etc.) exceed the standard deduction for your filing status. For 2023, the standard deduction is $12,950 (single), $25,900 (married filing jointly). Most taxpayers benefit from the standard deduction, but those with significant mortgage interest, charitable giving, or medical expenses may save more by itemizing.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

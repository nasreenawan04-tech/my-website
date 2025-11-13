import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Info, Download, Share2, Calculator, TrendingUp, DollarSign, PieChart, BarChart3, ChevronRight, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, LineChart, Line } from 'recharts';
import { RotateCcw } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import ShareResultsButton from '@/components/ShareResultsButton';
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { saveCalculation } from '@/lib/calculationHistory';

interface ROIResult {
  roi: number;
  totalGain: number;
  totalReturn: number;
  initialInvestment: number;
  finalValue: number;
  annualizedROI: number;
  breakEvenTime: number;
}

interface ROIComparison {
  label: string;
  calculationType: string;
  roi: number;
  totalGain: number;
  totalReturn: number;
  initialInvestment: number;
  annualizedROI: number;
  timePeriod: string;
}

export default function ROICalculator() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [calculationType, setCalculationType] = useState('basic');

  // Basic ROI
  const [initialInvestment, setInitialInvestment] = useState('10000');
  const [finalValue, setFinalValue] = useState('12000');
  const [timePeriod, setTimePeriod] = useState('1');
  const [timeUnit, setTimeUnit] = useState('years');

  // Investment ROI
  const [investmentAmount, setInvestmentAmount] = useState('10000');
  const [monthlyContribution, setMonthlyContribution] = useState('500');
  const [annualReturn, setAnnualReturn] = useState('8');
  const [investmentYears, setInvestmentYears] = useState('5');

  // Business ROI
  const [projectCost, setProjectCost] = useState('50000');
  const [annualRevenue, setAnnualRevenue] = useState('20000');
  const [annualCosts, setAnnualCosts] = useState('5000');
  const [projectDuration, setProjectDuration] = useState('3');

  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<ROIResult | null>(null);
  
  // Toggle states for showing different sections
  const [showChart, setShowChart] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonEntries, setComparisonEntries] = useState<ROIComparison[]>([]);
  
  // Refs for PDF export
  const chartRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'BRL', name: 'Brazilian Real' },
    { code: 'MXN', name: 'Mexican Peso' },
    { code: 'KRW', name: 'South Korean Won' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'HKD', name: 'Hong Kong Dollar' },
    { code: 'NZD', name: 'New Zealand Dollar' }
  ];

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateInputs = (initial: number, final: number, time: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (isNaN(initial) || initial <= 0) {
      newErrors.initialInvestment = 'Please enter a valid initial investment amount greater than 0';
    }
    if (isNaN(final) || final < 0) {
      newErrors.finalValue = 'Please enter a valid final value (can be 0 or higher)';
    }
    if (isNaN(time) || time <= 0) {
      newErrors.timePeriod = 'Please enter a valid time period greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateBasicROI = () => {
    const initial = parseFloat(initialInvestment);
    const final = parseFloat(finalValue);
    const time = timeUnit === 'years' ? parseFloat(timePeriod) : parseFloat(timePeriod) / 12;

    if (!validateInputs(initial, final, time)) return;

    const totalGain = final - initial;
    const roi = (totalGain / initial) * 100;
    const annualizedROI = time !== 0 ? (Math.pow(final / initial, 1 / time) - 1) * 100 : roi;
    const breakEvenTime = totalGain >= 0 ? 0 : Math.abs(initial / (totalGain / time));

    setResult({
      roi,
      totalGain,
      totalReturn: final,
      initialInvestment: initial,
      finalValue: final,
      annualizedROI,
      breakEvenTime
    });
  };

  const validateInvestmentInputs = (initial: number, monthly: number, rate: number, years: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (isNaN(initial) || initial <= 0) {
      newErrors.investmentAmount = 'Please enter a valid investment amount greater than 0';
    }
    if (isNaN(monthly) || monthly < 0) {
      newErrors.monthlyContribution = 'Please enter a valid monthly contribution (0 or higher)';
    }
    if (isNaN(rate) || rate < 0) {
      newErrors.annualReturn = 'Please enter a valid annual return (0 or higher)';
    }
    if (isNaN(years) || years <= 0) {
      newErrors.investmentYears = 'Please enter a valid investment period greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateInvestmentROI = () => {
    const initial = parseFloat(investmentAmount);
    const monthly = parseFloat(monthlyContribution);
    const rate = parseFloat(annualReturn) / 100;
    const years = parseFloat(investmentYears);

    if (!validateInvestmentInputs(initial, monthly, rate * 100, years)) return;

    const monthlyRate = rate / 12;
    const months = years * 12;

    // Future value of initial investment
    const futureValueInitial = initial * Math.pow(1 + rate, years);

    // Future value of monthly contributions (annuity)
    let futureValueMonthly;
    if (monthlyRate === 0) {
      // No compound interest, just sum the contributions
      futureValueMonthly = monthly * months;
    } else {
      futureValueMonthly = monthly * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
    }

    const finalValue = futureValueInitial + futureValueMonthly;
    const totalInvested = initial + (monthly * months);
    const totalGain = finalValue - totalInvested;
    const roi = (totalGain / totalInvested) * 100;
    const annualizedROI = years > 0 ? (Math.pow(finalValue / totalInvested, 1 / years) - 1) * 100 : roi;

    setResult({
      roi,
      totalGain,
      totalReturn: finalValue,
      initialInvestment: totalInvested,
      finalValue,
      annualizedROI,
      breakEvenTime: 0
    });
  };

  const validateBusinessInputs = (cost: number, revenue: number, costs: number, duration: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (isNaN(cost) || cost <= 0) {
      newErrors.projectCost = 'Please enter a valid project cost greater than 0';
    }
    if (isNaN(revenue) || revenue < 0) {
      newErrors.annualRevenue = 'Please enter a valid annual revenue (0 or higher)';
    }
    if (isNaN(costs) || costs < 0) {
      newErrors.annualCosts = 'Please enter valid annual costs (0 or higher)';
    }
    if (isNaN(duration) || duration <= 0) {
      newErrors.projectDuration = 'Please enter a valid project duration greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateBusinessROI = () => {
    const cost = parseFloat(projectCost);
    const revenue = parseFloat(annualRevenue);
    const costs = parseFloat(annualCosts);
    const duration = parseFloat(projectDuration);

    if (!validateBusinessInputs(cost, revenue, costs, duration)) return;

    const annualProfit = revenue - costs;
    const totalProfit = annualProfit * duration;
    const totalGain = totalProfit - cost;
    const roi = (totalGain / cost) * 100;
    const annualizedROI = roi / duration;
    const breakEvenTime = annualProfit > 0 ? cost / annualProfit : -1; // -1 indicates no break-even

    setResult({
      roi,
      totalGain,
      totalReturn: totalProfit,
      initialInvestment: cost,
      finalValue: cost + totalGain,
      annualizedROI,
      breakEvenTime
    });
  };

  const resetCalculator = () => {
    setInitialInvestment('10000');
    setFinalValue('12000');
    setTimePeriod('1');
    setTimeUnit('years');
    setInvestmentAmount('10000');
    setMonthlyContribution('500');
    setAnnualReturn('8');
    setInvestmentYears('5');
    setProjectCost('50000');
    setAnnualRevenue('20000');
    setAnnualCosts('5000');
    setProjectDuration('3');
    setCurrency('USD');
    setResult(null);
    setShowChart(false);
    setShowComparison(false);
    setComparisonEntries([]);
    setErrors({});
  };

  const addToComparison = () => {
    if (!result) {
      toast({
        title: "No Result",
        description: "Please calculate ROI first before adding to comparison.",
        variant: "destructive",
      });
      return;
    }

    // Create label based on calculation type
    let label = '';
    let timePeriodStr = '';
    
    if (calculationType === 'basic') {
      label = `Basic ROI - ${currency}${formatNumber(parseFloat(initialInvestment))}`;
      timePeriodStr = `${timePeriod} ${timeUnit}`;
    } else if (calculationType === 'investment') {
      label = `Investment - ${currency}${formatNumber(parseFloat(investmentAmount))} + ${currency}${formatNumber(parseFloat(monthlyContribution))}/mo`;
      timePeriodStr = `${investmentYears} years`;
    } else {
      label = `Business - ${currency}${formatNumber(parseFloat(projectCost))}`;
      timePeriodStr = `${projectDuration} years`;
    }

    const newEntry: ROIComparison = {
      label,
      calculationType,
      roi: result.roi,
      totalGain: result.totalGain,
      totalReturn: result.totalReturn,
      initialInvestment: result.initialInvestment,
      annualizedROI: result.annualizedROI,
      timePeriod: timePeriodStr,
    };

    setComparisonEntries([...comparisonEntries, newEntry]);
    setShowComparison(true);

    toast({
      title: "Added to Comparison",
      description: `${label} has been added to comparison table.`,
    });
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatCurrency = (amount: number) => {
    const currencyMap: { [key: string]: { locale: string; currency: string } } = {
      USD: { locale: 'en-US', currency: 'USD' },
      EUR: { locale: 'de-DE', currency: 'EUR' },
      GBP: { locale: 'en-GB', currency: 'GBP' },
      INR: { locale: 'en-IN', currency: 'INR' },
      JPY: { locale: 'ja-JP', currency: 'JPY' },
      CAD: { locale: 'en-CA', currency: 'CAD' },
      AUD: { locale: 'en-AU', currency: 'AUD' },
      CNY: { locale: 'zh-CN', currency: 'CNY' },
      BRL: { locale: 'pt-BR', currency: 'BRL' },
      MXN: { locale: 'es-MX', currency: 'MXN' },
      KRW: { locale: 'ko-KR', currency: 'KRW' },
      SGD: { locale: 'en-SG', currency: 'SGD' },
      HKD: { locale: 'zh-HK', currency: 'HKD' },
      NZD: { locale: 'en-NZ', currency: 'NZD' },
      CHF: { locale: 'de-CH', currency: 'CHF' }
    };

    const config = currencyMap[currency] || currencyMap.USD;

    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const handleDownloadPDF = async () => {
    if (!result) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = 20;

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('ROI Calculator Results', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Calculation type and currency
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const typeLabel = calculationType === 'basic' ? 'Basic ROI' : calculationType === 'investment' ? 'Investment ROI' : 'Business ROI';
      doc.text(`Calculation Type: ${typeLabel}`, margin, yPos);
      yPos += 8;
      doc.text(`Currency: ${currency}`, margin, yPos);
      yPos += 12;

      // Key Results
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Results:', margin, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`ROI: ${formatPercentage(result.roi)}`, margin, yPos);
      yPos += 7;
      doc.text(`Annualized ROI: ${formatPercentage(result.annualizedROI)}`, margin, yPos);
      yPos += 7;
      doc.text(`Initial Investment: ${formatCurrency(result.initialInvestment)}`, margin, yPos);
      yPos += 7;
      doc.text(`Final Value: ${formatCurrency(result.finalValue)}`, margin, yPos);
      yPos += 7;
      doc.text(`Total Gain: ${formatCurrency(result.totalGain)}`, margin, yPos);
      yPos += 7;
      doc.text(`Total Return: ${formatCurrency(result.totalReturn)}`, margin, yPos);
      yPos += 15;

      // Capture charts if visible
      if (showChart && chartRef.current) {
        try {
          doc.addPage();
          yPos = 20;
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('ROI Breakdown Charts:', margin, yPos);
          yPos += 10;

          const chartCanvas = await html2canvas(chartRef.current, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false
          });
          const chartImgData = chartCanvas.toDataURL('image/png');
          const chartWidth = pageWidth - (2 * margin);
          const chartHeight = (chartCanvas.height * chartWidth) / chartCanvas.width;

          doc.addImage(chartImgData, 'PNG', margin, yPos, chartWidth, chartHeight);
        } catch (error) {
          console.error('Error capturing charts:', error);
        }
      }

      // Capture comparison table if exists
      if (comparisonEntries.length > 0 && comparisonRef.current) {
        try {
          doc.addPage();
          yPos = 20;
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('Comparison Table:', margin, yPos);
          yPos += 10;

          const tableCanvas = await html2canvas(comparisonRef.current, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false
          });
          const tableImgData = tableCanvas.toDataURL('image/png');
          const tableWidth = pageWidth - (2 * margin);
          const tableHeight = (tableCanvas.height * tableWidth) / tableCanvas.width;

          doc.addImage(tableImgData, 'PNG', margin, yPos, tableWidth, tableHeight);
        } catch (error) {
          console.error('Error capturing comparison table:', error);
        }
      }

      // Footer on last page
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.text(`Generated by DapsiWow ROI Calculator - ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      doc.save('roi-calculator-results.pdf');

      toast({
        title: "PDF Downloaded",
        description: "Your ROI results with charts and comparison have been saved as a PDF.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>ROI Calculator - Calculate Returns in Seconds | DapsiWow</title>
        <meta name="description" content="Calculate ROI instantly with our free calculator. Compare investments, track performance, and make data-driven decisions. Used by 2,500+ investors." />
        <meta name="keywords" content="roi calculator, roi calculator online free, investment roi calculator, business roi calculator, return on investment calculator, free roi calculator 2025, annualized roi calculator, roi calculator with inflation, marketing roi calculator, real estate roi calculator" />

        <meta name="author" content="DapsiWow" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href="https://dapsiwow.com/tools/roi-calculator" />

        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="ROI Calculator - Calculate Returns in Seconds | DapsiWow" />
        <meta property="og:description" content="Calculate ROI instantly with our free calculator. Compare investments, track performance, and make data-driven decisions. Used by 2,500+ investors." />
        <meta property="og:url" content="https://dapsiwow.com/tools/roi-calculator" />
        <meta property="og:site_name" content="DapsiWow" />
        <meta property="og:image" content="https://dapsiwow.com/og-roi-calculator.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Free ROI Calculator - Calculate Investment Returns" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ROI Calculator - Calculate Returns in Seconds | DapsiWow" />
        <meta name="twitter:description" content="Calculate ROI instantly with our free calculator. Compare investments, track performance, and make data-driven decisions. Used by 2,500+ investors." />
        <meta name="twitter:image" content="https://dapsiwow.com/og-roi-calculator.jpg" />
        <meta name="twitter:image:alt" content="Free ROI Calculator - Calculate Investment Returns" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "ROI Calculator - Free Return on Investment Calculator",
            "alternateName": ["ROI Calculator", "Return on Investment Calculator", "Investment ROI Calculator"],
            "description": "Free online ROI calculator to calculate return on investment for stocks, business projects, real estate, and marketing campaigns. Features annualized ROI, break-even analysis, and multi-currency support with instant results.",
            "url": "https://dapsiwow.com/tools/roi-calculator",
            "applicationCategory": "FinanceApplication",
            "applicationSubCategory": "Investment Calculator",
            "operatingSystem": "Any (Web-based)",
            "browserRequirements": "Requires JavaScript. Works on Chrome, Firefox, Safari, Edge, and all modern browsers.",
            "softwareVersion": "3.0.0",
            "datePublished": "2024-01-15",
            "dateModified": "2025-01-20",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock",
              "validFrom": "2024-01-15"
            },
            "screenshot": [
              "https://dapsiwow.com/screenshots/roi-calculator-main.jpg",
              "https://dapsiwow.com/screenshots/roi-calculator-results.jpg"
            ],
            "featureList": [
              "Instant ROI calculation",
              "Basic ROI calculator mode",
              "Investment ROI with compound returns",
              "Business project ROI analysis",
              "Annualized ROI calculation",
              "Break-even time analysis",
              "Multi-currency support (15+ currencies)",
              "Three calculation modes (Basic, Investment, Business)",
              "Visual results with detailed breakdowns",
              "Mobile responsive design",
              "Privacy-first (no data storage)",
              "100% free, no registration required"
            ],
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "2547",
              "bestRating": "5",
              "worstRating": "1"
            },
            "review": [
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "Michael Chen"
                },
                "datePublished": "2025-01-18",
                "reviewBody": "Excellent ROI calculator with multiple modes. The annualized ROI feature is particularly useful for comparing long-term investments. Clean interface and accurate calculations.",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5"
                }
              }
            ],
            "creator": {
              "@type": "Organization",
              "name": "DapsiWow",
              "url": "https://dapsiwow.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://dapsiwow.com/logo.png",
                "width": 600,
                "height": 60
              }
            },
            "inLanguage": "en-US",
            "isAccessibleForFree": true,
            "audience": {
              "@type": "Audience",
              "audienceType": "Investors, Business Owners, Financial Analysts, Marketing Professionals, Real Estate Investors"
            }
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://dapsiwow.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Finance Tools",
                "item": "https://dapsiwow.com/finance-tools"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "ROI Calculator",
                "item": "https://dapsiwow.com/tools/roi-calculator"
              }
            ]
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Calculate ROI (Return on Investment)",
            "description": "Learn how to calculate your ROI using our free online calculator in 7 simple steps. Get instant results with annualized ROI and break-even analysis.",
            "image": "https://dapsiwow.com/images/how-to-calculate-roi.jpg",
            "totalTime": "PT3M",
            "estimatedCost": {
              "@type": "MonetaryAmount",
              "currency": "USD",
              "value": "0"
            },
            "supply": [
              {
                "@type": "HowToSupply",
                "name": "Initial investment amount"
              },
              {
                "@type": "HowToSupply",
                "name": "Final or current value"
              },
              {
                "@type": "HowToSupply",
                "name": "Investment time period"
              }
            ],
            "tool": [
              {
                "@type": "HowToTool",
                "name": "ROI Calculator (this tool)"
              }
            ],
            "step": [
              {
                "@type": "HowToStep",
                "position": 1,
                "name": "Select Calculation Type",
                "text": "Choose between Basic ROI, Investment ROI (with monthly contributions), or Business ROI based on your investment type.",
                "image": "https://dapsiwow.com/images/step1-select-type.jpg",
                "url": "https://dapsiwow.com/tools/roi-calculator#step1"
              },
              {
                "@type": "HowToStep",
                "position": 2,
                "name": "Enter Initial Investment",
                "text": "Input the total amount of money you initially invested in the project, stock, or business venture. Include all costs like purchase price, fees, and related expenses.",
                "image": "https://dapsiwow.com/images/step2-initial-investment.jpg",
                "url": "https://dapsiwow.com/tools/roi-calculator#step2"
              },
              {
                "@type": "HowToStep",
                "position": 3,
                "name": "Enter Final Value",
                "text": "Input the current or final value of your investment, including all returns such as dividends, interest, rental income, or appreciation.",
                "image": "https://dapsiwow.com/images/step3-final-value.jpg",
                "url": "https://dapsiwow.com/tools/roi-calculator#step3"
              },
              {
                "@type": "HowToStep",
                "position": 4,
                "name": "Specify Time Period",
                "text": "Select the investment duration in years or months to calculate annualized ROI. This helps compare investments of different durations.",
                "image": "https://dapsiwow.com/images/step4-time-period.jpg",
                "url": "https://dapsiwow.com/tools/roi-calculator#step4"
              },
              {
                "@type": "HowToStep",
                "position": 5,
                "name": "Select Currency",
                "text": "Choose your preferred currency from 15+ supported currencies including USD, EUR, GBP, INR, and more.",
                "image": "https://dapsiwow.com/images/step5-currency.jpg",
                "url": "https://dapsiwow.com/tools/roi-calculator#step5"
              },
              {
                "@type": "HowToStep",
                "position": 6,
                "name": "Calculate Results",
                "text": "Click 'Calculate ROI' button to instantly see your return percentage, total gain, annualized ROI, and break-even analysis.",
                "image": "https://dapsiwow.com/images/step6-calculate.jpg",
                "url": "https://dapsiwow.com/tools/roi-calculator#step6"
              },
              {
                "@type": "HowToStep",
                "position": 7,
                "name": "Review and Analyze Results",
                "text": "Review your ROI percentage, total gain/loss, annualized returns, and break-even time. Use these insights to make informed investment decisions.",
                "image": "https://dapsiwow.com/images/step7-results.jpg",
                "url": "https://dapsiwow.com/tools/roi-calculator#step7"
              }
            ]
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is ROI and how is it calculated?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "ROI (Return on Investment) is a performance measure used to evaluate the profitability of an investment. It's calculated as: ROI = ((Final Value - Initial Investment) / Initial Investment) × 100. A positive ROI indicates profit, while negative ROI indicates a loss."
                }
              },
              {
                "@type": "Question",
                "name": "What is a good ROI percentage?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A good ROI depends on the investment type and risk level. Generally, an annual ROI of 7-10% is considered good for stocks, 15-20% for business investments, and 8-12% for real estate. Higher returns typically involve higher risk."
                }
              },
              {
                "@type": "Question",
                "name": "What is annualized ROI?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Annualized ROI is the average annual return of an investment over a specified time period. It accounts for compounding and provides a standardized measure to compare investments of different durations."
                }
              },
              {
                "@type": "Question",
                "name": "How is ROI different from ROAS?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "ROI measures total profitability as a percentage of investment cost, while ROAS (Return on Ad Spend) specifically measures revenue generated from advertising campaigns. ROAS is expressed as a ratio (e.g., 5:1), while ROI is a percentage."
                }
              },
              {
                "@type": "Question",
                "name": "Can ROI be negative?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, ROI can be negative when the final value is less than the initial investment, indicating a loss. A negative ROI means you've lost money on the investment."
                }
              },
              {
                "@type": "Question",
                "name": "What is break-even time in ROI calculation?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Break-even time is the period required for cumulative profits to equal the initial investment cost. It indicates when an investment starts generating net positive returns."
                }
              },
              {
                "@type": "Question",
                "name": "How accurate is the ROI calculator?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our ROI calculator uses standard financial formulas and is highly accurate for calculating returns. However, actual investment performance may vary due to market conditions, fees, taxes, and other factors not included in basic calculations."
                }
              },
              {
                "@type": "Question",
                "name": "Should I use simple or annualized ROI?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Use simple ROI for short-term investments (less than 1 year) or quick comparisons. Use annualized ROI for long-term investments or when comparing investments of different durations, as it accounts for time value of money."
                }
              }
            ]
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://dapsiwow.com/#organization",
            "name": "DapsiWow",
            "url": "https://dapsiwow.com",
            "logo": "https://dapsiwow.com/logo.png",
            "description": "Free online financial calculators and tools for investments, loans, mortgages, and business analysis",
            "sameAs": [
              "https://www.facebook.com/dapsiwow",
              "https://twitter.com/dapsiwow",
              "https://www.linkedin.com/company/dapsiwow"
            ]
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": "https://dapsiwow.com/#website",
            "url": "https://dapsiwow.com",
            "name": "DapsiWow",
            "description": "Free online calculators and tools for finance, health, and productivity",
            "publisher": {
              "@id": "https://dapsiwow.com/#organization"
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://dapsiwow.com/search?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })}
        </script>

        <link rel="alternate" hrefLang="en" href="https://dapsiwow.com/tools/roi-calculator" />
        <link rel="alternate" hrefLang="en-US" href="https://dapsiwow.com/tools/roi-calculator" />
        <link rel="alternate" hrefLang="en-GB" href="https://dapsiwow.com/en-gb/tools/roi-calculator" />
        <link rel="alternate" hrefLang="en-CA" href="https://dapsiwow.com/en-ca/tools/roi-calculator" />
        <link rel="alternate" hrefLang="en-AU" href="https://dapsiwow.com/en-au/tools/roi-calculator" />
        <link rel="alternate" hrefLang="es" href="https://dapsiwow.com/es/tools/roi-calculator" />
        <link rel="alternate" hrefLang="fr" href="https://dapsiwow.com/fr/tools/roi-calculator" />
        <link rel="alternate" hrefLang="de" href="https://dapsiwow.com/de/tools/roi-calculator" />
        <link rel="alternate" hrefLang="pt" href="https://dapsiwow.com/pt/tools/roi-calculator" />
        <link rel="alternate" hrefLang="it" href="https://dapsiwow.com/it/tools/roi-calculator" />
        <link rel="alternate" hrefLang="ja" href="https://dapsiwow.com/ja/tools/roi-calculator" />
        <link rel="alternate" hrefLang="zh" href="https://dapsiwow.com/zh/tools/roi-calculator" />
        <link rel="alternate" hrefLang="ko" href="https://dapsiwow.com/ko/tools/roi-calculator" />
        <link rel="alternate" hrefLang="x-default" href="https://dapsiwow.com/tools/roi-calculator" />
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 shadow-sm hover:shadow-md transition-colors duration-200">
                <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0 text-blue-700" />
                <span className="text-[10px] xs:text-xs sm:text-sm md:text-base font-medium text-blue-700 whitespace-nowrap">Professional ROI Calculator - Free & Accurate</span>
              </div>
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0">
                <span className="block">ROI Calculator</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Free Return on Investment Calculator
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Free business ROI calculator to calculate return on investment for stocks, business projects, real estate, and marketing campaigns. Get instant annualized ROI analysis with our comprehensive investment return calculator.
              </p>

              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Track Returns</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Instant Results</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium">Smart Analysis</span>
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
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">ROI Configuration</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your investment details to calculate return on investment</p>
                  </div>

                  {/* Currency Selection */}
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="currency" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Currency
                    </Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg focus:border-blue-500 focus:ring-blue-500 w-full" data-testid="select-currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {currencies.map((curr) => (
                          <SelectItem key={curr.code} value={curr.code} className="text-sm sm:text-base">
                            {curr.code} - {curr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Calculation Type Tabs */}
                  <Tabs value={calculationType} onValueChange={setCalculationType} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-auto">
                      <TabsTrigger value="basic" className="text-xs sm:text-sm md:text-base py-2 sm:py-3">Basic ROI</TabsTrigger>
                      <TabsTrigger value="investment" className="text-xs sm:text-sm md:text-base py-2 sm:py-3">Investment</TabsTrigger>
                      <TabsTrigger value="business" className="text-xs sm:text-sm md:text-base py-2 sm:py-3">Business</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                      <div className="space-y-2 sm:space-y-3">
                        <Label htmlFor="initial-investment" className="text-xs sm:text-sm font-medium text-gray-700">
                          Initial Investment
                        </Label>
                        <Input
                          id="initial-investment"
                          type="number"
                          value={initialInvestment}
                          onChange={(e) => {
                            setInitialInvestment(e.target.value);
                            if (errors.initialInvestment) {
                              const newErrors = { ...errors };
                              delete newErrors.initialInvestment;
                              setErrors(newErrors);
                            }
                          }}
                          className={`h-10 sm:h-12 text-sm sm:text-base border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 w-full ${errors.initialInvestment ? 'border-red-500' : ''}`}
                          placeholder="10,000"
                        />
                        {errors.initialInvestment && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.initialInvestment}</p>
                        )}
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <Label htmlFor="final-value" className="text-xs sm:text-sm font-medium text-gray-700">
                          Final Value
                        </Label>
                        <Input
                          id="final-value"
                          type="number"
                          value={finalValue}
                          onChange={(e) => setFinalValue(e.target.value)}
                          className="h-10 sm:h-12 text-sm sm:text-base border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 w-full"
                          placeholder="12,000"
                        />
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <Label className="text-xs sm:text-sm font-medium text-gray-700">Time Period</Label>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <Input
                            type="number"
                            value={timePeriod}
                            onChange={(e) => setTimePeriod(e.target.value)}
                            className="h-10 sm:h-12 text-sm sm:text-base border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="1"
                            min="1"
                          />
                          <Select value={timeUnit} onValueChange={setTimeUnit}>
                            <SelectTrigger className="h-10 sm:h-12 border-gray-200 rounded-lg text-sm sm:text-base focus:border-blue-500 focus:ring-blue-500 w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="years" className="text-sm sm:text-base">Years</SelectItem>
                              <SelectItem value="months" className="text-sm sm:text-base">Months</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="investment" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                      <div className="space-y-2 sm:space-y-3">
                        <Label htmlFor="investment-amount" className="text-xs sm:text-sm font-medium text-gray-700">
                          Initial Investment
                        </Label>
                        <Input
                          id="investment-amount"
                          type="number"
                          value={investmentAmount}
                          onChange={(e) => setInvestmentAmount(e.target.value)}
                          className="h-10 sm:h-12 text-sm sm:text-base border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 w-full"
                          placeholder="10,000"
                        />
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <Label htmlFor="monthly-contribution" className="text-xs sm:text-sm font-medium text-gray-700">
                          Monthly Contribution
                        </Label>
                        <Input
                          id="monthly-contribution"
                          type="number"
                          value={monthlyContribution}
                          onChange={(e) => setMonthlyContribution(e.target.value)}
                          className="h-10 sm:h-12 text-sm sm:text-base border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 w-full"
                          placeholder="500"
                        />
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <Label htmlFor="annual-return" className="text-xs sm:text-sm font-medium text-gray-700">
                          Expected Annual Return (%)
                        </Label>
                        <Input
                          id="annual-return"
                          type="number"
                          value={annualReturn}
                          onChange={(e) => setAnnualReturn(e.target.value)}
                          className="h-10 sm:h-12 text-sm sm:text-base border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 w-full"
                          placeholder="8"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <Label htmlFor="investment-years" className="text-xs sm:text-sm font-medium text-gray-700">
                          Investment Period (Years)
                        </Label>
                        <Input
                          id="investment-years"
                          type="number"
                          value={investmentYears}
                          onChange={(e) => setInvestmentYears(e.target.value)}
                          className="h-10 sm:h-12 text-sm sm:text-base border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 w-full"
                          placeholder="5"
                          min="1"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="business" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                      <div className="space-y-2 sm:space-y-3">
                        <Label htmlFor="project-cost" className="text-xs sm:text-sm font-medium text-gray-700">
                          Project Cost
                        </Label>
                        <Input
                          id="project-cost"
                          type="number"
                          value={projectCost}
                          onChange={(e) => setProjectCost(e.target.value)}
                          className="h-10 sm:h-12 text-sm sm:text-base border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 w-full"
                          placeholder="50,000"
                        />
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <Label htmlFor="annual-revenue" className="text-xs sm:text-sm font-medium text-gray-700">
                          Annual Revenue
                        </Label>
                        <Input
                          id="annual-revenue"
                          type="number"
                          value={annualRevenue}
                          onChange={(e) => setAnnualRevenue(e.target.value)}
                          className="h-10 sm:h-12 text-sm sm:text-base border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 w-full"
                          placeholder="20,000"
                        />
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <Label htmlFor="annual-costs" className="text-xs sm:text-sm font-medium text-gray-700">
                          Annual Operating Costs
                        </Label>
                        <Input
                          id="annual-costs"
                          type="number"
                          value={annualCosts}
                          onChange={(e) => setAnnualCosts(e.target.value)}
                          className="h-10 sm:h-12 text-sm sm:text-base border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 w-full"
                          placeholder="5,000"
                        />
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <Label htmlFor="project-duration" className="text-xs sm:text-sm font-medium text-gray-700">
                          Project Duration (Years)
                        </Label>
                        <Input
                          id="project-duration"
                          type="number"
                          value={projectDuration}
                          onChange={(e) => setProjectDuration(e.target.value)}
                          className="h-10 sm:h-12 text-sm sm:text-base border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 w-full"
                          placeholder="3"
                          min="1"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4 sm:pt-6">
                    <Button
                      onClick={calculationType === 'basic' ? calculateBasicROI : calculationType === 'investment' ? calculateInvestmentROI : calculateBusinessROI}
                      className="flex-1 h-10 sm:h-12 md:h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg"
                      data-testid="button-calculate-roi"
                    >
                      Calculate ROI
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="h-10 sm:h-12 px-4 sm:px-8 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-lg text-sm sm:text-base"
                    >
                      Reset
                    </Button>
                  </div>

                  {/* ROI Analysis Actions - Moved from Results Section */}
                  {result && (
                    <>
                      {/* Toggle Buttons */}
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 print:hidden">
                        <Button
                          onClick={() => setShowChart(!showChart)}
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs sm:text-sm"
                          data-testid="button-show-chart"
                          aria-expanded={showChart}
                          aria-label={showChart ? 'Hide breakdown chart' : 'Show breakdown chart'}
                        >
                          {showChart ? 'Hide' : 'Show'} Breakdown Chart
                        </Button>
                        <Button
                          onClick={() => setShowComparison(!showComparison)}
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs sm:text-sm"
                          data-testid="button-show-comparison"
                          aria-expanded={showComparison}
                          aria-label={showComparison ? 'Hide comparison table' : 'Show comparison table'}
                        >
                          {showComparison ? 'Hide' : 'Show'} Comparison
                        </Button>
                        <Button
                          onClick={addToComparison}
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs sm:text-sm"
                          data-testid="button-add-comparison"
                        >
                          Add to Comparison
                        </Button>
                        <Button
                          onClick={handleDownloadPDF}
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs sm:text-sm"
                          data-testid="button-export-pdf"
                        >
                          <Download className="w-4 h-4 mr-1.5" />
                          Export PDF
                        </Button>
                      </div>

                      {/* Social Share Section */}
                      <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4">
                        <p className="text-center text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-2 sm:mb-3 px-2">Share your results:</p>
                        <div className="flex flex-wrap justify-center items-center gap-1.5 xs:gap-2 sm:gap-3 px-2 sm:px-0">
                          <Button
                            onClick={() => {
                              const text = `Check out my ROI results: ${formatPercentage(result.roi)} return with ${formatCurrency(result.totalGain)} total gain! Calculate yours at`;
                              const url = `https://dapsiwow.com/tools/roi-calculator`;
                              window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
                            }}
                            size="sm"
                            className="text-[10px] xs:text-xs sm:text-sm px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full sm:rounded-lg bg-[#1877f2] hover:bg-[#166fe5] text-white transition-all flex-shrink-0 w-10 h-10 sm:w-auto sm:h-auto justify-center"
                            data-testid="button-share-facebook"
                            aria-label="Share on Facebook"
                          >
                            <FaFacebook className="w-4 h-4 sm:w-4 sm:h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">Facebook</span>
                          </Button>
                          <Button
                            onClick={() => {
                              const text = `My ROI: ${formatPercentage(result.roi)} with ${formatCurrency(result.totalGain)} gain! Calculate yours:`;
                              const url = `https://dapsiwow.com/tools/roi-calculator`;
                              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                            }}
                            size="sm"
                            className="text-[10px] xs:text-xs sm:text-sm px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full sm:rounded-lg bg-[#1da1f2] hover:bg-[#1a8cd8] text-white transition-all flex-shrink-0 w-10 h-10 sm:w-auto sm:h-auto justify-center"
                            data-testid="button-share-twitter"
                            aria-label="Share on Twitter"
                          >
                            <FaTwitter className="w-4 h-4 sm:w-4 sm:h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">Twitter</span>
                          </Button>
                          <Button
                            onClick={() => {
                              const text = `ROI Results: ${formatPercentage(result.roi)} return, ${formatCurrency(result.totalGain)} total gain. Calculate yours at`;
                              const url = `https://dapsiwow.com/tools/roi-calculator`;
                              window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                            }}
                            size="sm"
                            className="text-[10px] xs:text-xs sm:text-sm px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full sm:rounded-lg bg-[#0077b5] hover:bg-[#006399] text-white transition-all flex-shrink-0 w-10 h-10 sm:w-auto sm:h-auto justify-center"
                            data-testid="button-share-linkedin"
                            aria-label="Share on LinkedIn"
                          >
                            <FaLinkedin className="w-4 h-4 sm:w-4 sm:h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">LinkedIn</span>
                          </Button>
                          <Button
                            onClick={() => {
                              const text = `My ROI: ${formatPercentage(result.roi)} with ${formatCurrency(result.totalGain)} gain! Calculate yours: https://dapsiwow.com/tools/roi-calculator`;
                              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                            }}
                            size="sm"
                            className="text-[10px] xs:text-xs sm:text-sm px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full sm:rounded-lg bg-[#25d366] hover:bg-[#20bd5a] text-white transition-all flex-shrink-0 w-10 h-10 sm:w-auto sm:h-auto justify-center"
                            data-testid="button-share-whatsapp"
                            aria-label="Share on WhatsApp"
                          >
                            <FaWhatsapp className="w-4 h-4 sm:w-4 sm:h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </Button>
                          <Button
                            onClick={() => {
                              if (navigator.share) {
                                navigator.share({
                                  title: 'ROI Calculator Results',
                                  text: `My ROI: ${formatPercentage(result.roi)} with ${formatCurrency(result.totalGain)} gain!`,
                                  url: 'https://dapsiwow.com/tools/roi-calculator'
                                }).catch(() => {});
                              }
                            }}
                            variant="outline"
                            size="sm"
                            className="text-[10px] xs:text-xs sm:text-sm px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full sm:rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all flex-shrink-0 w-10 h-10 sm:w-auto sm:h-auto justify-center"
                            data-testid="button-share-more"
                            aria-label="More share options"
                          >
                            <Share2 className="w-4 h-4 sm:w-4 sm:h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">More</span>
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">ROI Analysis</h2>

                  {result ? (
                    <div className="space-y-4 sm:space-y-6 md:space-y-8" data-testid="roi-results">
                      {/* ROI Display */}
                      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-blue-200 shadow-sm">
                        <div className="text-center space-y-2 sm:space-y-3">
                          <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Return on Investment</div>
                          <div className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold ${result.roi >= 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600' : 'text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600'} break-all`} data-testid="text-roi-percentage">
                            {formatPercentage(result.roi)}
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Initial Investment</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base break-all" data-testid="text-initial-investment">
                              {formatCurrency(result.initialInvestment)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Final Value</span>
                            <span className="font-bold text-green-600 text-sm sm:text-base break-all" data-testid="text-final-value">
                              {formatCurrency(result.finalValue)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Total Gain/Loss</span>
                            <span className={`font-bold text-sm sm:text-base break-all ${result.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-total-gain">
                              {result.totalGain >= 0 ? '+' : ''}{formatCurrency(result.totalGain)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Annualized ROI</span>
                            <span className={`font-bold text-sm sm:text-base ${result.annualizedROI >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-annualized-roi">
                              {formatPercentage(result.annualizedROI)}
                            </span>
                          </div>
                        </div>
                        {calculationType === 'business' && result.breakEvenTime > 0 && (
                          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-sm sm:text-base">Break-even Time</span>
                              <span className="font-bold text-gray-900 text-sm sm:text-base">
                                {result.breakEvenTime.toFixed(1)} years
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ROI Interpretation */}
                      <div className="mt-6 sm:mt-8">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Interpretation</h3>
                        <div className={`p-3 sm:p-4 rounded-lg border ${
                          result.roi >= 20 ? 'bg-green-50 border-green-200' :
                          result.roi >= 10 ? 'bg-yellow-50 border-yellow-200' :
                          result.roi >= 0 ? 'bg-blue-50 border-blue-200' :
                          'bg-red-50 border-red-200'
                        }`}>
                          <div className={`text-xs sm:text-sm ${
                            result.roi >= 20 ? 'text-green-700' :
                            result.roi >= 10 ? 'text-yellow-700' :
                            result.roi >= 0 ? 'text-blue-700' :
                            'text-red-700'
                          }`}>
                            {result.roi >= 20 ? 'Excellent ROI - This is a very profitable investment' :
                             result.roi >= 10 ? 'Good ROI - This investment shows solid returns' :
                             result.roi >= 0 ? 'Positive ROI - This investment is profitable' :
                             'Negative ROI - This investment results in a loss'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12 md:py-16" data-testid="no-results">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <Calculator className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base md:text-lg px-4">Enter your investment details above and click "Calculate ROI" to see your personalized results</p>
                    </div>
                  )}
                </div>

                {/* ROI Breakdown Chart */}
                {result && showChart && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left" data-testid="heading-breakdown-chart">
                      ROI Breakdown
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6" ref={chartRef}>
                  {/* Donut Chart - Investment vs Gain */}
                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">Investment vs Gain</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={[
                            { name: 'Initial Investment', value: Math.abs(result.initialInvestment), color: '#3B82F6' },
                            { name: result.totalGain >= 0 ? 'Total Gain' : 'Total Loss', value: Math.abs(result.totalGain), color: result.totalGain >= 0 ? '#10B981' : '#EF4444' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                        >
                          {[
                            { name: 'Initial Investment', value: Math.abs(result.initialInvestment), color: '#3B82F6' },
                            { name: result.totalGain >= 0 ? 'Total Gain' : 'Total Loss', value: Math.abs(result.totalGain), color: result.totalGain >= 0 ? '#10B981' : '#EF4444' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bar Chart - ROI Comparison */}
                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">ROI Metrics</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={[
                          { name: 'ROI %', value: result.roi },
                          { name: 'Annualized %', value: result.annualizedROI }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                        <Bar dataKey="value" fill={result.roi >= 0 ? '#10B981' : '#EF4444'} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                  </div>
                )}

                {/* Comparison Table */}
                {showComparison && comparisonEntries.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center sm:text-left" data-testid="heading-comparison-table">
                        ROI Comparison
                      </h3>
                  <Button
                    onClick={() => setComparisonEntries([])}
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs sm:text-sm w-full sm:w-auto"
                    data-testid="button-clear-comparison"
                  >
                    <RotateCcw className="w-4 h-4 mr-1.5" />
                    Clear All
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-4">Compare different ROI scenarios side-by-side.</p>
                <div className="overflow-x-auto -mx-4 sm:mx-0" ref={comparisonRef}>
                  <table className="w-full min-w-[600px]" data-testid="comparison-table">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Scenario</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">ROI %</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Annualized %</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Initial Investment</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Gain</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Period</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {comparisonEntries.map((entry, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors" data-testid={`comparison-row-${index}`}>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{entry.label}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 capitalize">{entry.calculationType}</td>
                          <td className={`px-4 py-3 text-sm text-right font-semibold ${entry.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercentage(entry.roi)}
                          </td>
                          <td className={`px-4 py-3 text-sm text-right font-semibold ${entry.annualizedROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercentage(entry.annualizedROI)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(entry.initialInvestment)}</td>
                          <td className={`px-4 py-3 text-sm text-right font-semibold ${entry.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {entry.totalGain >= 0 ? '+' : ''}{formatCurrency(entry.totalGain)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">{entry.timePeriod}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SEO Content Sections */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 md:py-20 space-y-12 sm:space-y-16">
          {/* What is ROI Calculator Section */}
          <section className="prose prose-slate max-w-none" data-testid="section-what-is-roi">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6" id="what-is-roi-calculator">What is ROI Calculator?</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              The <strong>ROI Calculator</strong> is a free online financial tool that helps you calculate return on investment for various scenarios including stocks, business projects, real estate, and marketing campaigns. Whether you're an investor tracking portfolio performance, a business owner evaluating project profitability, or a marketer measuring campaign effectiveness, this calculator provides instant, accurate ROI analysis.
            </p>

            <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Why Use Our ROI Calculator?</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Instant Results:</strong> Get ROI calculations in seconds with our optimized algorithm</li>
              <li><strong>Multiple Calculation Types:</strong> Basic ROI, investment ROI with compound returns, and business project ROI</li>
              <li><strong>Annualized ROI:</strong> Automatically calculates annualized return for accurate performance comparison</li>
              <li><strong>Free Forever:</strong> No hidden fees, registration, or subscription required</li>
              <li><strong>Mobile-Friendly:</strong> Calculate ROI on any device, anywhere, anytime</li>
              <li><strong>Multi-Currency Support:</strong> Calculate in 15+ currencies including USD, EUR, GBP, JPY, and more</li>
              <li><strong>Privacy First:</strong> We don't store your personal or financial data</li>
            </ul>

            <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Who Benefits from ROI Calculator?</h3>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Investors & Traders</h4>
                <p className="text-gray-700 text-sm">Track stock performance, compare investment opportunities, and measure portfolio returns</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Business Owners</h4>
                <p className="text-gray-700 text-sm">Evaluate project profitability, justify capital expenditures, and measure business growth</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Marketing Professionals</h4>
                <p className="text-gray-700 text-sm">Measure campaign ROI, optimize marketing spend, and demonstrate value to stakeholders</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Real Estate Investors</h4>
                <p className="text-gray-700 text-sm">Calculate property investment returns, compare rental yields, and analyze flip opportunities</p>
              </div>
            </div>
          </section>

          {/* How to Use ROI Calculator Section */}
          <section className="prose prose-slate max-w-none" data-testid="section-how-to-use">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6" id="how-to-use-roi-calculator">How to Use the ROI Calculator</h2>

            <h3 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">Step-by-Step Guide:</h3>

            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Step 1: Select Currency</h4>
                <p className="text-gray-700">Choose your preferred currency from 15+ options including USD, EUR, GBP, JPY, CNY, INR, CAD, AUD, CHF, and more. This ensures your results are displayed in the currency relevant to your investment.</p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Step 2: Choose Calculation Type</h4>
                <p className="text-gray-700">Select from three calculation modes:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                  <li><strong>Basic ROI:</strong> Simple return calculation for one-time investments</li>
                  <li><strong>Investment ROI:</strong> Advanced calculation with monthly contributions and compound returns</li>
                  <li><strong>Business ROI:</strong> Project-based ROI with annual revenue, costs, and break-even analysis</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Step 3: Enter Investment Details</h4>
                <p className="text-gray-700">Input your investment values. For basic ROI, enter initial investment, final value, and time period. For investment ROI, add monthly contributions and expected annual return. For business ROI, specify project cost, annual revenue, annual costs, and project duration.</p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Step 4: Calculate and Analyze Results</h4>
                <p className="text-gray-700">Click "Calculate ROI" to instantly see your return percentage, total gain/loss, annualized ROI, and detailed interpretation. The calculator automatically determines if your investment is excellent, good, profitable, or showing a loss.</p>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Pro Tips for Accurate ROI Calculation:</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Include all investment costs: purchase price, fees, commissions, and related expenses</li>
              <li>Account for all returns: dividends, interest, appreciation, and realized gains</li>
              <li>Use annualized ROI when comparing investments of different time periods</li>
              <li>Consider external factors like inflation, taxes, and opportunity costs for complete analysis</li>
              <li>Update calculations regularly to track ongoing investment performance</li>
            </ul>
          </section>

          {/* ROI Calculator Examples Section */}
          <section className="prose prose-slate max-w-none" data-testid="section-examples">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6" id="roi-calculator-examples">ROI Calculator Examples</h2>

            <h3 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">Example 1: Stock Investment ROI</h3>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <p className="text-gray-700 mb-4"><strong>Scenario:</strong> Sarah invested in tech stocks and wants to calculate her return over 2 years.</p>
              <div className="bg-white p-4 rounded border border-gray-200 mb-4">
                <p className="font-semibold text-gray-900 mb-2">Input Values:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Initial Investment: $10,000</li>
                  <li>Final Value: $13,500 (including dividends)</li>
                  <li>Time Period: 2 years</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded">
                <p className="font-semibold text-gray-900 mb-2">Results:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Total Gain: $3,500</li>
                  <li>ROI: +35.00%</li>
                  <li>Annualized ROI: +16.19% per year</li>
                  <li>Interpretation: Excellent ROI - significantly outperforming market averages</li>
                </ul>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Example 2: Business Project ROI</h3>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <p className="text-gray-700 mb-4"><strong>Scenario:</strong> A company invests in new manufacturing equipment and needs to justify the expense.</p>
              <div className="bg-white p-4 rounded border border-gray-200 mb-4">
                <p className="font-semibold text-gray-900 mb-2">Input Values:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Project Cost: $50,000</li>
                  <li>Annual Revenue: $20,000</li>
                  <li>Annual Costs: $5,000</li>
                  <li>Project Duration: 3 years</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <p className="font-semibold text-gray-900 mb-2">Results:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Annual Profit: $15,000</li>
                  <li>Total Profit: $45,000</li>
                  <li>Net Gain: -$5,000 (after initial investment)</li>
                  <li>ROI: -10.00% over 3 years</li>
                  <li>Break-even Time: 3.33 years</li>
                  <li>Interpretation: Negative ROI in short term, but breaks even in year 4</li>
                </ul>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Example 3: Marketing Campaign ROI</h3>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <p className="text-gray-700 mb-4"><strong>Scenario:</strong> A marketing team runs a digital advertising campaign and measures its effectiveness.</p>
              <div className="bg-white p-4 rounded border border-gray-200 mb-4">
                <p className="font-semibold text-gray-900 mb-2">Input Values:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Campaign Cost (Initial Investment): $5,000</li>
                  <li>Revenue Generated (Final Value): $22,000</li>
                  <li>Campaign Duration: 3 months</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <p className="font-semibold text-gray-900 mb-2">Results:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Total Gain: $17,000</li>
                  <li>ROI: +340.00%</li>
                  <li>Annualized ROI: +1,678.74%</li>
                  <li>Interpretation: Exceptional marketing ROI - highly successful campaign</li>
                </ul>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Example 4: Real Estate Investment ROI</h3>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <p className="text-gray-700 mb-4"><strong>Scenario:</strong> An investor purchases a rental property and calculates returns after 5 years.</p>
              <div className="bg-white p-4 rounded border border-gray-200 mb-4">
                <p className="font-semibold text-gray-900 mb-2">Input Values:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Initial Investment: $200,000 (purchase + fees)</li>
                  <li>Final Value: $280,000 (sale price + rental income)</li>
                  <li>Time Period: 5 years</li>
                </ul>
              </div>
              <div className="bg-orange-50 p-4 rounded">
                <p className="font-semibold text-gray-900 mb-2">Results:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Total Gain: $80,000</li>
                  <li>ROI: +40.00%</li>
                  <li>Annualized ROI: +6.96% per year</li>
                  <li>Interpretation: Good ROI for real estate - solid steady returns</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Understanding Your ROI Results Section */}
          <section className="prose prose-slate max-w-none" data-testid="section-understanding-results">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6" id="understanding-roi-results">Understanding Your ROI Results</h2>

            <h3 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">ROI Result Categories</h3>

            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <h4 className="text-lg font-semibold text-green-900 mb-2">Excellent ROI (20% or higher)</h4>
                <p className="text-gray-700 mb-2"><strong>Meaning:</strong> Exceptional performance significantly above market averages</p>
                <p className="text-gray-700 mb-2"><strong>Implications:</strong> Very profitable investment with strong growth potential</p>
                <p className="text-gray-700"><strong>Recommendations:</strong> Consider increasing investment allocation, monitor for sustainability, and look for similar opportunities</p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <h4 className="text-lg font-semibold text-yellow-900 mb-2">Good ROI (10-20%)</h4>
                <p className="text-gray-700 mb-2"><strong>Meaning:</strong> Above-average returns beating inflation and market benchmarks</p>
                <p className="text-gray-700 mb-2"><strong>Implications:</strong> Solid investment showing healthy growth</p>
                <p className="text-gray-700"><strong>Recommendations:</strong> Maintain current strategy, continue monitoring performance, diversify risk</p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h4 className="text-lg font-semibold text-blue-900 mb-2">Positive ROI (0-10%)</h4>
                <p className="text-gray-700 mb-2"><strong>Meaning:</strong> Profitable but modest returns, possibly below market averages</p>
                <p className="text-gray-700 mb-2"><strong>Implications:</strong> Investment is gaining value but underperforming</p>
                <p className="text-gray-700"><strong>Recommendations:</strong> Evaluate if returns justify risk, consider alternative investments, optimize strategy</p>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <h4 className="text-lg font-semibold text-red-900 mb-2">Negative ROI (Below 0%)</h4>
                <p className="text-gray-700 mb-2"><strong>Meaning:</strong> Investment is losing money</p>
                <p className="text-gray-700 mb-2"><strong>Implications:</strong> Current strategy is not working; losses are occurring</p>
                <p className="text-gray-700"><strong>Recommendations:</strong> Investigate cause of loss, consider cutting losses, reassess investment thesis, seek professional advice</p>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">When to Seek Professional Advice</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Consistently negative ROI across multiple investments</li>
              <li>Large capital investments requiring detailed financial analysis</li>
              <li>Complex tax implications affecting net returns</li>
              <li>Retirement planning and long-term wealth management</li>
              <li>Business decisions with significant financial consequences</li>
            </ul>
          </section>

          {/* ROI Calculation Formula Explained Section */}
          <section className="prose prose-slate max-w-none" data-testid="section-formula">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6" id="roi-formula-explained">ROI Calculation Formula Explained</h2>

            <h3 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">The Standard ROI Formula</h3>
            <div className="bg-gray-100 p-6 rounded-lg my-4">
              <p className="text-center text-2xl font-mono font-bold text-gray-900">
                ROI = ((Final Value - Initial Investment) / Initial Investment) × 100
              </p>
            </div>

            <h4 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Variables:</h4>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Final Value:</strong> Current or ending value of investment including all returns (dividends, interest, appreciation)</li>
              <li><strong>Initial Investment:</strong> Total amount invested including purchase price, fees, and related costs</li>
              <li><strong>ROI:</strong> Return on Investment expressed as a percentage</li>
            </ul>

            <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Annualized ROI Formula</h3>
            <div className="bg-gray-100 p-6 rounded-lg my-4">
              <p className="text-center text-xl font-mono font-bold text-gray-900">
                Annualized ROI = ((Final Value / Initial Investment)^(1/Years) - 1) × 100
              </p>
            </div>
            <p className="text-gray-700 mt-4">
              Annualized ROI accounts for the time value of money and provides a standardized annual return rate, making it easier to compare investments of different durations. This formula uses compound annual growth rate (CAGR) principles to show average yearly performance.
            </p>

            <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Example Calculation</h3>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4"><strong>Given:</strong> Initial Investment = $10,000, Final Value = $14,000, Time = 3 years</p>
              <p className="text-gray-700 mb-2"><strong>Simple ROI:</strong></p>
              <p className="font-mono text-gray-800 mb-4">ROI = (($14,000 - $10,000) / $10,000) × 100 = 40.00%</p>
              <p className="text-gray-700 mb-2"><strong>Annualized ROI:</strong></p>
              <p className="font-mono text-gray-800">Annualized ROI = (($14,000 / $10,000)^(1/3) - 1) × 100 = 11.87% per year</p>
            </div>

            <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Accuracy and Limitations</h3>
            <p className="text-gray-700">
              While ROI calculation is straightforward and widely used, it has limitations. It doesn't account for risk, inflation, opportunity cost, or time value of money (unless using annualized ROI). For comprehensive investment analysis, consider combining ROI with other metrics like IRR, NPV, and risk-adjusted returns.
            </p>
          </section>

          {/* Tips and Best Practices Section */}
          <section className="prose prose-slate max-w-none" data-testid="section-tips">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6" id="roi-tips-best-practices">Tips and Best Practices for Calculating Accurate ROI</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Include All Costs</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Purchase price or initial capital</li>
                  <li>Transaction fees and commissions</li>
                  <li>Maintenance and operational costs</li>
                  <li>Taxes and regulatory fees</li>
                  <li>Professional service charges</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Account for All Returns</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Capital appreciation or depreciation</li>
                  <li>Dividend payments and interest earned</li>
                  <li>Rental income or recurring revenue</li>
                  <li>Tax benefits and deductions</li>
                  <li>Sale proceeds and liquidation value</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Use the Right Timeframe</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Match timeframes for fair comparisons</li>
                  <li>Use annualized ROI for multi-year investments</li>
                  <li>Consider holding period when evaluating</li>
                  <li>Update calculations for ongoing investments</li>
                  <li>Factor in time value of money</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Consider External Factors</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Inflation impact on real returns</li>
                  <li>Market conditions and economic cycles</li>
                  <li>Currency exchange rate fluctuations</li>
                  <li>Industry-specific trends and risks</li>
                  <li>Opportunity cost of alternative investments</li>
                </ul>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Expert Recommendations</h3>
            <div className="bg-blue-50 p-6 rounded-lg">
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Track ROI regularly to identify trends and patterns in investment performance</li>
                <li>Compare your ROI against relevant benchmarks (S&P 500, industry averages, peer investments)</li>
                <li>Document all assumptions and data sources for transparent, reproducible calculations</li>
                <li>Use conservative estimates when projecting future returns to avoid overoptimistic expectations</li>
                <li>Combine ROI with qualitative factors like strategic fit, risk tolerance, and long-term goals</li>
              </ul>
            </div>
          </section>

          {/* ROI vs Other Metrics Section */}
          <section className="prose prose-slate max-w-none" data-testid="section-comparison">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6" id="roi-vs-other-metrics">ROI vs Other Financial Metrics</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 border-b">Metric</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 border-b">What It Measures</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 border-b">Best For</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 border-b">Key Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">ROI</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Total profitability as percentage of investment</td>
                    <td className="px-6 py-4 text-sm text-gray-700">General investment comparison, business projects</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Simple, doesn't account for time</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">ROAS</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Revenue per dollar spent on advertising</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Marketing campaigns, ad spend optimization</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Ratio (e.g., 5:1), not percentage</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">IRR</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Annual growth rate accounting for cash flow timing</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Multi-period investments, complex cash flows</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Considers timing of cash flows</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">NPV</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Present value of future cash flows minus initial cost</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Capital budgeting, project evaluation</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Dollar amount, not percentage</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Payback Period</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Time to recover initial investment</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Risk assessment, liquidity analysis</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Time-based, not return-based</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">When to Use Each Metric</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Use ROI when:</strong> You need a quick, simple profitability comparison across different investment types</li>
              <li><strong>Use ROAS when:</strong> You're evaluating marketing and advertising campaign effectiveness</li>
              <li><strong>Use IRR when:</strong> Investments have multiple cash flows at different times (real estate, private equity)</li>
              <li><strong>Use NPV when:</strong> You need absolute dollar value of an investment opportunity</li>
              <li><strong>Use Payback Period when:</strong> Liquidity and speed of capital recovery are priorities</li>
            </ul>
          </section>

          {/* FAQ Section */}
          <section className="prose prose-slate max-w-none" data-testid="section-faq">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6" id="faq">Frequently Asked Questions (FAQ)</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-3" id="faq-what-is-roi">What is ROI and how is it calculated?</h3>
            <p className="text-gray-700">
              ROI (Return on Investment) is a performance measure used to evaluate the profitability of an investment. It's calculated as: <strong>ROI = ((Final Value - Initial Investment) / Initial Investment) × 100</strong>. A positive ROI indicates profit, while negative ROI indicates a loss. For example, if you invest $1,000 and it grows to $1,200, your ROI is 20%.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-3" id="faq-good-roi">What is a good ROI percentage?</h3>
            <p className="text-gray-700">
              A good ROI depends on the investment type and risk level. Generally, an annual ROI of 7-10% is considered good for stocks, 15-20% for business investments, and 8-12% for real estate. Marketing campaigns often target 500% or higher ROI. Higher returns typically involve higher risk, so always evaluate ROI in context of your risk tolerance and investment objectives.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-3" id="faq-annualized-roi">What is annualized ROI?</h3>
            <p className="text-gray-700">
              Annualized ROI is the average annual return of an investment over a specified time period. It accounts for compounding and provides a standardized measure to compare investments of different durations. The formula is: <strong>Annualized ROI = ((Final Value / Initial Investment)^(1/Years) - 1) × 100</strong>. This is essential for comparing a 5-year investment to a 2-year investment on equal terms.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-3" id="faq-roi-vs-roas">How is ROI different from ROAS?</h3>
            <p className="text-gray-700">
              ROI measures total profitability as a percentage of investment cost across all investment types, while ROAS (Return on Ad Spend) specifically measures revenue generated from advertising campaigns. ROAS is expressed as a ratio (e.g., 5:1 means $5 revenue for every $1 spent), while ROI is a percentage. ROAS focuses on gross revenue, whereas ROI considers net profit after all costs.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-3" id="faq-negative-roi">Can ROI be negative?</h3>
            <p className="text-gray-700">
              Yes, ROI can be negative when the final value is less than the initial investment, indicating a loss. A negative ROI means you've lost money on the investment. For example, if you invest $10,000 and it decreases to $8,000, your ROI is -20%. Negative ROI signals the need to reassess your investment strategy or consider cutting losses.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-3" id="faq-break-even">What is break-even time in ROI calculation?</h3>
            <p className="text-gray-700">
              Break-even time is the period required for cumulative profits to equal the initial investment cost. It indicates when an investment starts generating net positive returns. For business projects, this is calculated as Initial Investment divided by Annual Net Profit. A shorter break-even time generally indicates lower risk and faster capital recovery.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-3" id="faq-calculator-accuracy">How accurate is the ROI calculator?</h3>
            <p className="text-gray-700">
              Our ROI calculator uses standard financial formulas and is highly accurate for calculating returns based on the inputs provided. However, actual investment performance may vary due to market conditions, transaction fees, taxes, inflation, and other factors not included in basic calculations. Always use the calculator as a guide and consult financial professionals for major investment decisions.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-3" id="faq-simple-vs-annualized">Should I use simple or annualized ROI?</h3>
            <p className="text-gray-700">
              Use simple ROI for short-term investments (less than 1 year) or quick profitability comparisons. Use annualized ROI for long-term investments or when comparing investments of different durations, as it accounts for time value of money and compounding effects. Annualized ROI provides a more accurate picture of performance for multi-year investments and enables fair comparisons across different timeframes.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-3" id="faq-improve-roi">How can I improve my investment ROI?</h3>
            <p className="text-gray-700">
              Improve ROI by: (1) Reducing costs through negotiation, efficiency improvements, and eliminating waste; (2) Increasing returns through value optimization, diversification, and strategic timing; (3) Minimizing fees and taxes through tax-advantaged accounts and low-cost investment vehicles; (4) Reinvesting profits to leverage compounding; (5) Continuously monitoring and rebalancing your portfolio based on performance and market conditions.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-3" id="faq-factors-affecting-roi">What factors affect ROI calculation?</h3>
            <p className="text-gray-700">
              Key factors include: initial investment amount, final value (including all returns), time period, fees and expenses, taxes, inflation, market conditions, risk level, and opportunity cost. For accurate ROI calculation, include all costs (purchase price, fees, maintenance) and all returns (appreciation, dividends, interest, rental income). External factors like economic conditions and industry trends also significantly impact actual ROI.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-3" id="faq-using-calculator">How do I use the ROI calculator effectively?</h3>
            <p className="text-gray-700">
              To use the ROI calculator effectively: (1) Input accurate data for initial investment, final value, and time period. (2) Select the correct currency. (3) Choose the appropriate calculation type (Basic, Investment, or Business). (4) Double-check your inputs to ensure accuracy. (5) Understand the results and interpretation provided. (6) Use the annualized ROI for long-term comparisons. (7) Consider the calculator as a tool to guide decisions, not a sole determinant.
            </p>
          </section>

          {/* Final Call-to-Action Section */}
          <section className="prose prose-slate max-w-none bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl" data-testid="section-final-cta">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" id="get-started">Ready to Calculate Your ROI?</h2>
              <p className="text-lg text-gray-700 mb-6">
                Make smarter investment decisions with our free ROI calculator. Get instant, accurate results with detailed breakdowns and annualized returns analysis.
              </p>

              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Start Calculating Now:</h3>
                <ul className="list-none space-y-2 text-gray-700 mb-6 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span><strong>Instant Results</strong> - Get ROI calculations in seconds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span><strong>Three Calculation Modes</strong> - Basic, Investment, and Business ROI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span><strong>Annualized ROI</strong> - Compare investments of different durations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span><strong>Multi-Currency Support</strong> - Calculate in 15+ currencies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span><strong>100% Free</strong> - No registration or hidden fees required</span>
                  </li>
                </ul>

                <a href="#roi-calculator-tool" className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg no-underline" data-testid="button-scroll-to-calculator">
                  Use ROI Calculator Now →
                </a>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
                  <p className="text-gray-700 text-sm">
                    Check our <a href="#faq" className="text-blue-600 hover:text-blue-700">FAQ section</a> or <a href="/help-center" className="text-blue-600 hover:text-blue-700">Help Center</a> for detailed guidance on using the calculator.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Share This Tool</h4>
                  <p className="text-gray-700 text-sm">
                    Found this calculator helpful? Share it with colleagues and friends who need to calculate investment returns.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Related Tools Section */}
          <section className="prose prose-slate max-w-none" data-testid="section-related-tools">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6" id="related-calculators">Related Financial Calculators</h2>
            <p className="text-lg text-gray-700 mb-6">
              Explore our comprehensive suite of free financial calculators to make informed financial decisions:
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <a href="/tools/loan-calculator" className="block bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all no-underline" data-testid="link-loan-calculator">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 no-underline">Loan Calculator</h3>
                <p className="text-gray-700 text-sm">Calculate monthly payments, total interest, and amortization schedules for any loan. Perfect for auto loans, personal loans, and debt planning.</p>
                <span className="text-blue-600 font-medium text-sm mt-2 inline-block">Calculate Loan Payments →</span>
              </a>

              <a href="/tools/mortgage-calculator" className="block bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all no-underline" data-testid="link-mortgage-calculator">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 no-underline">Mortgage Calculator</h3>
                <p className="text-gray-700 text-sm">Estimate home loan payments with taxes, insurance, and PMI. Compare different scenarios to find the perfect mortgage for your budget.</p>
                <span className="text-blue-600 font-medium text-sm mt-2 inline-block">Calculate Mortgage →</span>
              </a>

              <a href="/tools/business-loan-calculator" className="block bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all no-underline" data-testid="link-business-loan-calculator">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 no-underline">Business Loan Calculator</h3>
                <p className="text-gray-700 text-sm">Calculate business loan payments and compare financing options. Essential for entrepreneurs and small business owners planning growth.</p>
                <span className="text-blue-600 font-medium text-sm mt-2 inline-block">Calculate Business Loan →</span>
              </a>

              <a href="/tools/simple-interest-calculator" className="block bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all no-underline" data-testid="link-simple-interest-calculator">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 no-underline">Simple Interest Calculator</h3>
                <p className="text-gray-700 text-sm">Calculate simple interest on savings, investments, or loans. Understand how interest accumulates over time with straightforward calculations.</p>
                <span className="text-blue-600 font-medium text-sm mt-2 inline-block">Calculate Simple Interest →</span>
              </a>

              <a href="/tools/compound-interest-calculator" className="block bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all no-underline" data-testid="link-compound-interest-calculator">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 no-underline">Compound Interest Calculator</h3>
                <p className="text-gray-700 text-sm">Discover the power of compound interest for long-term investments. See how your money grows with regular contributions and compounding.</p>
                <span className="text-blue-600 font-medium text-sm mt-2 inline-block">Calculate Compound Interest →</span>
              </a>

              <a href="/tools/investment-calculator" className="block bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all no-underline" data-testid="link-investment-calculator">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 no-underline">Investment Calculator</h3>
                <p className="text-gray-700 text-sm">Project investment growth with detailed analysis of returns, fees, and time horizons. Plan your financial future with confidence.</p>
                <span className="text-blue-600 font-medium text-sm mt-2 inline-block">Calculate Investment Growth →</span>
              </a>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Need More Financial Tools?</h3>
              <p className="text-gray-700 mb-4">
                Browse our complete collection of 180+ free financial, health, and productivity calculators. All tools are free, require no registration, and work on any device.
              </p>
              <a href="/finance-tools" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors no-underline" data-testid="link-all-tools">
                View All Financial Tools →
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
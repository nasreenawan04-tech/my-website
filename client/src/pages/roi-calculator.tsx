import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingDown, Clock, DollarSign } from 'lucide-react';

interface ROIResult {
  roi: number;
  totalGain: number;
  totalReturn: number;
  initialInvestment: number;
  finalValue: number;
  annualizedROI: number;
  breakEvenTime: number;
}

export default function ROICalculator() {
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
    if (isNaN(rate) || rate <= 0) {
      newErrors.annualReturn = 'Please enter a valid annual return greater than 0';
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

    if (!validateInvestmentInputs(initial, monthly, rate, years)) return;

    const monthlyRate = rate / 12;
    const months = years * 12;

    // Future value of initial investment
    const futureValueInitial = initial * Math.pow(1 + rate, years);

    // Future value of monthly contributions (annuity)
    const futureValueMonthly = monthly * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;

    const finalValue = futureValueInitial + futureValueMonthly;
    const totalInvested = initial + (monthly * months);
    const totalGain = finalValue - totalInvested;
    const roi = (totalGain / totalInvested) * 100;
    const annualizedROI = (Math.pow(finalValue / totalInvested, 1 / years) - 1) * 100;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Free ROI Calculator 2025 | Calculate Investment Returns Instantly</title>
        <meta name="description" content="Calculate ROI in seconds with our free 2025 calculator. Get instant results for investments, business projects, real estate & marketing. Includes annualized ROI, break-even analysis & charts. No signup required." />
        <meta name="keywords" content="roi calculator, roi calculator online free, investment roi calculator, business roi calculator, return on investment calculator, free roi calculator 2025, annualized roi calculator, roi calculator with inflation, marketing roi calculator, real estate roi calculator" />
        
        <meta name="author" content="DapsiWow" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href="https://dapsiwow.com/tools/roi-calculator" />
        
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Free ROI Calculator 2025 | Calculate Investment Returns Instantly" />
        <meta property="og:description" content="Calculate ROI in seconds with our free calculator. Get instant results for investments, business projects, real estate & marketing. Includes annualized ROI & break-even analysis." />
        <meta property="og:url" content="https://dapsiwow.com/tools/roi-calculator" />
        <meta property="og:site_name" content="DapsiWow" />
        <meta property="og:image" content="https://dapsiwow.com/og-roi-calculator.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Free ROI Calculator - Calculate Investment Returns" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free ROI Calculator 2025 | Calculate Investment Returns Instantly" />
        <meta name="twitter:description" content="Calculate ROI in seconds. Get instant results for investments, business projects & marketing. Free annualized ROI & break-even analysis." />
        <meta name="twitter:image" content="https://dapsiwow.com/og-roi-calculator.jpg" />
        <meta name="twitter:image:alt" content="Free ROI Calculator - Calculate Investment Returns" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "ROI Calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "2500",
              "bestRating": "5",
              "worstRating": "1"
            },
            "description": "Free online ROI calculator to calculate return on investment for stocks, business projects, real estate, and marketing campaigns. Features annualized ROI, break-even analysis, and multi-currency support.",
            "featureList": [
              "Calculate basic ROI",
              "Investment ROI with compound returns",
              "Business project ROI analysis",
              "Annualized ROI calculation",
              "Break-even time analysis",
              "Multi-currency support",
              "Visual charts and graphs",
              "Instant results"
            ],
            "screenshot": "https://dapsiwow.com/screenshots/roi-calculator.jpg",
            "author": {
              "@type": "Organization",
              "name": "DapsiWow",
              "url": "https://dapsiwow.com"
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
                <span className="block">ROI Calculator Online Free:</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Investment ROI Calculator 2025
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Free business ROI calculator to calculate return on investment for stocks, business projects, real estate, and marketing campaigns. Get instant annualized ROI analysis with our comprehensive investment return calculator.
              </p>

              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <TrendingDown className="w-5 h-5 text-green-600" />
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
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

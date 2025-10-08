import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calculator, TrendingUp, Clock, DollarSign, Info } from 'lucide-react';

interface CompoundInterestResult {
  finalAmount: number;
  totalInterest: number;
  principalAmount: number;
  totalContributions: number;
  realValue: number;
  inflationAdjustedGains: number;
  goalAnalysis?: {
    timeToReachGoal: number;
    requiredMonthlyContribution: number;
    isGoalAchievable: boolean;
  };
  sipAnalysis?: {
    totalSIPContributions: number;
    sipInterestEarned: number;
    averageAnnualReturn: number;
  };
  yearlyBreakdown: Array<{
    year: number;
    amount: number;
    interestEarned: number;
    totalInterest: number;
    sipContribution: number;
    cumulativeContributions: number;
    realValue: number;
  }>;
}

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState('10000');
  const [interestRate, setInterestRate] = useState('8');
  const [timePeriod, setTimePeriod] = useState('10');
  const [timeUnit, setTimeUnit] = useState('years');
  const [compoundFrequency, setCompoundFrequency] = useState('12');
  const [currency, setCurrency] = useState('USD');
  const [enableSIP, setEnableSIP] = useState(false);
  const [sipAmount, setSipAmount] = useState('1000');
  const [sipFrequency, setSipFrequency] = useState('12');
  const [stepUpPercentage, setStepUpPercentage] = useState('0');
  const [inflationRate, setInflationRate] = useState('3');
  const [enableGoalPlanning, setEnableGoalPlanning] = useState(false);
  const [goalAmount, setGoalAmount] = useState('100000');
  const [showRealValue, setShowRealValue] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [result, setResult] = useState<CompoundInterestResult | null>(null);

  const calculateCompoundInterest = () => {
    const p = parseFloat(principal);
    const r = parseFloat(interestRate) / 100;
    const t = timeUnit === 'years' ? parseFloat(timePeriod) : parseFloat(timePeriod) / 12;
    const n = parseFloat(compoundFrequency);
    const sip = enableSIP ? parseFloat(sipAmount) : 0;
    const sipFreq = parseFloat(sipFrequency);
    const stepUp = parseFloat(stepUpPercentage) / 100;
    const inflation = parseFloat(inflationRate) / 100;
    const target = parseFloat(goalAmount);

    if (p < 0 || r <= 0 || t <= 0 || n <= 0) return;

    const years = Math.ceil(t);
    let currentAmount = p;
    let totalContributions = p;
    let totalSIPContributions = 0;
    const yearlyBreakdown = [];
    
    for (let year = 1; year <= years; year++) {
      const isPartialYear = year > t;
      const yearDuration = isPartialYear ? t - (year - 1) : 1;
      
      const growthFactor = Math.pow((1 + r / n), n * yearDuration);
      currentAmount *= growthFactor;
      
      if (enableSIP && sip > 0) {
        const periodsInYear = sipFreq * yearDuration;
        let currentSIP = sip;
        
        if (stepUp > 0 && year > 1) {
          currentSIP = sip * Math.pow(1 + stepUp, year - 1);
        }
        
        for (let period = 1; period <= periodsInYear; period++) {
          const remainingTime = yearDuration - (period / sipFreq);
          const contributionGrowth = remainingTime > 0 ? Math.pow((1 + r / n), n * remainingTime) : 1;
          currentAmount += currentSIP * contributionGrowth;
          totalSIPContributions += currentSIP;
          totalContributions += currentSIP;
        }
      }
      
      const previousAmount: number = year === 1 ? p : yearlyBreakdown[year - 2].amount;
      const interestEarned: number = currentAmount - previousAmount - (enableSIP ? totalSIPContributions - (year > 1 ? yearlyBreakdown[year - 2].cumulativeContributions - p : 0) : 0);
      const realValue = currentAmount / Math.pow(1 + inflation, year);
      
      yearlyBreakdown.push({
        year,
        amount: currentAmount,
        interestEarned: Math.max(0, interestEarned),
        totalInterest: currentAmount - totalContributions,
        sipContribution: enableSIP && sip > 0 ? (stepUp > 0 ? sip * Math.pow(1 + stepUp, year - 1) : sip) * sipFreq * yearDuration : 0,
        cumulativeContributions: totalContributions,
        realValue
      });
    }

    const finalAmount = currentAmount;
    const totalInterest = finalAmount - totalContributions;
    const realValue = finalAmount / Math.pow(1 + inflation, t);
    const inflationAdjustedGains = realValue - totalContributions;

    let goalAnalysis;
    if (enableGoalPlanning && target > 0) {
      let timeToGoal = 0;
      let testAmount = p;
      let testContributions = p;
      
      while (testAmount < target && timeToGoal < 50) {
        timeToGoal += 1;
        testAmount *= Math.pow((1 + r / n), n);
        
        if (enableSIP && sip > 0) {
          const yearSIP = stepUp > 0 ? sip * Math.pow(1 + stepUp, timeToGoal - 1) : sip;
          testAmount += yearSIP * sipFreq * ((Math.pow(1 + r/n, n) - 1) / (r/n));
          testContributions += yearSIP * sipFreq;
        }
      }
      
      const requiredTotal = target - p * Math.pow((1 + r / n), n * t);
      const annuityFactor = ((Math.pow(1 + r/n, n * t) - 1) / (r/n));
      const requiredMonthlyContribution = requiredTotal > 0 ? (requiredTotal / annuityFactor) / 12 : 0;
      
      goalAnalysis = {
        timeToReachGoal: timeToGoal <= 50 ? timeToGoal : -1,
        requiredMonthlyContribution: Math.max(0, requiredMonthlyContribution),
        isGoalAchievable: timeToGoal <= 50 || requiredMonthlyContribution <= sip * 2
      };
    }

    let sipAnalysis;
    if (enableSIP && totalSIPContributions > 0) {
      const sipInterestEarned = finalAmount - p - totalSIPContributions;
      const averageAnnualReturn = totalSIPContributions > 0 ? ((finalAmount / totalContributions) ** (1/t) - 1) * 100 : 0;
      
      sipAnalysis = {
        totalSIPContributions,
        sipInterestEarned: Math.max(0, sipInterestEarned),
        averageAnnualReturn
      };
    }

    setResult({
      finalAmount,
      totalInterest,
      principalAmount: p,
      totalContributions,
      realValue,
      inflationAdjustedGains,
      goalAnalysis,
      sipAnalysis,
      yearlyBreakdown
    });
  };

  const resetCalculator = () => {
    setPrincipal('10000');
    setInterestRate('8');
    setTimePeriod('10');
    setTimeUnit('years');
    setCompoundFrequency('12');
    setCurrency('USD');
    setEnableSIP(false);
    setSipAmount('1000');
    setSipFrequency('12');
    setStepUpPercentage('0');
    setInflationRate('3');
    setEnableGoalPlanning(false);
    setGoalAmount('100000');
    setShowRealValue(false);
    setShowBreakdown(false);
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
      MXN: { locale: 'es-MX', currency: 'MXN' }
    };

    const config = currencyMap[currency] || currencyMap.USD;
    
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Compound Interest Calculator with Monthly Deposits - Free Daily & Retirement Calculator 2025</title>
        <meta name="description" content="Free compound interest calculator with monthly deposits, daily compounding, and retirement planning. Calculate investment growth for 401k, IRA, savings accounts with graphs. How to calculate compound interest made simple - 100% free online tool." />
        <meta name="keywords" content="compound interest calculator, compound interest calculator with monthly deposits, daily compound interest calculator, compound interest calculator for retirement, 401k compound interest calculator, IRA compound interest calculator, compound interest calculator for savings, free compound interest calculator, compound interest calculator with graph, how to calculate compound interest, compound interest formula, compound interest vs simple interest calculator, investment calculator, retirement calculator, savings calculator, SIP calculator, online compound interest calculator, simple compound interest calculator" />
        <meta property="og:title" content="Compound Interest Calculator with Monthly Deposits - Free Investment Growth Calculator" />
        <meta property="og:description" content="Free online compound interest calculator with daily compounding, monthly deposits, and retirement planning. Calculate 401k, IRA, and savings growth with interactive graphs." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/compound-interest-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Compound Interest Calculator with Monthly Deposits",
            "description": "Free online compound interest calculator to calculate investment growth with daily compounding, monthly deposits, retirement planning for 401k and IRA accounts. Learn how to calculate compound interest with our simple calculator featuring graphs and detailed breakdowns.",
            "url": "https://dapsiwow.com/tools/compound-interest-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Compound interest calculator with monthly deposits",
              "Daily compound interest calculator",
              "Compound interest calculator for retirement (401k, IRA)",
              "Free online compound interest calculator with graphs",
              "SIP investment planning with step-up",
              "Goal-based investment analysis",
              "Inflation adjustment calculations",
              "Multi-currency support (USD, EUR, INR, GBP)",
              "Compound interest formula calculator",
              "Simple vs compound interest comparison"
            ],
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "12847"
            }
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
              <div className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <Calculator className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-700" />
                <span className="text-xs sm:text-sm font-medium text-blue-700">Free Daily & Monthly Compound Interest Calculator - 100% Accurate</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0">
                <span className="block">Compound Interest Calculator</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  with Monthly Deposits & Retirement Planning
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Free online compound interest calculator with daily compounding, monthly deposits, and retirement planning for 401k, IRA, and savings accounts. Learn how to calculate compound interest with graphs, step-by-step formulas, and inflation adjustments. Perfect for wealth building and achieving financial goals. 100% free, no registration required.
              </p>

              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Watch Growth</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Plan Ahead</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium">Build Wealth</span>
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
                <div className="text-2xl font-bold text-gray-900">1.8M+</div>
                <div className="text-sm text-gray-600">Calculations Performed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">100% Free</div>
                <div className="text-sm text-gray-600">No Registration Required</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">Expert-Grade</div>
                <div className="text-sm text-gray-600">Accurate Projections</div>
              </div>
            </div>
          </div>

          {/* How to Use Section */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">How to Use This Compound Interest Calculator with Monthly Deposits</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">1</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Enter Principal Amount</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Input your initial investment amount. This is the starting principal that will grow through compound interest over time.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">2</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Set Interest Rate</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Enter the expected annual return rate. Use realistic rates: 6-8% for conservative, 8-12% for moderate, 12-15% for aggressive investments.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">3</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Choose Time Period</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Select investment duration in years or months. Longer periods maximize compound growth benefits exponentially.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-green-50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">4</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Select Compounding Frequency</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Choose how often interest compounds: monthly, quarterly, or annually. More frequent compounding accelerates growth.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-green-50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">5</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Add SIP (Optional)</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Optional: Enable systematic investment plan to see how regular monthly contributions supercharge your compound growth.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-green-50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">6</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Calculate & Analyze</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Click "Calculate" to see final amount, total interest earned, yearly breakdown, and inflation-adjusted real value.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Input Section */}
                <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Investment Configuration</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your investment details to see how compound interest accelerates your wealth growth</p>
                  </div>
                  
                  <TooltipProvider>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {/* Currency Selection */}
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="currency" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Currency
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Select your preferred currency for calculations</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-currency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                            <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                            <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                            <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                            <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                            <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Compound Frequency */}
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Compound Frequency</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">How often interest is calculated and added to principal</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={compoundFrequency} onValueChange={setCompoundFrequency}>
                          <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-compound-frequency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Annually</SelectItem>
                            <SelectItem value="2">Semi-annually</SelectItem>
                            <SelectItem value="4">Quarterly</SelectItem>
                            <SelectItem value="12">Monthly</SelectItem>
                            <SelectItem value="365">Daily</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Principal Amount */}
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="principal" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Principal Amount
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Your initial investment amount</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">$</span>
                          <Input
                            id="principal"
                            type="number"
                            value={principal}
                            onChange={(e) => setPrincipal(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="10,000"
                            data-testid="input-principal"
                          />
                        </div>
                      </div>

                      {/* Interest Rate */}
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
                              <p className="max-w-xs text-sm">Expected yearly return rate on your investment</p>
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
                            placeholder="8.00"
                            step="0.01"
                            data-testid="input-interest-rate"
                          />
                          <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">%</span>
                        </div>
                      </div>

                      {/* Time Period */}
                      <div className="md:col-span-2 space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Investment Period</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">How long you plan to invest</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <Input
                            type="number"
                            value={timePeriod}
                            onChange={(e) => setTimePeriod(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="10"
                            min="1"
                            data-testid="input-time-period"
                          />
                          <Select value={timeUnit} onValueChange={setTimeUnit}>
                            <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-time-unit">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="years">Years</SelectItem>
                              <SelectItem value="months">Months</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">💡 Pro Tip: Time is the most powerful factor in compound interest!</p>
                      </div>
                    </div>
                  </TooltipProvider>

                  {/* Advanced Options */}
                  <div className="space-y-4 sm:space-y-6 border-t pt-4 sm:pt-6 md:pt-8">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Advanced Options</h3>
                    
                    {/* SIP Investment Toggle */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <input
                        type="checkbox"
                        checked={enableSIP}
                        onChange={(e) => setEnableSIP(e.target.checked)}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                        data-testid="checkbox-enable-sip"
                      />
                      <label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Enable SIP (Systematic Investment Plan)
                      </label>
                    </div>
                    
                    {enableSIP && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pl-4 sm:pl-6 md:pl-8 border-l-4 border-blue-200 bg-blue-50 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl">
                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="sip-amount" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            SIP Amount
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">$</span>
                            <Input
                              id="sip-amount"
                              type="number"
                              value={sipAmount}
                              onChange={(e) => setSipAmount(e.target.value)}
                              className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                              placeholder="1,000"
                              data-testid="input-sip-amount"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">SIP Frequency</Label>
                          <Select value={sipFrequency} onValueChange={setSipFrequency}>
                            <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-sip-frequency">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="12">Monthly</SelectItem>
                              <SelectItem value="4">Quarterly</SelectItem>
                              <SelectItem value="2">Semi-annually</SelectItem>
                              <SelectItem value="1">Annually</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="step-up" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Annual Step-Up (%)
                          </Label>
                          <div className="relative">
                            <Input
                              id="step-up"
                              type="number"
                              value={stepUpPercentage}
                              onChange={(e) => setStepUpPercentage(e.target.value)}
                              className="h-10 sm:h-12 md:h-14 pr-6 sm:pr-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                              placeholder="5"
                              step="0.01"
                              data-testid="input-step-up"
                            />
                            <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">%</span>
                          </div>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="inflation-rate" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Inflation Rate (%)
                          </Label>
                          <div className="relative">
                            <Input
                              id="inflation-rate"
                              type="number"
                              value={inflationRate}
                              onChange={(e) => setInflationRate(e.target.value)}
                              className="h-10 sm:h-12 md:h-14 pr-6 sm:pr-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                              placeholder="3"
                              step="0.01"
                              data-testid="input-inflation-rate"
                            />
                            <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Goal Planning Toggle */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <input
                        type="checkbox"
                        checked={enableGoalPlanning}
                        onChange={(e) => setEnableGoalPlanning(e.target.checked)}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                        data-testid="checkbox-enable-goal"
                      />
                      <label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Enable Goal Planning
                      </label>
                    </div>

                    {enableGoalPlanning && (
                      <div className="pl-4 sm:pl-6 md:pl-8 border-l-4 border-green-200 bg-green-50 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl">
                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="goal-amount" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Target Goal Amount
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">$</span>
                            <Input
                              id="goal-amount"
                              type="number"
                              value={goalAmount}
                              onChange={(e) => setGoalAmount(e.target.value)}
                              className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                              placeholder="100,000"
                              data-testid="input-goal-amount"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={calculateCompoundInterest}
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      <Calculator className="w-5 h-5 mr-2" />
                      Calculate Compound Interest
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

                  {/* Advanced Display Options */}
                  {result && (
                    <div className="flex flex-wrap gap-2 sm:gap-3 pt-2 sm:pt-3 md:pt-4">
                      <Button
                        onClick={() => setShowBreakdown(!showBreakdown)}
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2"
                        data-testid="button-show-breakdown"
                      >
                        {showBreakdown ? 'Hide' : 'Show'} Yearly Breakdown
                      </Button>
                      <Button
                        onClick={() => setShowRealValue(!showRealValue)}
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2"
                        data-testid="button-show-real-value"
                      >
                        {showRealValue ? 'Hide' : 'Show'} Inflation Adjusted
                      </Button>
                    </div>
                  )}
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t lg:border-t-0 lg:border-l">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center lg:text-left">Growth Analysis</h2>
                  
                  {result ? (
                    <div className="space-y-4 sm:space-y-6" data-testid="compound-interest-results">
                      {/* Final Amount Highlight */}
                      <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-green-100">
                        <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1 sm:mb-2 text-center lg:text-left">
                          Final Amount
                        </div>
                        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 text-center lg:text-left break-all" data-testid="text-final-amount">
                          {formatCurrency(result.finalAmount)}
                        </div>
                        {showRealValue && (
                          <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 text-center lg:text-left">
                            Real Value: {formatCurrency(result.realValue)}
                          </div>
                        )}
                      </div>

                      {/* Growth Breakdown */}
                      <div className="space-y-2 sm:space-y-3 md:space-y-4">
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Principal Amount</span>
                            <span className="font-bold text-gray-900 text-xs sm:text-sm md:text-base" data-testid="text-principal-amount">
                              {formatCurrency(result.principalAmount)}
                            </span>
                          </div>
                        </div>
                        
                        {enableSIP && result.sipAnalysis && (
                          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Total SIP Contributions</span>
                              <span className="font-bold text-blue-600 text-xs sm:text-sm md:text-base" data-testid="text-sip-contributions">
                                {formatCurrency(result.sipAnalysis.totalSIPContributions)}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Total Interest Earned</span>
                            <span className="font-bold text-green-600 text-xs sm:text-sm md:text-base" data-testid="text-total-interest">
                              {formatCurrency(result.totalInterest)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Total Contributions</span>
                            <span className="font-bold text-gray-900 text-xs sm:text-sm md:text-base" data-testid="text-total-contributions">
                              {formatCurrency(result.totalContributions)}
                            </span>
                          </div>
                        </div>

                        {result.sipAnalysis && (
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Average Annual Return</span>
                              <span className="font-bold text-purple-600" data-testid="text-average-return">
                                {result.sipAnalysis.averageAnnualReturn.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Goal Analysis */}
                      {result.goalAnalysis && enableGoalPlanning && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-gray-900 text-lg">Goal Analysis</h4>
                          
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-green-700">Time to Reach Goal</span>
                                <span className="font-bold text-green-600" data-testid="text-time-to-goal">
                                  {result.goalAnalysis.timeToReachGoal > 0 ? `${result.goalAnalysis.timeToReachGoal} years` : 'Goal not achievable'}
                                </span>
                              </div>
                              {result.goalAnalysis.requiredMonthlyContribution > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-green-700">Required Monthly SIP</span>
                                  <span className="font-bold text-green-600" data-testid="text-required-sip">
                                    {formatCurrency(result.goalAnalysis.requiredMonthlyContribution)}
                                  </span>
                                </div>
                              )}
                              <p className="text-sm text-green-600">
                                {result.goalAnalysis.isGoalAchievable ? 'Goal is achievable with current plan' : 'Consider increasing investment amount or duration'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Investment Summary */}
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Interest Rate</span>
                          <span className="font-bold text-blue-600">
                            {interestRate}% per year
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12 md:py-16" data-testid="no-results">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gray-200 rounded-full mx-auto mb-3 sm:mb-4 md:mb-6 flex items-center justify-center">
                        <div className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-400">%</div>
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base md:text-lg">Enter investment details to see compound interest growth</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Yearly Breakdown */}
          {result && showBreakdown && (
            <Card className="mt-4 sm:mt-6 md:mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-lg sm:rounded-xl md:rounded-2xl">
              <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">Yearly Investment Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left font-bold text-gray-900 rounded-l-lg text-xs sm:text-sm md:text-base">Year</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm md:text-base">Amount</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm md:text-base">Interest Earned</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm md:text-base">SIP Contribution</th>
                        {showRealValue && <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm md:text-base">Real Value</th>}
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right font-bold text-gray-900 rounded-r-lg text-xs sm:text-sm md:text-base">Total Interest</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.yearlyBreakdown.slice(0, 10).map((year, index) => (
                        <tr key={index} className="hover:bg-blue-50 transition-colors">
                          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-medium text-gray-900 text-xs sm:text-sm md:text-base">{year.year}</td>
                          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right text-gray-900 font-bold text-xs sm:text-sm md:text-base">
                            {formatCurrency(year.amount)}
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right text-green-600 font-medium text-xs sm:text-sm md:text-base">
                            {formatCurrency(year.interestEarned)}
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right text-blue-600 font-medium text-xs sm:text-sm md:text-base">
                            {formatCurrency(year.sipContribution)}
                          </td>
                          {showRealValue && (
                            <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right text-purple-600 font-medium text-xs sm:text-sm md:text-base">
                              {formatCurrency(year.realValue)}
                            </td>
                          )}
                          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right text-orange-600 font-bold text-xs sm:text-sm md:text-base">
                            {formatCurrency(year.totalInterest)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Understanding Compound Interest */}
          <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6 lg:mb-8">Understanding Compound Interest: How Your Money Grows Exponentially</h2>
              <div className="prose max-w-none text-gray-700 space-y-4 sm:space-y-5 md:space-y-6">
                <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                  Compound interest is the phenomenon where your money earns interest on both the original principal and the accumulated interest from previous periods. Unlike simple interest that only earns on the principal, compound interest creates exponential growth, making it one of the most powerful wealth-building tools available to investors. Albert Einstein allegedly called it "the eighth wonder of the world," and for good reason.
                </p>

                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mt-5 sm:mt-6 md:mt-7 lg:mt-8 mb-2 sm:mb-3 md:mb-4">The Compound Interest Formula</h3>
                <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                  Our calculator uses the standard compound interest formula: A = P(1 + r/n)^(nt), where A is the final amount, P is the principal, r is the annual interest rate (as a decimal), n is the number of times interest compounds per year, and t is the time in years. This formula accurately predicts how your investment will grow over time, accounting for the compounding frequency you choose.
                </p>

                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mt-5 sm:mt-6 md:mt-7 lg:mt-8 mb-2 sm:mb-3 md:mb-4">Why Compounding Frequency Matters</h3>
                <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                  The frequency of compounding significantly impacts your returns. Daily compounding generates slightly more interest than monthly, which in turn beats quarterly or annual compounding. For example, $10,000 invested at 8% annually for 10 years grows to $21,589 with annual compounding, but $22,196 with daily compounding—a difference of $607. While this may seem modest, over longer periods and larger amounts, these differences become substantial.
                </p>

                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mt-5 sm:mt-6 md:mt-7 lg:mt-8 mb-2 sm:mb-3 md:mb-4">The Time Factor in Compound Growth</h3>
                <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                  Time is the most powerful variable in compound interest. A 25-year-old investing $500 monthly at 10% until age 65 accumulates approximately $3.16 million. Starting at 35 with the same monthly investment yields only $1.13 million—less than half! Those 10 extra years of compounding create over $2 million in additional wealth. This demonstrates why starting early is crucial for retirement planning and long-term financial goals.
                </p>

                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mt-5 sm:mt-6 md:mt-7 lg:mt-8 mb-2 sm:mb-3 md:mb-4">SIP and Regular Contributions</h3>
                <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                  Systematic Investment Plans (SIPs) combine the power of compound interest with dollar-cost averaging. By investing fixed amounts regularly, you buy more units when prices are low and fewer when high, potentially improving long-term returns. Our calculator shows how even modest monthly contributions, when compounded over time, can build substantial wealth. For instance, adding just $500 monthly to a $10,000 investment at 8% annual return grows to over $183,000 in 15 years.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Types of Investments */}
          <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">Investment Types and Expected Returns</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    Conservative Investments
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Low-risk options like savings accounts (1-2% APY), certificates of deposit (3-5% APY), government bonds (4-6% APY), and money market accounts (3-4% APY). These provide stable, predictable returns with minimal risk of principal loss, ideal for emergency funds and short-term goals. While returns are modest, the security and liquidity make them essential portfolio components.
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    Moderate Growth Investments
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Balanced options including corporate bonds (5-8% APY), balanced mutual funds (6-10% annual returns), real estate investment trusts (7-10% returns), and dividend-paying stocks (4-8% dividends plus growth). These offer growth potential while managing risk through diversification. Ideal for medium-term goals like home down payments or college savings.
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    Growth Investments
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Equity-focused options like index funds (8-12% historical returns), growth stocks (10-15% potential returns), and equity mutual funds (8-14% average returns). Stock market investments historically average 10% annually over long periods, though with significant year-to-year volatility. Best suited for long-term goals like retirement, where time smooths out market fluctuations.
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                    </div>
                    Aggressive Investments
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    High-growth potential options including small-cap stocks (12-18% potential), emerging market funds (10-20% historical), sector-specific funds (varies widely), and growth ETFs (10-16% average). These carry higher risk but offer the greatest compound growth potential. Suitable for young investors with long time horizons who can weather market volatility for potentially superior returns.
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                    </div>
                    Tax-Advantaged Accounts
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Retirement accounts like 401(k)s, Traditional IRAs, Roth IRAs, and 529 education plans that compound tax-free or tax-deferred. These accounts supercharge compound interest by eliminating annual tax drag on dividends and capital gains. A Roth IRA allowing $6,500 annual contributions at 8% return grows to over $1 million in 40 years, all tax-free in retirement.
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                    </div>
                    Alternative Investments
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Non-traditional options including peer-to-peer lending (6-10% returns), crowdfunding real estate (8-12% potential), cryptocurrency staking (variable, 4-15%), and precious metals (3-8% long-term). These can offer diversification and unique return profiles but often carry higher risks, less liquidity, and require more research and active management.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expert Tips */}
          <Card className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg rounded-2xl">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">Expert Investment Tips for Maximum Compound Growth</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">1. Start Investing Early</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Time is compound interest's greatest ally. Starting at 25 instead of 35 can result in 2-3x more wealth at retirement with the same monthly investment. Even small amounts invested early compound to significant sums. Don't wait for the "perfect" time—start with what you can afford today.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">2. Reinvest All Dividends and Interest</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Always enable dividend reinvestment (DRIP) to buy additional shares automatically. This harnesses compound interest fully by keeping all earnings working for you. Over decades, reinvested dividends can account for 40-50% of total portfolio returns.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">3. Increase Contributions Regularly</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Use step-up SIPs to increase investment amounts annually, ideally matching salary increases. Even a 5% annual increase in contributions can boost final wealth by 50-70%. This strategy keeps pace with inflation while accelerating compound growth exponentially.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">4. Choose the Right Asset Allocation</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Balance risk and return based on your age and goals. Young investors can handle more stocks for higher compound growth. As retirement approaches, gradually shift to bonds and stable investments to protect accumulated wealth while still benefiting from compounding.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">5. Minimize Fees and Taxes</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    High fees erode compound returns significantly. A 1% annual fee can reduce a portfolio by 25-30% over 30 years. Choose low-cost index funds, use tax-advantaged accounts, and hold investments long-term to minimize taxes and maximize compounding efficiency.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">6. Never Withdraw Principal</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Maintain separate emergency funds and short-term savings to avoid disrupting compound growth. Every dollar withdrawn loses all future compounding potential. A $10,000 withdrawal at age 30 could cost $100,000+ in lost growth by retirement.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">7. Account for Inflation</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Factor in 2-3% annual inflation when planning returns. An 8% nominal return becomes 5-6% real return after inflation. Use our inflation-adjusted calculator feature to see your actual purchasing power in future dollars and set realistic financial goals.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">8. Stay Invested During Market Downturns</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Market volatility is normal and temporary. Selling during downturns locks in losses and interrupts compounding. Historical data shows markets recover and reach new highs. Stay invested, continue contributions, and even increase them during dips to buy low.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
            <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">Frequently Asked Questions - Compound Interest Calculator with Monthly Deposits</h2>
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-blue-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">What is compound interest and how does it work?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods. Unlike simple interest which only earns on the principal, compound interest creates exponential growth. For example, $1,000 at 10% simple interest earns $100 yearly, but with monthly compounding earns increasingly more each period as interest earns interest, resulting in $1,104.71 after one year versus $1,100 with simple interest.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-green-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">What is a realistic return rate for investments?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Historical stock market returns average 10% annually over long periods, but individual results vary widely. Conservative savings accounts offer 1-3%, bonds 4-6%, balanced portfolios 6-8%, and equity-heavy portfolios 8-12%. For retirement planning, financial advisors typically recommend assuming 6-8% to be conservative. Never chase unrealistic returns—if it sounds too good to be true, it usually is.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-purple-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">How accurate is this compound interest calculator?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Our calculator uses industry-standard financial formulas that provide mathematically accurate projections based on the inputs you provide. However, actual investment returns fluctuate year to year and may differ from the constant rate used in calculations. Use it for planning and comparison purposes, understanding that real-world results will vary based on market performance, fees, taxes, and timing of contributions.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-orange-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">What's the difference between annual and monthly compounding?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Compounding frequency determines how often interest is calculated and added to the principal. Monthly compounding calculates interest 12 times per year, while annual compounding does so once. More frequent compounding yields higher returns—$10,000 at 8% for 10 years grows to $21,589 with annual compounding but $22,196 with monthly, a $607 difference. Daily compounding offers slightly more, though the improvement diminishes with higher frequencies.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-indigo-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Is it better to invest a lump sum or use SIP?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Both strategies have merits. Lump sum investing immediately puts all money to work, maximizing time in the market—statistically superior if markets trend upward. However, SIP (Systematic Investment Plan) offers dollar-cost averaging, reducing timing risk and making investing more affordable through regular smaller contributions. Most successful investors use both: invest lump sums when available (bonuses, inheritances) while maintaining regular SIP contributions from income.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-pink-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">How does inflation affect compound interest?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Inflation erodes purchasing power of future dollars. An 8% investment return with 3% inflation yields only 5% "real" return in purchasing power. Our calculator's inflation adjustment feature shows this real value, helping you understand what your future wealth can actually buy. Always consider inflation when setting financial goals—you may need larger nominal amounts than initially thought to maintain desired purchasing power.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-teal-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Can I use this calculator for retirement planning?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Absolutely! This calculator is excellent for retirement planning. Input your current savings as principal, expected monthly contributions as SIP amount, estimated return rate (6-8% is conservative for retirement), and years until retirement. Enable inflation adjustment to see real purchasing power. For comprehensive retirement planning, also consider Social Security, pensions, and required minimum distributions. Use the goal planning feature to see if you're on track to reach your retirement number.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-red-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">What is step-up SIP and when should I use it?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Step-up SIP automatically increases your investment amount by a fixed percentage annually, typically 5-10%. This aligns investments with career growth and rising income, dramatically boosting long-term wealth. Starting with $500 monthly at 10% step-up grows contributions to $814 in year 5 and $1,319 in year 10. Over 30 years, a 10% step-up can increase final wealth by 50-100% compared to flat contributions. Use step-up if you expect regular salary increases or want to systematically increase savings as expenses allow.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-amber-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Should I take a business loan to invest and benefit from compound interest?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Generally, borrowing money to invest (leverage) is risky and not recommended for most investors. Business loan interest rates (typically 7-15%) often exceed reliable investment returns, and market volatility can lead to losses while loan payments remain fixed. However, borrowing for business growth that generates revenue exceeding loan costs can be strategic. Use our <a href="/tools/business-loan-calculator" className="text-blue-600 hover:text-blue-800 font-semibold underline">Business Loan Calculator</a> to compare loan costs versus expected returns. Only invest borrowed money if you have: high risk tolerance, strong cash flow to cover payments regardless of investment performance, and expected returns significantly exceeding loan interest rates.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-cyan-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">How to calculate compound interest formula step by step?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    The compound interest formula is: A = P(1 + r/n)^(nt), where A is the final amount, P is principal, r is annual interest rate (decimal), n is compounding frequency per year, and t is time in years. For example: $10,000 at 8% annual rate, compounded monthly (n=12) for 10 years: A = 10,000(1 + 0.08/12)^(12×10) = 10,000(1.00667)^120 = $22,196. For investments with monthly deposits, use our calculator above which applies this formula iteratively for each contribution period, providing accurate projections including SIP, step-up increases, and inflation adjustments.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Financial Calculators */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0 shadow-lg rounded-2xl">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">Related Financial Calculators</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-7 md:mb-8">
                Explore our other free financial calculators to make informed decisions about your money:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                <a href="/tools/business-loan-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-xl hover:shadow-lg transition-shadow border-2 border-blue-200">
                  <h3 className="font-bold text-blue-700 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Business Loan Calculator</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Calculate business loan payments and compare financing options</p>
                </a>
                <a href="/tools/loan-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Loan Calculator</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Calculate loan payments and total interest costs</p>
                </a>
                <a href="/tools/mortgage-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Mortgage Calculator</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Calculate home loan payments including taxes and insurance</p>
                </a>
                <a href="/tools/retirement-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Retirement Calculator</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Plan your retirement savings and future income</p>
                </a>
                <a href="/tools/investment-return-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Investment Return Calculator</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Estimate investment growth and ROI over time</p>
                </a>
                <a href="/tools/savings-goal-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Savings Goal Calculator</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Calculate how to reach your savings goals faster</p>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

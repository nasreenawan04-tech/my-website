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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface InvestmentResult {
  futureValue: number;
  totalContributions: number;
  totalGrowth: number;
  initialInvestment: number;
  monthlyContributions: number;
  totalMonthlyContributions: number;
  averageAnnualReturn: number;
  realValue: number;
  inflationAdjustedGains: number;
  yearlyBreakdown: Array<{
    year: number;
    startBalance: number;
    contributions: number;
    interestEarned: number;
    endBalance: number;
    realValue: number;
    cumulativeContributions: number;
  }>;
}

export default function FutureValueInvestmentCalculator() {
  const [initialInvestment, setInitialInvestment] = useState('10000');
  const [monthlyContribution, setMonthlyContribution] = useState('500');
  const [annualInterestRate, setAnnualInterestRate] = useState('8');
  const [investmentPeriod, setInvestmentPeriod] = useState('10');
  const [timeUnit, setTimeUnit] = useState('years');
  const [compoundFrequency, setCompoundFrequency] = useState('12');
  const [currency, setCurrency] = useState('USD');
  const [inflationRate, setInflationRate] = useState('3');
  const [enableMonthlyContributions, setEnableMonthlyContributions] = useState(true);
  const [showRealValue, setShowRealValue] = useState(false);
  const [showYearlyBreakdown, setShowYearlyBreakdown] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<InvestmentResult | null>(null);

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
    { code: 'PLN', name: 'Polish Złoty', symbol: 'zł' },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' }
  ];

  const calculateFutureValue = () => {
    const principal = parseFloat(initialInvestment);
    const monthlyContrib = enableMonthlyContributions ? parseFloat(monthlyContribution) : 0;
    const annualRate = parseFloat(annualInterestRate) / 100;
    const years = timeUnit === 'years' ? parseFloat(investmentPeriod) : parseFloat(investmentPeriod) / 12;
    const compoundsPerYear = parseFloat(compoundFrequency);
    const inflation = parseFloat(inflationRate) / 100;

    // Add NaN guards for all inputs
    if (isNaN(principal) || isNaN(monthlyContrib) || isNaN(annualRate) || isNaN(years) || isNaN(compoundsPerYear) || isNaN(inflation)) return;
    if (principal < 0 || annualRate < 0 || years <= 0 || compoundsPerYear <= 0) return;

    const periodRate = annualRate / compoundsPerYear;
    
    let currentBalance = principal;
    let totalContributions = principal;
    const yearlyBreakdown = [];
    
    // Calculate year by year
    for (let year = 1; year <= Math.ceil(years); year++) {
      const startBalance = currentBalance;
      const isPartialYear = year > years;
      const periodsInYear = isPartialYear ? (years - (year - 1)) * compoundsPerYear : compoundsPerYear;
      
      let yearlyContributions = 0;
      let interestEarned = 0;
      
      // Process each compounding period in the year
      for (let period = 1; period <= periodsInYear; period++) {
        // Apply compound interest first to existing balance
        const periodInterest = currentBalance * periodRate;
        currentBalance += periodInterest;
        interestEarned += periodInterest;
        
        // Then add monthly contribution if enabled (convert to per-period basis)
        if (monthlyContrib > 0) {
          const contributionPerPeriod = monthlyContrib * (12 / compoundsPerYear);
          currentBalance += contributionPerPeriod;
          yearlyContributions += contributionPerPeriod;
          totalContributions += contributionPerPeriod;
        }
      }
      
      const realValue = currentBalance / Math.pow(1 + inflation, year);
      
      yearlyBreakdown.push({
        year,
        startBalance,
        contributions: yearlyContributions,
        interestEarned,
        endBalance: currentBalance,
        realValue,
        cumulativeContributions: totalContributions
      });
    }

    const futureValue = currentBalance;
    const totalMonthlyContributions = monthlyContrib * (years * 12);
    const totalGrowth = futureValue - totalContributions;
    const averageAnnualReturn = totalContributions > 0 ? (Math.pow(futureValue / totalContributions, 1 / years) - 1) * 100 : 0;
    const realValue = futureValue / Math.pow(1 + inflation, years);
    const inflationAdjustedGains = realValue - totalContributions;

    setResult({
      futureValue,
      totalContributions,
      totalGrowth,
      initialInvestment: principal,
      monthlyContributions: monthlyContrib,
      totalMonthlyContributions,
      averageAnnualReturn,
      realValue,
      inflationAdjustedGains,
      yearlyBreakdown
    });
  };

  const resetCalculator = () => {
    setInitialInvestment('10000');
    setMonthlyContribution('500');
    setAnnualInterestRate('8');
    setInvestmentPeriod('10');
    setTimeUnit('years');
    setCompoundFrequency('12');
    setCurrency('USD');
    setInflationRate('3');
    setEnableMonthlyContributions(true);
    setShowRealValue(false);
    setShowYearlyBreakdown(false);
    setShowAdvanced(false);
    setResult(null);
  };

  const formatCurrency = (amount: number) => {
    const currencyMap: { [key: string]: { locale: string; currency: string } } = {
      USD: { locale: 'en-US', currency: 'USD' },
      EUR: { locale: 'de-DE', currency: 'EUR' },
      GBP: { locale: 'en-GB', currency: 'GBP' },
      JPY: { locale: 'ja-JP', currency: 'JPY' },
      CNY: { locale: 'zh-CN', currency: 'CNY' },
      INR: { locale: 'en-IN', currency: 'INR' },
      CAD: { locale: 'en-CA', currency: 'CAD' },
      AUD: { locale: 'en-AU', currency: 'AUD' },
      CHF: { locale: 'de-CH', currency: 'CHF' },
      SEK: { locale: 'sv-SE', currency: 'SEK' },
      NOK: { locale: 'nb-NO', currency: 'NOK' },
      DKK: { locale: 'da-DK', currency: 'DKK' },
      PLN: { locale: 'pl-PL', currency: 'PLN' },
      CZK: { locale: 'cs-CZ', currency: 'CZK' },
      HUF: { locale: 'hu-HU', currency: 'HUF' },
      BRL: { locale: 'pt-BR', currency: 'BRL' },
      MXN: { locale: 'es-MX', currency: 'MXN' },
      KRW: { locale: 'ko-KR', currency: 'KRW' },
      SGD: { locale: 'en-SG', currency: 'SGD' },
      HKD: { locale: 'zh-HK', currency: 'HKD' }
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
    return `${percentage.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Future Value Investment Calculator - Project Investment Growth | DapsiWow</title>
        <meta name="description" content="Free future value investment calculator to project investment growth over time. Calculate compound returns, monthly contributions, and retirement planning with inflation adjustments and detailed yearly breakdowns." />
        <meta name="keywords" content="future value calculator, investment calculator, compound interest calculator, retirement calculator, investment growth projector, financial planning calculator, wealth calculator" />
        <meta property="og:title" content="Future Value Investment Calculator - Project Investment Growth | DapsiWow" />
        <meta property="og:description" content="Calculate how your investments will grow over time with compound interest, monthly contributions, and inflation adjustments." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/future-value-investment-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Future Value Investment Calculator",
            "description": "Free online future value investment calculator to project investment growth over time with compound interest and monthly contributions.",
            "url": "https://dapsiwow.com/tools/future-value-investment-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Future value calculations",
              "Compound interest projections",
              "Monthly contribution planning",
              "Inflation adjustments",
              "Yearly breakdown analysis",
              "Multi-currency support",
              "Retirement planning"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-sm font-medium text-blue-700">Advanced Investment Projector</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Future Value Investment
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Project how your investments will grow over time with compound interest, monthly contributions, and inflation analysis
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Investment Configuration</h2>
                    <p className="text-gray-600">Enter your investment details to project future growth with compound interest</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Currency Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="currency" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Currency
                      </Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500" data-testid="select-currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((curr) => (
                            <SelectItem key={curr.code} value={curr.code}>
                              {curr.code} - {curr.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Compound Frequency */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Compound Frequency</Label>
                      <Select value={compoundFrequency} onValueChange={setCompoundFrequency}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500" data-testid="select-compound-frequency">
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

                    {/* Initial Investment */}
                    <div className="space-y-3">
                      <Label htmlFor="initial-investment" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Initial Investment
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                          {currencies.find(c => c.code === currency)?.symbol || '$'}
                        </span>
                        <Input
                          id="initial-investment"
                          type="number"
                          value={initialInvestment}
                          onChange={(e) => setInitialInvestment(e.target.value)}
                          className="h-14 pl-12 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="10,000"
                          step="0.01"
                          data-testid="input-initial-investment"
                        />
                      </div>
                    </div>

                    {/* Annual Interest Rate */}
                    <div className="space-y-3">
                      <Label htmlFor="annual-rate" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Annual Interest Rate
                      </Label>
                      <div className="relative">
                        <Input
                          id="annual-rate"
                          type="number"
                          value={annualInterestRate}
                          onChange={(e) => setAnnualInterestRate(e.target.value)}
                          className="h-14 pr-12 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="8.00"
                          step="0.01"
                          data-testid="input-annual-rate"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                      </div>
                    </div>

                    {/* Investment Period */}
                    <div className="md:col-span-2 space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Investment Period</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="number"
                          value={investmentPeriod}
                          onChange={(e) => setInvestmentPeriod(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="10"
                          min="1"
                          data-testid="input-investment-period"
                        />
                        <Select value={timeUnit} onValueChange={setTimeUnit}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500" data-testid="select-time-unit">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="years">Years</SelectItem>
                            <SelectItem value="months">Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-4 sm:space-y-6 border-t pt-6 sm:pt-8">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Advanced Options</h3>
                    
                    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between text-sm sm:text-base py-3 sm:py-4 h-auto"
                          data-testid="button-toggle-advanced"
                        >
                          <span className="flex items-center">
                            Advanced Investment Options
                          </span>
                          <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 sm:space-y-6 mt-4">
                        <Separator />
                        
                        {/* Investment and Contribution Settings */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Contribution Settings</h4>
                            
                            {/* Monthly Contributions Toggle */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Enable Monthly Contributions</Label>
                                <p className="text-xs text-gray-500">Add regular monthly investments to your portfolio</p>
                              </div>
                              <Switch
                                checked={enableMonthlyContributions}
                                onCheckedChange={setEnableMonthlyContributions}
                                data-testid="checkbox-monthly-contributions"
                              />
                            </div>
                            
                            {enableMonthlyContributions && (
                              <div className="space-y-2 border-l-4 border-blue-200 bg-blue-50 p-4 rounded-lg">
                                <Label htmlFor="monthly-contribution" className="text-xs sm:text-sm font-medium">
                                  Monthly Contribution Amount
                                </Label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                    {currencies.find(c => c.code === currency)?.symbol || '$'}
                                  </span>
                                  <Input
                                    id="monthly-contribution"
                                    type="number"
                                    value={monthlyContribution}
                                    onChange={(e) => setMonthlyContribution(e.target.value)}
                                    className="h-10 sm:h-12 pl-8 text-sm border-2 border-gray-200 rounded-lg"
                                    placeholder="500"
                                    step="0.01"
                                    data-testid="input-monthly-contribution"
                                  />
                                </div>
                                <p className="text-xs text-blue-600">Regular contributions can significantly boost long-term growth</p>
                              </div>
                            )}
                          </div>

                          {/* Economic and Display Settings */}
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Economic & Display Settings</h4>
                            
                            <div className="space-y-2">
                              <Label htmlFor="inflation-rate" className="text-xs sm:text-sm font-medium">
                                Expected Inflation Rate
                              </Label>
                              <div className="relative">
                                <Input
                                  id="inflation-rate"
                                  type="number"
                                  value={inflationRate}
                                  onChange={(e) => setInflationRate(e.target.value)}
                                  className="h-10 sm:h-12 pr-8 text-sm border-2 border-gray-200 rounded-lg"
                                  placeholder="3.00"
                                  step="0.01"
                                  data-testid="input-inflation-rate"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                              </div>
                              <p className="text-xs text-gray-500">Annual inflation rate for real value calculations</p>
                            </div>

                            <div className="space-y-3">
                              <Label className="text-xs sm:text-sm font-medium">Display Options</Label>
                              
                              <div className="flex items-center justify-between gap-2">
                                <div className="space-y-1 flex-1 min-w-0">
                                  <Label className="text-xs font-medium">Show Inflation-Adjusted Values</Label>
                                  <p className="text-xs text-gray-500">Display real purchasing power of future value</p>
                                </div>
                                <Switch
                                  checked={showRealValue}
                                  onCheckedChange={setShowRealValue}
                                  data-testid="checkbox-show-real-value"
                                />
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                <div className="space-y-1 flex-1 min-w-0">
                                  <Label className="text-xs font-medium">Show Yearly Breakdown Table</Label>
                                  <p className="text-xs text-gray-500">Detailed year-by-year investment growth analysis</p>
                                </div>
                                <Switch
                                  checked={showYearlyBreakdown}
                                  onCheckedChange={setShowYearlyBreakdown}
                                  data-testid="checkbox-show-yearly-breakdown"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      onClick={calculateFutureValue}
                      className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-lg"
                      data-testid="button-calculate-future-value"
                    >
                      Calculate Future Value
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="h-14 px-8 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 lg:p-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Investment Projection</h2>
                  
                  {result ? (
                    <div className="space-y-6">
                      {/* Future Value Display */}
                      <div className="bg-white rounded-xl p-6 border border-gray-100">
                        <div className="text-center space-y-2">
                          <div className="text-sm text-gray-600">Future Value</div>
                          <div className="text-4xl font-bold text-green-600">
                            {formatCurrency(result.futureValue)}
                          </div>
                          {showRealValue && (
                            <div className="text-sm text-gray-500">
                              Real Value: {formatCurrency(result.realValue)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Total Growth</div>
                            <div className="text-lg font-bold text-green-600">
                              {formatCurrency(result.totalGrowth)}
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Total Contributions</div>
                            <div className="text-lg font-bold text-blue-600">
                              {formatCurrency(result.totalContributions)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Initial Investment</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(result.initialInvestment)}
                          </span>
                        </div>
                        {enableMonthlyContributions && result.monthlyContributions > 0 && (
                          <>
                            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                              <span className="text-gray-600">Monthly Contributions</span>
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(result.monthlyContributions)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                              <span className="text-gray-600">Total Monthly Contributions</span>
                              <span className="font-semibold text-blue-600">
                                {formatCurrency(result.totalMonthlyContributions)}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Average Annual Return</span>
                          <span className="font-semibold text-green-600">
                            {formatPercentage(result.averageAnnualReturn)}
                          </span>
                        </div>
                        {showRealValue && (
                          <div className="flex justify-between items-center py-3">
                            <span className="text-gray-600">Inflation-Adjusted Gains</span>
                            <span className={`font-semibold ${result.inflationAdjustedGains >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(result.inflationAdjustedGains)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Growth Interpretation */}
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Analysis</h3>
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <p className="text-gray-700 leading-relaxed">
                            Your investment of {formatCurrency(result.initialInvestment)}
                            {enableMonthlyContributions && result.monthlyContributions > 0 && 
                              ` with monthly contributions of ${formatCurrency(result.monthlyContributions)}`
                            } is projected to grow to {formatCurrency(result.futureValue)} over the investment period.
                            This represents a total growth of {formatCurrency(result.totalGrowth)} 
                            ({formatPercentage((result.totalGrowth / result.totalContributions) * 100)}).
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-chart-line text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Project</h3>
                      <p className="text-gray-600">
                        Enter your investment details to see future value projections
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Yearly Breakdown Table */}
          {result && showYearlyBreakdown && (
            <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Yearly Growth Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold">Year</th>
                      <th className="text-right py-3 px-2 font-semibold">Start Balance</th>
                      <th className="text-right py-3 px-2 font-semibold">Contributions</th>
                      <th className="text-right py-3 px-2 font-semibold">Interest Earned</th>
                      <th className="text-right py-3 px-2 font-semibold">End Balance</th>
                      {showRealValue && <th className="text-right py-3 px-2 font-semibold">Real Value</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {result.yearlyBreakdown.map((year) => (
                      <tr key={year.year} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium">{year.year}</td>
                        <td className="py-3 px-2 text-right">{formatCurrency(year.startBalance)}</td>
                        <td className="py-3 px-2 text-right text-blue-600">{formatCurrency(year.contributions)}</td>
                        <td className="py-3 px-2 text-right text-green-600">{formatCurrency(year.interestEarned)}</td>
                        <td className="py-3 px-2 text-right font-semibold">{formatCurrency(year.endBalance)}</td>
                        {showRealValue && <td className="py-3 px-2 text-right text-gray-600">{formatCurrency(year.realValue)}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* How to Use Section */}
          <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use the Future Value Calculator</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Step-by-Step Guide</h3>
                <ol className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">1</span>
                    <span>Select your currency and compound frequency</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">2</span>
                    <span>Enter your initial investment amount</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">3</span>
                    <span>Set expected annual interest rate and investment period</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">4</span>
                    <span>Optionally enable monthly contributions and set inflation rate</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">5</span>
                    <span>Click "Calculate Future Value" to see your investment projection</span>
                  </li>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Best Practices</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <i className="fas fa-chart-line text-green-500 mr-2"></i>
                    Use conservative return estimates (6-8% annually)
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-calendar text-blue-500 mr-2"></i>
                    Include realistic inflation rates (2-4%)
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-coins text-yellow-500 mr-2"></i>
                    Start with small, consistent monthly contributions
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-clock text-purple-500 mr-2"></i>
                    Take advantage of compound growth over longer periods
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-shield-alt text-orange-500 mr-2"></i>
                    Consider diversified investment portfolios
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-piggy-bank text-pink-500 mr-2"></i>
                    Review and adjust projections regularly
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
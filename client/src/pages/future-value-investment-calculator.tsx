import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
  const [enableInflationAdjustment, setEnableInflationAdjustment] = useState(false);
  const [showYearlyBreakdown, setShowYearlyBreakdown] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [taxRate, setTaxRate] = useState('0');
  const [enableTaxCalculation, setEnableTaxCalculation] = useState(false);
  const [showRealTimeProjection, setShowRealTimeProjection] = useState(false);
  const [contributionGrowthRate, setContributionGrowthRate] = useState('0');
  const [enableContributionGrowth, setEnableContributionGrowth] = useState(false);
  const [result, setResult] = useState<InvestmentResult | null>(null);

  const calculateFutureValue = () => {
    const principal = parseFloat(initialInvestment);
    const monthlyContrib = enableMonthlyContributions ? parseFloat(monthlyContribution) : 0;
    const annualRate = parseFloat(annualInterestRate) / 100;
    const years = timeUnit === 'years' ? parseFloat(investmentPeriod) : parseFloat(investmentPeriod) / 12;
    const compoundsPerYear = parseFloat(compoundFrequency);
    const inflation = parseFloat(inflationRate) / 100;

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
    setEnableInflationAdjustment(false);
    setShowYearlyBreakdown(false);
    setShowAdvanced(false);
    setTaxRate('0');
    setEnableTaxCalculation(false);
    setShowRealTimeProjection(false);
    setContributionGrowthRate('0');
    setEnableContributionGrowth(false);
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
        <title>Future Value Investment Calculator - Calculate Investment Growth | DapsiWow</title>
        <meta name="description" content="Free future value investment calculator to project investment growth over time. Calculate compound returns, monthly contributions, and retirement planning with inflation adjustments. Supports multiple currencies and compound frequencies." />
        <meta name="keywords" content="future value calculator, investment calculator, compound interest calculator, retirement calculator, investment growth calculator, wealth calculator, financial planning calculator, compound returns calculator, investment projector, future value formula" />
        <meta property="og:title" content="Future Value Investment Calculator - Calculate Investment Growth | DapsiWow" />
        <meta property="og:description" content="Calculate how your investments will grow over time with compound interest, monthly contributions, and inflation adjustments. Free online tool with detailed yearly breakdowns." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/future-value-investment-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Future Value Investment Calculator",
            "description": "Free online future value investment calculator to project investment growth over time with compound interest, monthly contributions, and inflation adjustments.",
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
                <span className="text-sm font-medium text-blue-700">Professional Investment Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Future Value Investment
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Project how your investments will grow over time with compound interest and regular contributions
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Input Section */}
                <div className="p-4 sm:p-6 lg:p-8 xl:p-12 space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Investment Configuration</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your investment details to calculate future value and growth projections</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Currency Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="currency" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Currency
                      </Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-currency">
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
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Compound Frequency</Label>
                      <Select value={compoundFrequency} onValueChange={setCompoundFrequency}>
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-compound-frequency">
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
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="initial-investment"
                          type="number"
                          value={initialInvestment}
                          onChange={(e) => setInitialInvestment(e.target.value)}
                          className="h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="10000"
                          min="0"
                          step="100"
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
                          className="h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="8.00"
                          step="0.01"
                          data-testid="input-annual-rate"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                      </div>
                    </div>

                    {/* Investment Period */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Investment Period</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="number"
                          value={investmentPeriod}
                          onChange={(e) => setInvestmentPeriod(e.target.value)}
                          className="h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="10"
                          min="1"
                          data-testid="input-investment-period"
                        />
                        <Select value={timeUnit} onValueChange={setTimeUnit}>
                          <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-time-unit">
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
                    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-3 sm:p-4 text-left hover:bg-gray-50 rounded-xl"
                          data-testid="button-toggle-advanced"
                        >
                          <span className="font-semibold text-gray-900 text-sm sm:text-base">Advanced Options</span>
                          <span className="text-xl sm:text-2xl">{showAdvanced ? '−' : '+'}</span>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 sm:space-y-6 mt-4">
                        <Separator />

                        {/* Investment and Display Options */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Investment Options</h4>


                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Enable Monthly Contributions</Label>
                                <p className="text-xs text-gray-500">Add regular monthly investments to your portfolio</p>
                              </div>
                              <Switch
                                checked={enableMonthlyContributions}
                                onCheckedChange={(value) => setEnableMonthlyContributions(value)}
                                data-testid="switch-monthly-contributions"
                              />
                            </div>

                            {enableMonthlyContributions && (
                              <div className="space-y-2 ml-4 pl-4 border-l-2 border-blue-200">
                                <Label className="text-xs sm:text-sm font-medium">Monthly Contribution Amount</Label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                  <Input
                                    value={monthlyContribution}
                                    onChange={(e) => setMonthlyContribution(e.target.value)}
                                    placeholder="500"
                                    className="text-sm h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                    data-testid="input-monthly-contribution"
                                  />
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Enable Contribution Growth</Label>
                                <p className="text-xs text-gray-500">Increase contributions annually by percentage</p>
                              </div>
                              <Switch
                                checked={enableContributionGrowth}
                                onCheckedChange={(value) => setEnableContributionGrowth(value)}
                                data-testid="switch-contribution-growth"
                              />
                            </div>

                            {enableContributionGrowth && (
                              <div className="space-y-2 ml-4 pl-4 border-l-2 border-green-200">
                                <Label className="text-xs sm:text-sm font-medium">Annual Contribution Growth Rate</Label>
                                <div className="relative">
                                  <Input
                                    value={contributionGrowthRate}
                                    onChange={(e) => setContributionGrowthRate(e.target.value)}
                                    placeholder="3.00"
                                    className="text-sm h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                    data-testid="input-contribution-growth-rate"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Enable Tax Calculations</Label>
                                <p className="text-xs text-gray-500">Apply tax rate to investment gains</p>
                              </div>
                              <Switch
                                checked={enableTaxCalculation}
                                onCheckedChange={(value) => setEnableTaxCalculation(value)}
                                data-testid="switch-tax-calculation"
                              />
                            </div>

                            {enableTaxCalculation && (
                              <div className="space-y-2 ml-4 pl-4 border-l-2 border-red-200">
                                <Label className="text-xs sm:text-sm font-medium">Tax Rate on Gains</Label>
                                <div className="relative">
                                  <Input
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(e.target.value)}
                                    placeholder="25.00"
                                    className="text-sm h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                    data-testid="input-tax-rate"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Display and Analysis Options */}
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Display Options</h4>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Show Inflation-Adjusted Values</Label>
                                <p className="text-xs text-gray-500">Display real purchasing power impact</p>
                              </div>
                              <Switch
                                checked={enableInflationAdjustment}
                                onCheckedChange={(value) => setEnableInflationAdjustment(value)}
                                data-testid="switch-inflation-adjustment"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Show Real-Time Projection</Label>
                                <p className="text-xs text-gray-500">Display live calculations as you type</p>
                              </div>
                              <Switch
                                checked={showRealTimeProjection}
                                onCheckedChange={(value) => setShowRealTimeProjection(value)}
                                data-testid="switch-real-time-projection"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Show Yearly Breakdown</Label>
                                <p className="text-xs text-gray-500">Display detailed year-by-year analysis</p>
                              </div>
                              <Switch
                                checked={showYearlyBreakdown}
                                onCheckedChange={(value) => setShowYearlyBreakdown(value)}
                                data-testid="switch-yearly-breakdown"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Inflation Rate</Label>
                              <div className="relative">
                                <Input
                                  value={inflationRate}
                                  onChange={(e) => setInflationRate(e.target.value)}
                                  placeholder="3.00"
                                  className="text-sm h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                  data-testid="input-inflation-rate-advanced"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                              </div>
                              <p className="text-xs text-gray-500">Expected annual inflation rate for real value calculations</p>
                            </div>
                          </div>
                        </div>

                        <Separator />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={calculateFutureValue}
                      className="flex-1 h-12 sm:min-w-[140px] bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Value
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="flex-1 h-12 sm:min-w-[120px] bg-transparent hover:bg-white/10 text-white border border-white/50 rounded-xl font-semibold"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>


                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-4 sm:p-6 lg:p-8 xl:p-12">
                  <div className="space-y-6 sm:space-y-8">
                    <div className="text-center">
                      <h3 className="text-xl sm:text-2xl font-bold mb-2">Investment Projection</h3>
                      <p className="text-sm sm:text-base text-blue-100">Based on your investment parameters</p>
                    </div>

                    {result ? (
                      <div className="space-y-6" data-testid="investment-results">
                        {/* Future Value Highlight */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center">
                          <div className="text-2xl sm:text-3xl font-bold mb-2 break-all">{formatCurrency(result.futureValue)}</div>
                          <div className="text-sm sm:text-base text-blue-100">Future Value</div>
                        </div>

                        {/* Investment Breakdown */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center">
                            <div className="text-xl sm:text-2xl font-bold mb-2 break-all">{formatCurrency(result.totalContributions)}</div>
                            <div className="text-sm sm:text-base text-blue-100">Total Invested</div>
                          </div>

                          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center">
                            <div className="text-xl sm:text-2xl font-bold mb-2 break-all">{formatCurrency(result.totalGrowth)}</div>
                            <div className="text-sm sm:text-base text-blue-100">Total Growth</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-lg sm:text-xl font-semibold">{result.averageAnnualReturn.toFixed(2)}%</div>
                            <div className="text-blue-200 text-xs sm:text-sm">Avg Annual Return</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg sm:text-xl font-semibold break-all">{formatCurrency(result.monthlyContributions)}</div>
                            <div className="text-blue-200 text-xs sm:text-sm">Monthly Investment</div>
                          </div>
                        </div>

                        {/* Inflation Adjusted Benefits */}
                        {enableInflationAdjustment && (
                          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                            <h4 className="font-bold text-orange-800 mb-4 text-lg">Inflation Impact Analysis</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-orange-700 font-medium">Real Future Value:</span>
                                <span className="font-bold text-orange-800 text-lg">
                                  {formatCurrency(result.realValue)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-orange-700 font-medium">Inflation-Adjusted Gains:</span>
                                <span className={`font-bold text-lg ${result.inflationAdjustedGains >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                                  {formatCurrency(result.inflationAdjustedGains)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-16" data-testid="no-results">
                        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                          <div className="text-3xl font-bold text-gray-400">$</div>
                        </div>
                        <p className="text-gray-500 text-lg">Enter investment details to see future value projections</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Yearly Breakdown Table */}
          {showYearlyBreakdown && result && result.yearlyBreakdown && (
            <Card className="mt-6 sm:mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Year-by-Year Breakdown</h3>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="min-w-full px-4 sm:px-0">
                    <table className="w-full border-collapse min-w-[600px] sm:min-w-0">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-sm sm:text-base">Year</th>
                          <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-sm sm:text-base">Contributions</th>
                          <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-sm sm:text-base">Interest Earned</th>
                          <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-sm sm:text-base">End Balance</th>
                          {enableInflationAdjustment && (
                            <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-sm sm:text-base">Real Value</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {result.yearlyBreakdown.slice(0, 10).map((year) => (
                          <tr key={year.year} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-900 text-sm sm:text-base">{year.year}</td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-gray-900 text-sm sm:text-base">{formatCurrency(year.contributions)}</td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-green-600 text-sm sm:text-base">{formatCurrency(year.interestEarned)}</td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-right font-semibold text-gray-900 text-sm sm:text-base">{formatCurrency(year.endBalance)}</td>
                            {enableInflationAdjustment && (
                              <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-gray-600 text-sm sm:text-base">{formatCurrency(year.realValue)}</td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEO Content Section */}
          <div className="mt-12 space-y-8">
            {/* Investment Types Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Types of Investments for Future Value Calculation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Stocks and Equity Funds</h4>
                    <p className="text-gray-600">
                      Stock investments typically offer higher returns but with greater volatility. Use our calculator
                      with historical average returns of 7-10% annually to project long-term stock portfolio growth
                      and understand the impact of regular investing through dollar-cost averaging.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Bonds and Fixed Income</h4>
                    <p className="text-gray-600">
                      Bond investments provide steady, predictable returns. Calculate future values for government
                      bonds, corporate bonds, and bond funds with typical returns of 3-6% annually, perfect for
                      conservative investors seeking capital preservation with modest growth.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Mutual Funds and ETFs</h4>
                    <p className="text-gray-600">
                      Diversified funds offer balanced growth potential. Project future values for index funds,
                      sector-specific ETFs, and actively managed mutual funds to compare performance scenarios
                      and optimize your investment allocation strategy.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Retirement Accounts</h4>
                    <p className="text-gray-600">
                      401(k), IRA, and Roth IRA calculations are crucial for retirement planning. Use our tool
                      to project how regular contributions will grow in tax-advantaged accounts and plan for
                      a comfortable retirement with adequate savings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compound Interest Factors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Factors Affecting Investment Growth</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Initial Investment Amount</h4>
                      <p className="text-sm">Larger initial investments provide more capital for compound growth. Even small amounts can grow significantly over long periods due to compounding.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Interest Rate</h4>
                      <p className="text-sm">Higher returns accelerate wealth building, but consider risk tolerance. A 1% difference in annual returns can mean thousands in additional wealth over decades.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Time Horizon</h4>
                      <p className="text-sm">Time is the most powerful factor in compound growth. Starting early provides exponentially better results than waiting, even with smaller amounts.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Regular Contributions</h4>
                      <p className="text-sm">Consistent monthly investments can dramatically boost future value. Dollar-cost averaging also reduces market timing risk.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Investment Planning Strategies</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Dollar-Cost Averaging</h4>
                      <p className="text-sm text-blue-700">Invest a fixed amount regularly regardless of market conditions. This strategy reduces volatility impact and builds discipline.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Compound Frequency Optimization</h4>
                      <p className="text-sm text-green-700">Choose investments that compound more frequently. Daily compounding provides better growth than annual compounding.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Inflation Protection</h4>
                      <p className="text-sm text-orange-700">Ensure your investment returns exceed inflation rates to maintain real purchasing power over time.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Risk Diversification</h4>
                      <p className="text-sm text-purple-700">Spread investments across different asset classes to balance growth potential with risk management.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Future Value FAQs Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about Future Value</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What is the difference between simple and compound interest?</h4>
                      <p className="text-gray-600 text-sm">Simple interest is calculated only on the principal amount, while compound interest is calculated on both principal and previously earned interest. Compound interest leads to exponential growth over time.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does inflation affect my investment's future value?</h4>
                      <p className="text-gray-600 text-sm">Inflation reduces purchasing power over time. A 3% inflation rate means you need 3% investment growth just to maintain current buying power. Always consider real returns (returns minus inflation).</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's a realistic annual return for long-term investments?</h4>
                      <p className="text-gray-600 text-sm">Historical stock market averages suggest 7-10% annually, but past performance doesn't guarantee future results. Conservative estimates of 6-8% are often used for planning purposes.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I review my investment projections?</h4>
                      <p className="text-gray-600 text-sm">Review projections annually or when major life events occur. Market conditions, goals, and personal circumstances change, requiring periodic adjustments to your investment strategy.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is it better to invest a lump sum or make regular contributions?</h4>
                      <p className="text-gray-600 text-sm">Both strategies have merits. Lump sum investing can maximize time in market, while regular contributions provide dollar-cost averaging benefits and are more manageable for most people.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How do taxes affect future value calculations?</h4>
                      <p className="text-gray-600 text-sm">Taxes can significantly impact returns. Utilize tax-advantaged accounts and consider tax-efficient investment strategies to maximize growth.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What compound frequency should I use for calculations?</h4>
                      <p className="text-gray-600 text-sm">Use the frequency that matches your investment. Most mutual funds compound daily, while some bonds compound semi-annually. More frequent compounding increases future value slightly.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">When should I start investing for retirement?</h4>
                      <p className="text-gray-600 text-sm">The earlier, the better. Starting in your 20s allows decades of compound growth. Even small amounts invested early can outperform larger amounts invested later due to compounding.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Scenarios */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Conservative Investment</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Conservative portfolios focus on capital preservation with steady, modest growth.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Typical Returns:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Government bonds: 2-4% annually</li>
                        <li>High-grade corporate bonds: 3-5%</li>
                        <li>Money market funds: 1-3%</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Best For:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Near-retirement investors</li>
                        <li>Emergency fund building</li>
                        <li>Short-term goals (1-5 years)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Moderate Investment</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Balanced portfolios mix stocks and bonds for growth with manageable risk.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Typical Returns:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Balanced mutual funds: 5-7% annually</li>
                        <li>Target-date funds: 6-8%</li>
                        <li>Mixed portfolio: 5-8%</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Best For:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Medium-term goals (5-15 years)</li>
                        <li>Risk-balanced investors</li>
                        <li>General retirement planning</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Aggressive Investment</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Growth-focused portfolios emphasize stocks for maximum long-term appreciation.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Typical Returns:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Stock index funds: 7-10% annually</li>
                        <li>Growth stocks: 8-12%</li>
                        <li>Emerging markets: 6-15%</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Best For:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Young investors (20s-30s)</li>
                        <li>Long-term goals (15+ years)</li>
                        <li>High risk tolerance</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Common Mistakes Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Common Investment Planning Mistakes to Avoid</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Overestimating Returns</h4>
                      <p className="text-red-700 text-sm">Using unrealistic return assumptions can lead to inadequate savings. Conservative estimates ensure you're prepared for various market scenarios.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Ignoring Inflation</h4>
                      <p className="text-orange-700 text-sm">Failing to account for inflation means your purchasing power decreases over time. Always consider real returns in your planning.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Starting Too Late</h4>
                      <p className="text-yellow-700 text-sm">Delaying investment reduces the power of compound interest. Starting early, even with small amounts, is more effective than larger contributions later.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Neglecting Tax Implications</h4>
                      <p className="text-blue-700 text-sm">Taxes significantly impact returns. Utilize tax-advantaged accounts and consider tax-efficient investment strategies to maximize growth.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Emotional Decision Making</h4>
                      <p className="text-purple-700 text-sm">Market volatility can trigger emotional responses. Stick to your long-term plan and avoid panic selling during market downturns.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Insufficient Diversification</h4>
                      <p className="text-green-700 text-sm">Putting all money in one investment increases risk. Diversify across asset classes, sectors, and geographic regions for better risk management.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Retirement Planning Focus */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Using Future Value for Retirement Planning</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Retirement Savings Strategies</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Start with employer 401(k) match to get free money</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Maximize tax-advantaged account contributions</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Use target-date funds for automatic diversification</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Increase contributions with salary raises</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Retirement Income Planning</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Plan for 25-30 years of retirement expenses</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Account for healthcare cost inflation</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Consider Social Security benefits in planning</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Use 4% withdrawal rule for sustainability</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Retirement Planning Tip</h4>
                  <p className="text-blue-700 text-sm">
                    Use our future value calculator to project different retirement scenarios. Aim to replace 70-80%
                    of your pre-retirement income through a combination of savings, Social Security, and other retirement
                    benefits. Start early and let compound interest work in your favor.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
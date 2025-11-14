import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolSEOHead } from '@/components/seo/ToolSEOHead';
import { investmentReturnCalculatorSEO } from '@/config/seo/tools/investment-return-calculator';

interface InvestmentResult {
  finalValue: number;
  totalReturn: number;
  absoluteReturn: number;
  annualizedReturn: number;
  totalInterestEarned: number;
  roi: number;
  totalInvested: number;
  monthlyBreakdown?: Array<{
    month: number;
    contribution: number;
    growth: number;
    balance: number;
  }>;
}

export default function InvestmentReturnCalculator() {
  const [initialInvestment, setInitialInvestment] = useState('10000');
  const [monthlyContribution, setMonthlyContribution] = useState('500');
  const [expectedReturn, setExpectedReturn] = useState('8.00');
  const [investmentPeriod, setInvestmentPeriod] = useState('10');
  const [periodType, setPeriodType] = useState('years');
  const [compoundingFrequency, setCompoundingFrequency] = useState('monthly');
  const [currency, setCurrency] = useState('USD');
  const [inflationRate, setInflationRate] = useState('3.00');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [result, setResult] = useState<InvestmentResult | null>(null);

  const calculateInvestmentReturn = () => {
    const principal = parseFloat(initialInvestment) || 0;
    const monthlyAdd = parseFloat(monthlyContribution) || 0;
    const annualRate = parseFloat(expectedReturn) / 100;
    const years = periodType === 'years' ? parseFloat(investmentPeriod) : parseFloat(investmentPeriod) / 12;
    const inflation = parseFloat(inflationRate) / 100 || 0;

    if (principal < 0 || annualRate < 0 || years <= 0) return;

    let compoundingPeriods = 12; // Default to monthly
    if (compoundingFrequency === 'daily') compoundingPeriods = 365;
    else if (compoundingFrequency === 'weekly') compoundingPeriods = 52;
    else if (compoundingFrequency === 'quarterly') compoundingPeriods = 4;
    else if (compoundingFrequency === 'annually') compoundingPeriods = 1;

    const periodicRate = annualRate / compoundingPeriods;
    const totalPeriods = years * compoundingPeriods;

    // Calculate compound interest on initial investment
    const compoundValue = principal * Math.pow(1 + periodicRate, totalPeriods);

    // Calculate future value of monthly contributions (annuity)
    let monthlyContributionValue = 0;
    if (monthlyAdd > 0) {
      const monthlyRate = annualRate / 12;
      const monthlyPeriods = years * 12;
      monthlyContributionValue = monthlyAdd * ((Math.pow(1 + monthlyRate, monthlyPeriods) - 1) / monthlyRate);
    }

    const finalValue = compoundValue + monthlyContributionValue;
    const totalInvested = principal + (monthlyAdd * years * 12);
    const totalReturn = finalValue - totalInvested;
    const absoluteReturn = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
    const annualizedReturn = totalInvested > 0 ? (Math.pow(finalValue / totalInvested, 1 / years) - 1) * 100 : 0;
    const roi = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    // Generate monthly breakdown for first 5 years
    const monthlyBreakdown = [];
    let currentBalance = principal;
    const monthlyRate = annualRate / 12;

    for (let month = 1; month <= Math.min(60, years * 12); month++) {
      const growth = currentBalance * monthlyRate;
      currentBalance = currentBalance + growth + monthlyAdd;

      monthlyBreakdown.push({
        month,
        contribution: monthlyAdd,
        growth: Math.round(growth * 100) / 100,
        balance: Math.round(currentBalance * 100) / 100
      });
    }

    setResult({
      finalValue: Math.round(finalValue * 100) / 100,
      totalReturn: Math.round(totalReturn * 100) / 100,
      absoluteReturn: Math.round(absoluteReturn * 100) / 100,
      annualizedReturn: Math.round(annualizedReturn * 100) / 100,
      totalInterestEarned: Math.round(totalReturn * 100) / 100,
      roi: Math.round(roi * 100) / 100,
      totalInvested: Math.round(totalInvested * 100) / 100,
      monthlyBreakdown
    });
  };

  const resetCalculator = () => {
    setInitialInvestment('10000');
    setMonthlyContribution('500');
    setExpectedReturn('8.00');
    setInvestmentPeriod('10');
    setPeriodType('years');
    setCompoundingFrequency('monthly');
    setCurrency('USD');
    setInflationRate('3.00');
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
      <ToolSEOHead config={investmentReturnCalculatorSEO} />
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Investment Calculator</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0" data-testid="page-title">
                <span className="block">Investment Return</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Calculate investment growth with compound interest, monthly contributions, and inflation adjustment
              </p>
            </div>
          </div>
        </section>

        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 lg:py-16">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Input Section */}
                <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Investment Configuration</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your investment details to calculate potential returns</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Currency Selection */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="currency" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Currency
                      </Label>
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

                    {/* Initial Investment */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="initial-investment" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Initial Investment
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">$</span>
                        <Input
                          id="initial-investment"
                          type="number"
                          value={initialInvestment}
                          onChange={(e) => setInitialInvestment(e.target.value)}
                          className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                          placeholder="10,000"
                          min="0"
                          data-testid="input-initial-investment"
                        />
                      </div>
                    </div>

                    {/* Monthly Contribution */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="monthly-contribution" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Monthly Contribution
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">$</span>
                        <Input
                          id="monthly-contribution"
                          type="number"
                          value={monthlyContribution}
                          onChange={(e) => setMonthlyContribution(e.target.value)}
                          className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                          placeholder="500"
                          min="0"
                          data-testid="input-monthly-contribution"
                        />
                      </div>
                    </div>

                    {/* Expected Annual Return */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="expected-return" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Expected Annual Return
                      </Label>
                      <div className="relative">
                        <Input
                          id="expected-return"
                          type="number"
                          value={expectedReturn}
                          onChange={(e) => setExpectedReturn(e.target.value)}
                          className="h-10 sm:h-12 md:h-14 pr-6 sm:pr-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                          placeholder="8.00"
                          step="0.01"
                          min="0"
                          data-testid="input-expected-return"
                        />
                        <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">%</span>
                      </div>
                    </div>

                    {/* Investment Period */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Investment Period</Label>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <Input
                          type="number"
                          value={investmentPeriod}
                          onChange={(e) => setInvestmentPeriod(e.target.value)}
                          className="h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="10"
                          min="1"
                          data-testid="input-investment-period"
                        />
                        <Select value={periodType} onValueChange={setPeriodType}>
                          <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg" data-testid="select-period-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="years">Years</SelectItem>
                            <SelectItem value="months">Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Compounding Frequency */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Compounding Frequency</Label>
                      <Select value={compoundingFrequency} onValueChange={setCompoundingFrequency}>
                        <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-compounding">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-4 sm:space-y-6 border-t pt-4 sm:pt-6 md:pt-8">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Advanced Options</h3>

                    {/* Inflation Rate */}
                    <div className="space-y-3 sm:space-y-4 bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6">
                      <Label htmlFor="inflation-rate" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Annual Inflation Rate (Optional)
                      </Label>
                      <div className="relative">
                        <Input
                          id="inflation-rate"
                          type="number"
                          value={inflationRate}
                          onChange={(e) => setInflationRate(e.target.value)}
                          className="h-10 sm:h-12 pr-6 sm:pr-8 border-2 border-gray-200 rounded-lg text-sm sm:text-base w-full md:w-48"
                          placeholder="3.00"
                          step="0.01"
                          min="0"
                          max="50"
                          data-testid="input-inflation-rate"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base">%</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Adjust returns for inflation to see real purchasing power
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                    <Button
                      onClick={calculateInvestmentReturn}
                      className="flex-1 h-10 sm:h-12 md:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transition-colors duration-200"
                      data-testid="button-calculate"
                    >
                      Calculate Returns
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="h-10 sm:h-12 md:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>

                  {/* Advanced Options */}
                  {result && (
                    <div className="flex flex-wrap gap-2 sm:gap-3 pt-3 sm:pt-4">
                      <Button
                        onClick={() => setShowBreakdown(!showBreakdown)}
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2"
                        data-testid="button-show-breakdown"
                      >
                        {showBreakdown ? 'Hide' : 'Show'} Monthly Breakdown
                      </Button>
                    </div>
                  )}
                </div>

                {/* Results Section */}
                {result ? (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Investment Results</h2>

                    <div className="space-y-4 sm:space-y-6" data-testid="investment-results">
                      {/* Final Value Highlight */}
                      <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-lg border border-blue-100">
                        <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Final Investment Value</div>
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 break-all" data-testid="text-final-value">
                          {formatCurrency(result.finalValue)}
                        </div>
                      </div>

                      {/* Investment Breakdown */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Total Invested</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base" data-testid="text-total-invested">
                              {formatCurrency(result.totalInvested)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Total Returns</span>
                            <span className="font-bold text-green-600 text-sm sm:text-base" data-testid="text-total-return">
                              {formatCurrency(result.totalReturn)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Annualized Return</span>
                            <span className="font-bold text-purple-600 text-sm sm:text-base" data-testid="text-annualized-return">
                              {result.annualizedReturn.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-green-200">
                        <h4 className="font-bold text-green-800 mb-3 sm:mb-4 text-base sm:text-lg">Performance Metrics</h4>
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium text-sm sm:text-base">Absolute Return:</span>
                            <span className="font-bold text-green-800 text-base sm:text-lg" data-testid="text-absolute-return">
                              {result.absoluteReturn.toFixed(2)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium text-sm sm:text-base">ROI:</span>
                            <span className="font-bold text-green-800 text-base sm:text-lg" data-testid="text-roi">
                              {result.roi.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Visual Progress */}
                      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm">
                        <h4 className="font-bold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">Investment Growth</h4>
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-4 sm:h-6 mr-3 sm:mr-4">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-green-500 h-4 sm:h-6 rounded-full flex items-center justify-end pr-1 sm:pr-2"
                                style={{ 
                                  width: `${Math.min((result.totalReturn / result.finalValue) * 100, 100)}%` 
                                }}
                              >
                                <span className="text-white text-xs font-semibold">
                                  {((result.totalReturn / result.finalValue) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                            <span>Principal + Contributions</span>
                            <span>Returns Earned</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Investment Results</h2>
                    <div className="text-center py-8 sm:py-12 md:py-16" data-testid="no-results">
                      <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">$</div>
                      </div>
                      <p className="text-gray-500 text-base sm:text-lg">Enter investment details to calculate potential returns</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Breakdown */}
          {result && showBreakdown && result.monthlyBreakdown && (
            <Card className="mt-6 sm:mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Monthly Investment Breakdown (First 5 Years)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-gray-900 rounded-l-lg text-sm sm:text-base">Month</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-sm sm:text-base">Contribution</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-sm sm:text-base">Growth</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 rounded-r-lg text-sm sm:text-base">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.monthlyBreakdown.map((month, index) => (
                        <tr key={index} className="hover:bg-blue-50 transition-colors">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-gray-900 text-sm sm:text-base">{month.month}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-blue-600 font-bold text-sm sm:text-base">
                            {formatCurrency(month.contribution)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-green-600 font-medium text-sm sm:text-base">
                            {formatCurrency(month.growth)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-gray-900 font-bold text-sm sm:text-base">
                            {formatCurrency(month.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEO Content Section */}
          <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">What is an Investment Return Calculator?</h3>
                <div className="space-y-3 sm:space-y-4 text-gray-600">
                  <p className="text-sm sm:text-base">
                    An investment return calculator is a powerful financial tool that helps investors estimate the future value of their investments 
                    based on various parameters such as initial investment amount, monthly contributions, expected annual return rate, and investment 
                    duration. This calculator uses compound interest formulas to project how your money will grow over time.
                  </p>
                  <p className="text-sm sm:text-base">
                    Our advanced investment return calculator supports multiple currencies, various compounding frequencies, and inflation adjustment features, 
                    providing comprehensive analysis for both novice and experienced investors worldwide. Whether you're planning for retirement, 
                    saving for a major purchase, or evaluating different investment opportunities, this tool simplifies complex calculations.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">How to Use the Investment Calculator?</h3>
                <div className="space-y-3 sm:space-y-4 text-gray-600">
                  <p className="text-sm sm:text-base">
                    The investment return formula used is: FV = PV(1+r)^n + PMT[((1+r)^n - 1)/r]
                  </p>
                  <ul className="space-y-1 sm:space-y-2 list-disc list-inside text-sm sm:text-base">
                    <li>FV = Future Value of Investment</li>
                    <li>PV = Present Value (Initial Investment)</li>
                    <li>r = Annual interest rate (divided by compounding frequency)</li>
                    <li>n = Number of compounding periods</li>
                    <li>PMT = Monthly contribution amount</li>
                  </ul>
                  <p className="text-sm sm:text-base">
                    Our calculator automatically applies this formula and provides additional insights like total returns, 
                    annualized returns, and inflation-adjusted values to help you make informed investment decisions.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Features of Our Investment Calculator</h3>
                <div className="space-y-2 sm:space-y-3 text-gray-600">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm sm:text-base">Support for 10+ international currencies</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm sm:text-base">Multiple compounding frequency options</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm sm:text-base">Inflation adjustment calculations</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm sm:text-base">Monthly investment breakdown</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm sm:text-base">Comprehensive return analysis</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Benefits of Investment Planning</h3>
                <div className="space-y-2 sm:space-y-3 text-gray-600">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm sm:text-base">Plan your financial goals with accurate projections</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm sm:text-base">Compare different investment scenarios instantly</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm sm:text-base">Understand the power of compound interest</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm sm:text-base">Make informed decisions about investment duration</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm sm:text-base">Free to use with no registration required</span>
                  </div>
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
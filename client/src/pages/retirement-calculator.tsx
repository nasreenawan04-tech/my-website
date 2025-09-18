
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RetirementResult {
  totalSavings: number;
  monthlyContribution: number;
  totalContributions: number;
  interestEarned: number;
  monthlyIncomeAtRetirement: number;
  yearsOfContributions: number;
  currentSavingsGrowth: number;
  contributionsGrowth: number;
  interestPercentage: number;
  projectionSchedule: Array<{
    year: number;
    age: number;
    totalSavings: number;
    yearlyContribution: number;
    interestEarned: number;
  }>;
}

export default function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState('30');
  const [retirementAge, setRetirementAge] = useState('65');
  const [currentSavings, setCurrentSavings] = useState('50000');
  const [monthlyContribution, setMonthlyContribution] = useState('500');
  const [expectedReturn, setExpectedReturn] = useState('7');
  const [withdrawalRate, setWithdrawalRate] = useState('4');
  const [currency, setCurrency] = useState('USD');
  const [showProjection, setShowProjection] = useState(false);
  const [result, setResult] = useState<RetirementResult | null>(null);

  const calculateRetirement = () => {
    const currentAgeNum = parseFloat(currentAge);
    const retirementAgeNum = parseFloat(retirementAge);
    const currentSavingsNum = parseFloat(currentSavings) || 0;
    const monthlyContrib = parseFloat(monthlyContribution) || 0;
    const annualReturn = parseFloat(expectedReturn) / 100;
    const monthlyReturn = annualReturn / 12;
    const withdrawalRateNum = parseFloat(withdrawalRate) / 100;

    if (currentAgeNum <= 0 || retirementAgeNum <= 0 || retirementAgeNum <= currentAgeNum) return;

    const yearsToRetirement = retirementAgeNum - currentAgeNum;
    const monthsToRetirement = yearsToRetirement * 12;

    // Future value of current savings
    const currentSavingsGrowth = currentSavingsNum * Math.pow(1 + annualReturn, yearsToRetirement);

    // Future value of monthly contributions (annuity)
    let contributionsGrowth = 0;
    if (monthlyContrib > 0 && monthlyReturn > 0) {
      contributionsGrowth = monthlyContrib * 
        (Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn;
    } else if (monthlyContrib > 0) {
      contributionsGrowth = monthlyContrib * monthsToRetirement;
    }

    const totalSavings = currentSavingsGrowth + contributionsGrowth;
    const totalContributions = currentSavingsNum + (monthlyContrib * monthsToRetirement);
    const interestEarned = totalSavings - totalContributions;
    const monthlyIncomeAtRetirement = (totalSavings * withdrawalRateNum) / 12;
    const interestPercentage = (interestEarned / totalSavings) * 100;

    // Generate projection schedule (showing every 5 years)
    const projectionSchedule = [];
    for (let year = 0; year <= yearsToRetirement; year += 5) {
      if (year > yearsToRetirement) year = yearsToRetirement;
      
      const yearsElapsed = year;
      const currentSavingsAtYear = currentSavingsNum * Math.pow(1 + annualReturn, yearsElapsed);
      const monthsElapsed = yearsElapsed * 12;
      
      let contributionsAtYear = 0;
      if (monthlyContrib > 0 && monthlyReturn > 0 && monthsElapsed > 0) {
        contributionsAtYear = monthlyContrib * 
          (Math.pow(1 + monthlyReturn, monthsElapsed) - 1) / monthlyReturn;
      } else if (monthlyContrib > 0) {
        contributionsAtYear = monthlyContrib * monthsElapsed;
      }
      
      const totalAtYear = currentSavingsAtYear + contributionsAtYear;
      const contributionsThisYear = monthlyContrib * 12;
      const interestThisYear = totalAtYear - (currentSavingsNum + (monthlyContrib * monthsElapsed));
      
      projectionSchedule.push({
        year: yearsElapsed,
        age: currentAgeNum + yearsElapsed,
        totalSavings: Math.round(totalAtYear * 100) / 100,
        yearlyContribution: contributionsThisYear,
        interestEarned: Math.max(0, Math.round(interestThisYear * 100) / 100)
      });
      
      if (year === yearsToRetirement) break;
    }

    setResult({
      totalSavings: Math.round(totalSavings * 100) / 100,
      monthlyContribution: monthlyContrib,
      totalContributions: Math.round(totalContributions * 100) / 100,
      interestEarned: Math.round(interestEarned * 100) / 100,
      monthlyIncomeAtRetirement: Math.round(monthlyIncomeAtRetirement * 100) / 100,
      yearsOfContributions: yearsToRetirement,
      currentSavingsGrowth: Math.round(currentSavingsGrowth * 100) / 100,
      contributionsGrowth: Math.round(contributionsGrowth * 100) / 100,
      interestPercentage: Math.round(interestPercentage * 100) / 100,
      projectionSchedule
    });
  };

  const resetCalculator = () => {
    setCurrentAge('30');
    setRetirementAge('65');
    setCurrentSavings('50000');
    setMonthlyContribution('500');
    setExpectedReturn('7');
    setWithdrawalRate('4');
    setCurrency('USD');
    setShowProjection(false);
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
        <title>Retirement Calculator - Calculate Retirement Savings & Income | DapsiWow</title>
        <meta name="description" content="Free retirement calculator with 4% withdrawal rule, compound interest projections, and multi-currency support. Calculate 401k, IRA, and pension savings for secure retirement planning worldwide." />
        <meta name="keywords" content="retirement calculator, retirement planning calculator, 401k calculator, IRA calculator, pension calculator, retirement savings calculator, compound interest retirement, 4% withdrawal rule, retirement income calculator, financial independence calculator, early retirement calculator, retirement planning tool, retirement projections, retirement fund calculator, FIRE calculator, retirement age calculator, withdrawal rate calculator, retirement savings goals, retirement planning guide" />
        <meta property="og:title" content="Retirement Calculator - Calculate Retirement Savings & Income | DapsiWow" />
        <meta property="og:description" content="Free retirement planning calculator with 4% rule, compound interest calculations, and support for 401k, IRA & pension planning worldwide." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/retirement-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Retirement Calculator",
            "description": "Free retirement planning calculator with 4% withdrawal rule, compound interest calculations, and multi-currency support for 401k, IRA, and pension planning.",
            "url": "https://dapsiwow.com/tools/retirement-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "4% withdrawal rule calculations",
              "Compound interest projections",
              "Multi-currency support",
              "401k and IRA planning",
              "Retirement income projections",
              "Financial independence planning"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 text-xs sm:text-sm md:text-base">
                <span className="font-medium text-blue-700">Professional Retirement Calculator</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Smart Retirement</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto leading-relaxed px-2 sm:px-4 md:px-6">
                Plan your retirement savings with advanced compound interest calculations and the proven 4% withdrawal rule
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Retirement Configuration</h2>
                    <p className="text-gray-600">Enter your retirement planning details for accurate projections</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Currency Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="currency" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Currency
                      </Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-currency">
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

                    {/* Current Age */}
                    <div className="space-y-3">
                      <Label htmlFor="current-age" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Current Age
                      </Label>
                      <Input
                        id="current-age"
                        type="number"
                        value={currentAge}
                        onChange={(e) => setCurrentAge(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        placeholder="30"
                        min="18"
                        max="100"
                        data-testid="input-current-age"
                      />
                    </div>

                    {/* Retirement Age */}
                    <div className="space-y-3">
                      <Label htmlFor="retirement-age" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Planned Retirement Age
                      </Label>
                      <Input
                        id="retirement-age"
                        type="number"
                        value={retirementAge}
                        onChange={(e) => setRetirementAge(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        placeholder="65"
                        min="50"
                        max="100"
                        data-testid="input-retirement-age"
                      />
                    </div>

                    {/* Current Savings */}
                    <div className="space-y-3">
                      <Label htmlFor="current-savings" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Current Retirement Savings
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="current-savings"
                          type="number"
                          value={currentSavings}
                          onChange={(e) => setCurrentSavings(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="50,000"
                          min="0"
                          step="100"
                          data-testid="input-current-savings"
                        />
                      </div>
                    </div>

                    {/* Monthly Contribution */}
                    <div className="space-y-3">
                      <Label htmlFor="monthly-contribution" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Monthly Contribution
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="monthly-contribution"
                          type="number"
                          value={monthlyContribution}
                          onChange={(e) => setMonthlyContribution(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="500"
                          min="0"
                          step="10"
                          data-testid="input-monthly-contribution"
                        />
                      </div>
                    </div>

                    {/* Expected Annual Return */}
                    <div className="space-y-3">
                      <Label htmlFor="expected-return" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Expected Annual Return
                      </Label>
                      <div className="relative">
                        <Input
                          id="expected-return"
                          type="number"
                          value={expectedReturn}
                          onChange={(e) => setExpectedReturn(e.target.value)}
                          className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="7"
                          min="0"
                          max="20"
                          step="0.1"
                          data-testid="input-expected-return"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                      </div>
                    </div>

                    {/* Withdrawal Rate */}
                    <div className="space-y-3">
                      <Label htmlFor="withdrawal-rate" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Safe Withdrawal Rate
                      </Label>
                      <div className="relative">
                        <Input
                          id="withdrawal-rate"
                          type="number"
                          value={withdrawalRate}
                          onChange={(e) => setWithdrawalRate(e.target.value)}
                          className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="4"
                          min="1"
                          max="10"
                          step="0.1"
                          data-testid="input-withdrawal-rate"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        The 4% rule is commonly used for sustainable retirement withdrawals
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateRetirement}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Retirement
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>

                  {/* Advanced Options */}
                  {result && (
                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button
                        onClick={() => setShowProjection(!showProjection)}
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        data-testid="button-show-projection"
                      >
                        {showProjection ? 'Hide' : 'Show'} Retirement Projection
                      </Button>
                    </div>
                  )}
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Retirement Projection</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="retirement-results">
                      {/* Total Savings Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Total Retirement Savings</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-total-savings">
                          {formatCurrency(result.totalSavings)}
                        </div>
                      </div>

                      {/* Monthly Income Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Monthly Retirement Income</div>
                        <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600" data-testid="text-monthly-income">
                          {formatCurrency(result.monthlyIncomeAtRetirement)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Based on {withdrawalRate}% withdrawal rate</p>
                      </div>

                      {/* Savings Breakdown */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Your Contributions</span>
                            <span className="font-bold text-gray-900" data-testid="text-total-contributions">
                              {formatCurrency(result.totalContributions)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Investment Growth</span>
                            <span className="font-bold text-green-600" data-testid="text-investment-growth">
                              {formatCurrency(result.interestEarned)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Years of Savings</span>
                            <span className="font-bold text-gray-900" data-testid="text-years-contributing">
                              {result.yearsOfContributions} years
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Visual Breakdown */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-4 text-lg">Savings Composition</h4>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-6 mr-4">
                              <div className="flex h-6 rounded-full overflow-hidden">
                                <div 
                                  className="bg-blue-500"
                                  style={{ width: `${(result.totalContributions / result.totalSavings) * 100}%` }}
                                ></div>
                                <div 
                                  className="bg-green-500"
                                  style={{ width: `${(result.interestEarned / result.totalSavings) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                              Contributions ({Math.round((result.totalContributions / result.totalSavings) * 100)}%)
                            </span>
                            <span className="flex items-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                              Growth ({Math.round((result.interestEarned / result.totalSavings) * 100)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">$</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter retirement details to see your financial projections</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Retirement Projection Table */}
          {result && showProjection && (
            <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Retirement Savings Projection</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <th className="px-6 py-4 text-left font-bold text-gray-900 rounded-l-lg">Year</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-900">Age</th>
                        <th className="px-6 py-4 text-right font-bold text-gray-900">Total Savings</th>
                        <th className="px-6 py-4 text-right font-bold text-gray-900">Annual Contribution</th>
                        <th className="px-6 py-4 text-right font-bold text-gray-900 rounded-r-lg">Interest Earned</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.projectionSchedule.map((projection, index) => (
                        <tr key={index} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{projection.year}</td>
                          <td className="px-6 py-4 font-medium text-gray-900">{Math.round(projection.age)}</td>
                          <td className="px-6 py-4 text-right text-gray-900 font-bold">
                            {formatCurrency(projection.totalSavings)}
                          </td>
                          <td className="px-6 py-4 text-right text-blue-600 font-medium">
                            {formatCurrency(projection.yearlyContribution)}
                          </td>
                          <td className="px-6 py-4 text-right text-green-600 font-bold">
                            {formatCurrency(projection.interestEarned)}
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
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Retirement Planning?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Retirement planning is the process of determining retirement income goals and making financial 
                    decisions to achieve those objectives. Our retirement calculator helps you understand how much 
                    you need to save monthly to reach your retirement goals using proven financial principles.
                  </p>
                  <p>
                    The calculator uses compound interest calculations to project how your current savings and 
                    future contributions will grow over time. It applies the widely-accepted 4% withdrawal rule 
                    to estimate sustainable retirement income, helping you plan for financial independence.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">The 4% Withdrawal Rule</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    The 4% rule suggests that retirees can safely withdraw 4% of their retirement portfolio 
                    annually, adjusted for inflation, without running out of money during a 30-year retirement.
                  </p>
                  <p>
                    This rule is based on historical market performance and provides a conservative approach 
                    to retirement income planning. Our calculator uses this principle to estimate your 
                    monthly retirement income based on your projected savings.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Retirement Account Types</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>401(k) - Employer-sponsored retirement plan with tax advantages</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Traditional IRA - Individual retirement account with tax-deferred growth</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Roth IRA - After-tax contributions with tax-free withdrawals</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>SEP-IRA - Simplified employee pension for self-employed</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Pension Plans - Defined benefit plans from employers</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Compound Interest Power</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Start early to maximize compound growth potential</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Consistent monthly contributions accelerate growth</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Long-term investing reduces market volatility impact</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Reinvesting dividends increases compound returns</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Time is the most powerful factor in wealth building</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Retirement Planning Strategies */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Retirement Planning Strategies by Age</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">20s & 30s - Building Foundation</h4>
                    <div className="space-y-2 text-gray-600 text-sm">
                      <p>Start retirement savings as early as possible to maximize compound growth over decades.</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Contribute to employer 401(k) match</li>
                        <li>Open and fund a Roth IRA</li>
                        <li>Aim for 10-15% savings rate</li>
                        <li>Focus on growth investments</li>
                        <li>Automate contributions</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">40s & 50s - Acceleration Phase</h4>
                    <div className="space-y-2 text-gray-600 text-sm">
                      <p>Increase savings rate as income grows and utilize catch-up contributions for accelerated growth.</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Maximize 401(k) contributions</li>
                        <li>Use catch-up contributions (50+)</li>
                        <li>Diversify investment portfolio</li>
                        <li>Consider Roth conversions</li>
                        <li>Plan for healthcare costs</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">60s+ - Pre-Retirement</h4>
                    <div className="space-y-2 text-gray-600 text-sm">
                      <p>Focus on preservation and prepare for retirement income distribution strategies.</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Shift to conservative investments</li>
                        <li>Plan Social Security timing</li>
                        <li>Create income distribution plan</li>
                        <li>Consider long-term care insurance</li>
                        <li>Optimize tax strategies</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Returns and Risk */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Expected Investment Returns</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Conservative Portfolio (4-6%)</h4>
                      <p className="text-sm">Heavy allocation to bonds and cash equivalents. Lower risk but reduced growth potential.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Moderate Portfolio (6-8%)</h4>
                      <p className="text-sm">Balanced mix of stocks and bonds. Commonly used for retirement planning calculations.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Aggressive Portfolio (8-10%)</h4>
                      <p className="text-sm">Stock-heavy allocation with higher growth potential but increased volatility.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Historical Stock Market (10%)</h4>
                      <p className="text-sm">Long-term average return of the S&P 500, including dividends and reinvestment.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Retirement Savings Milestones</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">By Age 30</h4>
                      <p className="text-sm text-blue-700">Save 1x your annual salary in retirement accounts to stay on track.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">By Age 40</h4>
                      <p className="text-sm text-green-700">Accumulate 3x your annual salary for comfortable retirement planning.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">By Age 50</h4>
                      <p className="text-sm text-orange-700">Target 6x your annual salary and utilize catch-up contributions.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">By Age 60</h4>
                      <p className="text-sm text-purple-700">Reach 10x your annual salary for financial independence and flexibility.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Retirement Planning FAQs */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Retirement Planning Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How much should I save for retirement?</h4>
                      <p className="text-gray-600 text-sm">Financial experts recommend saving 10-15% of your income for retirement. This includes employer matches. The earlier you start, the less you need to save monthly due to compound interest.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">When should I start retirement planning?</h4>
                      <p className="text-gray-600 text-sm">Start as early as possible, ideally in your 20s. Even small contributions in your early career can grow significantly over decades due to the power of compound interest.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What is the difference between 401(k) and IRA?</h4>
                      <p className="text-gray-600 text-sm">A 401(k) is employer-sponsored with higher contribution limits and potential employer matching. IRAs are individual accounts with more investment options but lower contribution limits.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I prioritize 401(k) or IRA contributions?</h4>
                      <p className="text-gray-600 text-sm">First, contribute enough to your 401(k) to get the full employer match, then consider maxing out an IRA for better investment options, then return to maxing out your 401(k).</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does inflation affect retirement planning?</h4>
                      <p className="text-gray-600 text-sm">Inflation erodes purchasing power over time. Plan for 2-3% annual inflation by investing in growth assets and adjusting your retirement income projections accordingly.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What happens if I start retirement planning late?</h4>
                      <p className="text-gray-600 text-sm">You'll need to save a higher percentage of your income and may need to work longer or adjust retirement lifestyle expectations. Catch-up contributions help those 50 and older.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How much will I need in retirement?</h4>
                      <p className="text-gray-600 text-sm">A common rule is 70-80% of your pre-retirement income. However, this varies based on your lifestyle, health, and other income sources like Social Security.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I pay off debt before saving for retirement?</h4>
                      <p className="text-gray-600 text-sm">Prioritize high-interest debt (credit cards) first, but don't skip employer 401(k) matching. For lower-interest debt like mortgages, you can often save for retirement simultaneously.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Security and Medicare */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Social Security Planning</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Social Security provides a foundation for retirement income but shouldn't be your only source.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Key Considerations:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Full retirement age varies by birth year</li>
                        <li>Early claiming reduces benefits permanently</li>
                        <li>Delayed retirement credits increase benefits</li>
                        <li>Spousal and survivor benefits available</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Healthcare in Retirement</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Healthcare costs typically increase in retirement and Medicare doesn't cover everything.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Planning Tips:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Understand Medicare parts A, B, C, and D</li>
                        <li>Consider Medigap insurance</li>
                        <li>Plan for long-term care costs</li>
                        <li>Health Savings Accounts offer triple tax benefit</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Estate Planning</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Proper estate planning ensures your retirement savings benefit your intended beneficiaries.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-800 text-sm">Essential Documents:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-purple-700">
                        <li>Will and testament</li>
                        <li>Power of attorney</li>
                        <li>Healthcare directives</li>
                        <li>Beneficiary designations</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Common Retirement Mistakes */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Common Retirement Planning Mistakes to Avoid</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Starting Too Late</h4>
                      <p className="text-red-700 text-sm">Delaying retirement savings reduces the power of compound interest. Start immediately, even with small amounts.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Not Taking Employer Match</h4>
                      <p className="text-orange-700 text-sm">Failing to contribute enough for full employer matching is leaving free money on the table.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Cashing Out 401(k) Early</h4>
                      <p className="text-yellow-700 text-sm">Early withdrawals incur penalties and taxes, plus you lose years of potential compound growth.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Underestimating Healthcare Costs</h4>
                      <p className="text-blue-700 text-sm">Healthcare expenses typically increase with age. Plan for higher medical costs in retirement.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Ignoring Inflation</h4>
                      <p className="text-purple-700 text-sm">Inflation reduces purchasing power over time. Invest in growth assets to combat inflation's effects.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Not Diversifying Investments</h4>
                      <p className="text-green-700 text-sm">Putting all retirement savings in one investment type increases risk. Diversify across asset classes.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Retirement Income Sources */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Building Multiple Retirement Income Streams</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Primary Income Sources</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">401(k), 403(b), and other employer-sponsored retirement plans</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Traditional and Roth IRAs for tax-advantaged savings</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Social Security benefits based on work history</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Pension plans from current or former employers</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Supplemental Income Sources</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Taxable investment accounts for additional flexibility</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Real estate investments and rental income</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Part-time work or consulting in retirement</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Annuities for guaranteed income streams</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Diversification Strategy</h4>
                  <p className="text-blue-700 text-sm">
                    Create multiple income streams to reduce dependence on any single source. This approach provides 
                    financial security and flexibility to adapt to changing economic conditions during retirement.
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

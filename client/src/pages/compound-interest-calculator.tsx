
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp } from 'lucide-react';

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
  const [sipFrequency, setSipFrequency] = useState('12'); // monthly by default
  const [stepUpPercentage, setStepUpPercentage] = useState('0');
  const [inflationRate, setInflationRate] = useState('3');
  const [enableGoalPlanning, setEnableGoalPlanning] = useState(false);
  const [goalAmount, setGoalAmount] = useState('100000');
  const [showRealValue, setShowRealValue] = useState(false);
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
      
      // Calculate compound growth for existing amount
      const growthFactor = Math.pow((1 + r / n), n * yearDuration);
      currentAmount *= growthFactor;
      
      // Add SIP contributions throughout the year
      if (enableSIP && sip > 0) {
        const periodsInYear = sipFreq * yearDuration;
        let currentSIP = sip;
        
        // Apply step-up to SIP amount
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
      
      const previousAmount = year === 1 ? p : yearlyBreakdown[year - 2].amount;
      const interestEarned = currentAmount - previousAmount - (enableSIP ? totalSIPContributions - (year > 1 ? yearlyBreakdown[year - 2].cumulativeContributions - p : 0) : 0);
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

    // Goal analysis
    let goalAnalysis;
    if (enableGoalPlanning && target > 0) {
      // Calculate time to reach goal
      let timeToGoal = 0;
      let testAmount = p;
      let testContributions = p;
      
      while (testAmount < target && timeToGoal < 50) { // Max 50 years
        timeToGoal += 1;
        testAmount *= Math.pow((1 + r / n), n);
        
        if (enableSIP && sip > 0) {
          const yearSIP = stepUp > 0 ? sip * Math.pow(1 + stepUp, timeToGoal - 1) : sip;
          testAmount += yearSIP * sipFreq * ((Math.pow(1 + r/n, n) - 1) / (r/n));
          testContributions += yearSIP * sipFreq;
        }
      }
      
      // Calculate required monthly contribution to reach goal
      const requiredTotal = target - p * Math.pow((1 + r / n), n * t);
      const annuityFactor = ((Math.pow(1 + r/n, n * t) - 1) / (r/n));
      const requiredMonthlyContribution = requiredTotal > 0 ? (requiredTotal / annuityFactor) / 12 : 0;
      
      goalAnalysis = {
        timeToReachGoal: timeToGoal <= 50 ? timeToGoal : -1,
        requiredMonthlyContribution: Math.max(0, requiredMonthlyContribution),
        isGoalAchievable: timeToGoal <= 50 || requiredMonthlyContribution <= sip * 2
      };
    }

    // SIP analysis
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
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Compound Interest Calculator - Calculate Investment Growth | ToolsHub</title>
        <meta name="description" content="Free compound interest calculator to calculate investment growth over time. See how compound interest accelerates wealth building with detailed breakdowns, multiple currencies, and flexible compounding options for retirement planning and savings goals." />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Compound Interest Calculator
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Calculate how your investments and savings grow over time with compound interest
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Input Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">Investment Details</h2>
                  
                  {/* Currency Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="currency" className="text-sm font-medium text-gray-700">
                      Currency
                    </Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="h-12 border-gray-200 rounded-lg">
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

                  {/* Principal Amount */}
                  <div className="space-y-3">
                    <Label htmlFor="principal" className="text-sm font-medium text-gray-700">
                      Principal Amount
                    </Label>
                    <Input
                      id="principal"
                      type="number"
                      value={principal}
                      onChange={(e) => setPrincipal(e.target.value)}
                      className="h-12 text-base border-gray-200 rounded-lg"
                      placeholder="10,000"
                    />
                  </div>

                  {/* Interest Rate */}
                  <div className="space-y-3">
                    <Label htmlFor="interest-rate" className="text-sm font-medium text-gray-700">
                      Annual Interest Rate (%)
                    </Label>
                    <Input
                      id="interest-rate"
                      type="number"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="h-12 text-base border-gray-200 rounded-lg"
                      placeholder="8"
                      step="0.01"
                    />
                  </div>

                  {/* Time Period */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Time Period</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        value={timePeriod}
                        onChange={(e) => setTimePeriod(e.target.value)}
                        className="h-12 text-base border-gray-200 rounded-lg"
                        placeholder="10"
                        min="1"
                      />
                      <Select value={timeUnit} onValueChange={setTimeUnit}>
                        <SelectTrigger className="h-12 border-gray-200 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="years">Years</SelectItem>
                          <SelectItem value="months">Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Compound Frequency */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Compound Frequency</Label>
                    <Select value={compoundFrequency} onValueChange={setCompoundFrequency}>
                      <SelectTrigger className="h-12 border-gray-200 rounded-lg">
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

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      onClick={calculateCompoundInterest}
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Calculate
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="h-12 px-8 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-lg"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gray-50 rounded-xl p-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">Results</h2>
                  
                  {result ? (
                    <div className="space-y-6">
                      {/* Final Amount */}
                      <div className="bg-white rounded-lg p-6 border border-gray-100">
                        <div className="text-sm text-gray-600 mb-1">Final Amount</div>
                        <div className="text-3xl font-bold text-green-600">
                          {formatCurrency(result.finalAmount)}
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Principal Amount</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(result.principalAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Total Interest Earned</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(result.totalInterest)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                          <span className="text-gray-600">Interest Rate</span>
                          <span className="font-semibold text-gray-900">
                            {interestRate}% per year
                          </span>
                        </div>
                      </div>

                      {/* Yearly Breakdown */}
                      {result.yearlyBreakdown.length > 0 && (
                        <div className="mt-8">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Yearly Breakdown</h3>
                          <div className="max-h-60 overflow-y-auto space-y-2">
                            {result.yearlyBreakdown.slice(0, 5).map((year) => (
                              <div key={year.year} className="bg-white rounded-lg p-4 border border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium text-gray-900">Year {year.year}</span>
                                  <span className="font-bold text-green-600">
                                    {formatCurrency(year.amount)}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  Interest earned: {formatCurrency(year.interestEarned)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Enter investment details and click calculate to see results</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Educational Content */}
          <div className="mt-16 space-y-12">
            {/* What is Compound Interest */}
            <section className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Compound Interest Calculator?</h2>
              <div className="prose max-w-none text-gray-600 leading-relaxed">
                <p className="text-lg mb-6">
                  A compound interest calculator is an essential financial planning tool that helps you determine how your investments and savings will grow over time through the power of compounding. Our free online compound interest calculator uses advanced algorithms to calculate the exponential growth of your money when interest is earned on both the principal amount and previously accumulated interest.
                </p>
                <p className="mb-6">
                  Unlike <a href="/tools/simple-interest-calculator" className="text-blue-600 hover:text-blue-700 font-medium">simple interest calculators</a> that only calculate interest on the principal amount, compound interest allows your money to grow exponentially. Each compounding period adds interest to your principal, creating a snowball effect that becomes increasingly powerful over longer time periods. This makes compound interest one of the most important concepts in personal finance and investment planning.
                </p>
                <p className="mb-6">
                  The compound interest formula used by our calculator is: <strong>A = P(1 + r/n)^(nt)</strong>, where A is the final amount, P is the principal, r is the annual interest rate, n is the number of times interest is compounded per year, and t is the time in years. This mathematical foundation ensures accurate projections for your financial planning needs.
                </p>
                <p>
                  Whether you're planning for retirement, saving for education, or building wealth through investments, our compound interest calculator provides instant, accurate calculations to help you understand the long-term impact of your financial decisions. The tool supports multiple currencies and compounding frequencies, making it suitable for investors worldwide.
                </p>
              </div>
            </section>

            {/* How Compound Interest Works */}
            <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How Does Compound Interest Work?</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">The Compounding Process</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">1</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Initial Investment</h4>
                        <p className="text-sm">Start with your principal amount - the initial money you invest or save</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">2</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">First Period Interest</h4>
                        <p className="text-sm">Interest is calculated on your principal amount for the first period</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">3</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Reinvestment</h4>
                        <p className="text-sm">The earned interest is added to your principal, creating a larger base</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">4</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Exponential Growth</h4>
                        <p className="text-sm">Future interest is calculated on the new, larger amount, accelerating growth</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Example: $10,000 at 8% Annual Interest</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Year 1:</span>
                      <span>$10,000 + $800 = $10,800</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Year 2:</span>
                      <span>$10,800 + $864 = $11,664</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Year 3:</span>
                      <span>$11,664 + $933 = $12,597</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Year 5:</span>
                      <span>$14,693 (vs $14,000 simple)</span>
                    </div>
                    <div className="flex justify-between font-bold text-green-600">
                      <span>Year 10:</span>
                      <span>$21,589 (vs $18,000 simple)</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">Notice how the gap widens over time compared to simple interest</p>
                </div>
              </div>
            </section>

            {/* Benefits and Features */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Benefits of Compound Interest</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Exponential Growth</h4>
                        <p className="text-gray-600">Your money grows faster as time progresses due to the compounding effect</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Passive Income Generation</h4>
                        <p className="text-gray-600">Earn money on your earnings without additional effort or investment</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Long-term Wealth Building</h4>
                        <p className="text-gray-600">Essential for retirement planning and achieving financial independence</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Inflation Protection</h4>
                        <p className="text-gray-600">Helps maintain purchasing power over time with proper interest rates</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Calculator Features</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Multiple Currencies</h4>
                        <p className="text-gray-600">Calculate in USD, EUR, GBP, INR, and 6 other major currencies</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Flexible Compounding</h4>
                        <p className="text-gray-600">Choose from annual, semi-annual, quarterly, monthly, or daily compounding</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Detailed Breakdown</h4>
                        <p className="text-gray-600">View year-by-year growth and interest earned for better understanding</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Instant Results</h4>
                        <p className="text-gray-600">Real-time calculations with user-friendly interface</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* How to Use */}
            <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Use the Compound Interest Calculator</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mx-auto mb-4 font-bold text-lg">1</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Enter Principal</h3>
                  <p className="text-gray-600 text-sm">Input your initial investment amount</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mx-auto mb-4 font-bold text-lg">2</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Set Interest Rate</h3>
                  <p className="text-gray-600 text-sm">Enter the annual interest rate percentage</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mx-auto mb-4 font-bold text-lg">3</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Choose Time Period</h3>
                  <p className="text-gray-600 text-sm">Select investment duration in years or months</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mx-auto mb-4 font-bold text-lg">4</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Calculate Results</h3>
                  <p className="text-gray-600 text-sm">View your projected returns and growth</p>
                </div>
              </div>
            </section>

            {/* Audience-Specific Benefits */}
            <section className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Who Benefits from Compound Interest Calculations?</h2>
              
              {/* Students Section */}
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-blue-600 mb-6">📚 Students & Young Adults</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Education Funding</h4>
                    <p className="text-gray-600 mb-4">Calculate how much your education savings will grow to cover future tuition costs. Start early to minimize student debt burden.</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        <span>529 education savings plans</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        <span>Coverdell ESA calculations</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        <span>Parent PLUS loan alternatives</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Early Investment Advantage</h4>
                    <p className="text-gray-600 mb-4">Understand the massive advantage of starting to invest early. Even small amounts can grow significantly over decades.</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        <span>First job 401(k) contributions</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        <span>Roth IRA for tax-free growth</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        <span>Student loan vs investment decisions</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-100 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Pro Tip:</strong> Use our <a href="/tools/education-loan-calculator" className="underline font-medium">Education Loan Calculator</a> to compare the cost of borrowing versus using savings for education expenses.
                  </p>
                </div>
              </div>

              {/* Professionals Section */}
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-green-600 mb-6">💼 Working Professionals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Retirement Planning</h4>
                    <p className="text-gray-600 mb-4">Calculate how your 401(k), IRA, and other retirement accounts will grow to ensure a comfortable retirement lifestyle.</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        <span>401(k) employer matching optimization</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        <span>Traditional vs Roth IRA comparisons</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        <span>Catch-up contribution strategies</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Investment Portfolio Growth</h4>
                    <p className="text-gray-600 mb-4">Project returns on stocks, bonds, mutual funds, and other investment vehicles to optimize your portfolio allocation.</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        <span>Stock market historical returns</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        <span>Bond and treasury investments</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        <span>Diversification strategies</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-green-100 rounded-lg">
                  <p className="text-green-800 text-sm">
                    <strong>Related Tools:</strong> Check our <a href="/tools/retirement-calculator" className="underline font-medium">Retirement Calculator</a> and <a href="/tools/investment-return-calculator" className="underline font-medium">Investment Return Calculator</a> for comprehensive retirement planning.
                  </p>
                </div>
              </div>

              {/* Business Owners Section */}
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-purple-600 mb-6">🏢 Business Owners & Entrepreneurs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Business Investment Planning</h4>
                    <p className="text-gray-600 mb-4">Calculate returns on business investments, equipment purchases, and expansion projects to make informed capital allocation decisions.</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        <span>Equipment ROI calculations</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        <span>Business expansion funding</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        <span>Cash flow reinvestment strategies</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Loan vs Investment Analysis</h4>
                    <p className="text-gray-600 mb-4">Compare the cost of business loans with potential investment returns to optimize your financing decisions.</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        <span>SBA loan cost analysis</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        <span>Business line of credit planning</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        <span>Equipment financing alternatives</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-purple-100 rounded-lg">
                  <p className="text-purple-800 text-sm">
                    <strong>Business Tools:</strong> Explore our <a href="/tools/business-loan-calculator" className="underline font-medium">Business Loan Calculator</a> and <a href="/tools/roi-calculator" className="underline font-medium">ROI Calculator</a> for comprehensive business financial planning.
                  </p>
                </div>
              </div>

              {/* Parents & Families Section */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-orange-600 mb-6">👨‍👩‍👧‍👦 Parents & Families</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-orange-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Children's Future Planning</h4>
                    <p className="text-gray-600 mb-4">Plan for your children's education, first car, wedding, or home down payment by understanding long-term savings growth.</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        <span>College fund growth projections</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        <span>UTMA/UGMA account planning</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        <span>Teaching children about money</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Family Financial Goals</h4>
                    <p className="text-gray-600 mb-4">Calculate savings needed for major family milestones and understand how starting early makes goals more achievable.</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        <span>Home down payment savings</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        <span>Vacation and travel funds</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        <span>Emergency fund building</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-orange-100 rounded-lg">
                  <p className="text-orange-800 text-sm">
                    <strong>Family Planning:</strong> Use our <a href="/tools/savings-goal-calculator" className="underline font-medium">Savings Goal Calculator</a> and <a href="/tools/home-loan-calculator" className="underline font-medium">Home Loan Calculator</a> to plan major family purchases.
                  </p>
                </div>
              </div>
            </section>

            {/* Common Use Cases */}
            <section className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Compound Interest Applications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🏦</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">High-Yield Savings Accounts</h3>
                  <p className="text-gray-600 mb-4">Calculate growth in online savings accounts, CDs, and money market accounts with competitive interest rates.</p>
                  <div className="text-sm text-blue-600 font-medium">Typical rates: 4-5% APY</div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">📈</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Stock Market Investments</h3>
                  <p className="text-gray-600 mb-4">Project long-term growth of index funds, ETFs, and dividend-paying stocks with historical return assumptions.</p>
                  <div className="text-sm text-green-600 font-medium">Historical average: 10% annually</div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🏠</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Real Estate Investment</h3>
                  <p className="text-gray-600 mb-4">Calculate returns on rental properties, REITs, and real estate crowdfunding with reinvested income.</p>
                  <div className="text-sm text-purple-600 font-medium">Typical returns: 6-8% annually</div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Education Savings</h3>
                  <p className="text-gray-600 mb-4">Plan for rising education costs with 529 plans, Coverdell ESAs, and education savings bonds.</p>
                  <div className="text-sm text-yellow-600 font-medium">College inflation: 5% annually</div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">💳</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Debt Analysis</h3>
                  <p className="text-gray-600 mb-4">Understand how compound interest works against you with credit card debt and personal loans.</p>
                  <div className="text-sm text-red-600 font-medium">Credit card APR: 18-29%</div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Cryptocurrency Staking</h3>
                  <p className="text-gray-600 mb-4">Calculate potential returns from cryptocurrency staking rewards and DeFi yield farming strategies.</p>
                  <div className="text-sm text-indigo-600 font-medium">Staking yields: 3-15% APY</div>
                </div>
              </div>
            </section>

            {/* Tips for Maximizing */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Maximizing Compound Interest</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Start Early</h4>
                        <p className="text-gray-600">Time is your greatest asset - begin investing as soon as possible</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Higher Frequency</h4>
                        <p className="text-gray-600">Choose daily or monthly compounding over annual when possible</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Reinvest Earnings</h4>
                        <p className="text-gray-600">Always reinvest dividends and interest to maximize growth</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Regular Contributions</h4>
                        <p className="text-gray-600">Add money consistently to accelerate compound growth</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-0">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Important Considerations</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Tax Implications</h4>
                        <p className="text-gray-600">Consider tax-advantaged accounts like IRAs and 401(k)s</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Inflation Impact</h4>
                        <p className="text-gray-600">Ensure your interest rate exceeds inflation for real growth</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Risk Assessment</h4>
                        <p className="text-gray-600">Higher returns often come with higher risk - diversify wisely</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Emergency Fund</h4>
                        <p className="text-gray-600">Maintain liquidity for unexpected expenses before long-term investing</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Related Financial Calculators */}
            <section className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Financial Planning Tools</h2>
              <p className="text-gray-600 mb-8 text-lg">Maximize your financial planning with our comprehensive suite of calculators designed to work together for complete financial analysis.</p>
              
              {/* Investment & Savings Tools */}
              <div className="mb-10">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">📊 Investment & Savings Calculators</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <a href="/tools/simple-interest-calculator" className="block p-6 bg-blue-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-all hover:shadow-md">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-white text-sm font-bold">%</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Simple Interest Calculator</h4>
                    <p className="text-gray-600 text-sm mb-3">Calculate simple interest for loans and basic savings to compare with compound growth.</p>
                    <span className="text-blue-600 text-sm font-medium">Calculate Simple Interest →</span>
                  </a>
                  
                  <a href="/tools/investment-return-calculator" className="block p-6 bg-green-50 rounded-lg border border-green-100 hover:border-green-200 transition-all hover:shadow-md">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-white text-sm font-bold">📈</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Investment Return Calculator</h4>
                    <p className="text-gray-600 text-sm mb-3">Analyze portfolio returns, dividends, and capital gains with tax considerations.</p>
                    <span className="text-green-600 text-sm font-medium">Calculate Returns →</span>
                  </a>
                  
                  <a href="/tools/sip-calculator" className="block p-6 bg-purple-50 rounded-lg border border-purple-100 hover:border-purple-200 transition-all hover:shadow-md">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-white text-sm font-bold">💰</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">SIP Calculator</h4>
                    <p className="text-gray-600 text-sm mb-3">Calculate systematic investment plan returns with regular monthly contributions.</p>
                    <span className="text-purple-600 text-sm font-medium">Calculate SIP →</span>
                  </a>
                </div>
              </div>

              {/* Loan & Debt Tools */}
              <div className="mb-10">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">🏦 Loan & Debt Management Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <a href="/tools/loan-calculator" className="block p-6 bg-orange-50 rounded-lg border border-orange-100 hover:border-orange-200 transition-all hover:shadow-md">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-white text-sm font-bold">🏦</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Loan Calculator</h4>
                    <p className="text-gray-600 text-sm mb-3">Calculate monthly payments and total interest for personal, auto, and other loans.</p>
                    <span className="text-orange-600 text-sm font-medium">Calculate Loan →</span>
                  </a>
                  
                  <a href="/tools/mortgage-calculator" className="block p-6 bg-red-50 rounded-lg border border-red-100 hover:border-red-200 transition-all hover:shadow-md">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-white text-sm font-bold">🏠</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Mortgage Calculator</h4>
                    <p className="text-gray-600 text-sm mb-3">Calculate home loan payments, compare loan terms, and analyze amortization.</p>
                    <span className="text-red-600 text-sm font-medium">Calculate Mortgage →</span>
                  </a>
                  
                  <a href="/tools/credit-card-interest-calculator" className="block p-6 bg-yellow-50 rounded-lg border border-yellow-100 hover:border-yellow-200 transition-all hover:shadow-md">
                    <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-white text-sm font-bold">💳</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Credit Card Calculator</h4>
                    <p className="text-gray-600 text-sm mb-3">Calculate payoff time and interest costs for credit card debt management.</p>
                    <span className="text-yellow-600 text-sm font-medium">Calculate Payoff →</span>
                  </a>
                </div>
              </div>

              {/* Retirement & Goal Planning */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">🎯 Retirement & Goal Planning Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <a href="/tools/retirement-calculator" className="block p-6 bg-indigo-50 rounded-lg border border-indigo-100 hover:border-indigo-200 transition-all hover:shadow-md">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-white text-sm font-bold">🎯</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Retirement Calculator</h4>
                    <p className="text-gray-600 text-sm mb-3">Plan for retirement with 401(k), IRA, and pension contribution analysis.</p>
                    <span className="text-indigo-600 text-sm font-medium">Plan Retirement →</span>
                  </a>
                  
                  <a href="/tools/savings-goal-calculator" className="block p-6 bg-teal-50 rounded-lg border border-teal-100 hover:border-teal-200 transition-all hover:shadow-md">
                    <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-white text-sm font-bold">📊</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Savings Goal Calculator</h4>
                    <p className="text-gray-600 text-sm mb-3">Calculate how much to save monthly to reach specific financial goals.</p>
                    <span className="text-teal-600 text-sm font-medium">Set Goals →</span>
                  </a>
                  
                  <a href="/tools/inflation-calculator" className="block p-6 bg-pink-50 rounded-lg border border-pink-100 hover:border-pink-200 transition-all hover:shadow-md">
                    <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-white text-sm font-bold">📈</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Inflation Calculator</h4>
                    <p className="text-gray-600 text-sm mb-3">Understand how inflation affects purchasing power and investment returns.</p>
                    <span className="text-pink-600 text-sm font-medium">Check Inflation →</span>
                  </a>
                </div>
              </div>

              {/* Quick Links Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Complete Financial Tool Collection</h3>
                <p className="text-gray-600 mb-4">Explore our full range of financial calculators for comprehensive money management:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <a href="/tools/emi-calculator" className="text-blue-600 hover:text-blue-700 font-medium">EMI Calculator</a>
                  <a href="/tools/business-loan-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Business Loan Calculator</a>
                  <a href="/tools/home-loan-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Home Loan Calculator</a>
                  <a href="/tools/car-loan-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Car Loan Calculator</a>
                  <a href="/tools/education-loan-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Education Loan Calculator</a>
                  <a href="/tools/debt-payoff-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Debt Payoff Calculator</a>
                  <a href="/tools/net-worth-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Net Worth Calculator</a>
                  <a href="/tools/break-even-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Break Even Calculator</a>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions About Compound Interest</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between compound and simple interest?</h3>
                    <p className="text-gray-600">Simple interest is calculated only on the principal amount, while compound interest is calculated on both principal and accumulated interest, leading to exponential growth. Use our <a href="/tools/simple-interest-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Simple Interest Calculator</a> to compare the difference.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">How often should interest be compounded?</h3>
                    <p className="text-gray-600">More frequent compounding (daily vs. annually) results in higher returns. However, the difference becomes less significant at higher frequencies. Most savings accounts compound daily, while investment accounts may compound quarterly or annually.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Can compound interest work against me?</h3>
                    <p className="text-gray-600">Yes, compound interest on debt (like credit cards) can rapidly increase what you owe, making it important to pay off high-interest debt quickly. Use our <a href="/tools/credit-card-interest-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Credit Card Calculator</a> to see debt growth.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the Rule of 72?</h3>
                    <p className="text-gray-600">The Rule of 72 is a quick way to estimate how long it takes for an investment to double. Simply divide 72 by your interest rate. For example, at 8% interest, your money doubles in approximately 9 years (72 ÷ 8 = 9).</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">What's a good compound interest rate?</h3>
                    <p className="text-gray-600">A "good" rate depends on the investment type and risk level. Historical stock market returns average around 10% annually, high-yield savings accounts offer 4-5%, while government bonds provide 2-4%. Higher returns typically come with higher risk.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Is this calculator accurate for all investments?</h3>
                    <p className="text-gray-600">This calculator assumes a fixed interest rate. Real investments have variable returns, so use this as a baseline estimate rather than a guarantee. For more complex scenarios, consider using our <a href="/tools/investment-return-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Investment Return Calculator</a>.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I account for regular contributions?</h3>
                    <p className="text-gray-600">This calculator shows growth on a lump sum. For regular contributions, use our <a href="/tools/sip-calculator" className="text-blue-600 hover:text-blue-700 font-medium">SIP Calculator</a> for systematic investments or <a href="/tools/savings-goal-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Savings Goal Calculator</a> for monthly savings plans.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Should I pay off debt or invest first?</h3>
                    <p className="text-gray-600">Generally, pay off high-interest debt (above 6-8%) before investing, as the guaranteed "return" from debt elimination often exceeds investment returns. Use our <a href="/tools/debt-payoff-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Debt Payoff Calculator</a> to analyze your situation.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

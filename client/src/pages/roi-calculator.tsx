
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
import { TrendingUp } from 'lucide-react';

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

  const calculateBasicROI = () => {
    const initial = parseFloat(initialInvestment);
    const final = parseFloat(finalValue);
    const time = timeUnit === 'years' ? parseFloat(timePeriod) : parseFloat(timePeriod) / 12;

    if (initial <= 0 || final <= 0 || time <= 0) return;

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

  const calculateInvestmentROI = () => {
    const initial = parseFloat(investmentAmount);
    const monthly = parseFloat(monthlyContribution);
    const rate = parseFloat(annualReturn) / 100;
    const years = parseFloat(investmentYears);

    if (initial <= 0 || rate <= 0 || years <= 0) return;

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

  const calculateBusinessROI = () => {
    const cost = parseFloat(projectCost);
    const revenue = parseFloat(annualRevenue);
    const costs = parseFloat(annualCosts);
    const duration = parseFloat(projectDuration);

    if (cost <= 0 || revenue <= 0 || duration <= 0) return;

    const annualProfit = revenue - costs;
    const totalProfit = annualProfit * duration;
    const totalGain = totalProfit - cost;
    const roi = (totalGain / cost) * 100;
    const annualizedROI = roi / duration;
    const breakEvenTime = cost / annualProfit;

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
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>ROI Calculator - Calculate Return on Investment | ToolsHub</title>
        <meta name="description" content="Free ROI Calculator - Calculate Return on Investment for stocks, business projects, real estate, and financial decisions. Get instant ROI analysis with our comprehensive investment calculator tool." />
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
              ROI Calculator
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Calculate return on investment for business projects, investments, and financial decisions
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Input Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">ROI Calculator</h2>
                  
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
                        {currencies.map((curr) => (
                          <SelectItem key={curr.code} value={curr.code}>
                            {curr.code} - {curr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Calculation Type Tabs */}
                  <Tabs value={calculationType} onValueChange={setCalculationType} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Basic ROI</TabsTrigger>
                      <TabsTrigger value="investment">Investment</TabsTrigger>
                      <TabsTrigger value="business">Business</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-6 mt-6">
                      <div className="space-y-3">
                        <Label htmlFor="initial-investment" className="text-sm font-medium text-gray-700">
                          Initial Investment
                        </Label>
                        <Input
                          id="initial-investment"
                          type="number"
                          value={initialInvestment}
                          onChange={(e) => setInitialInvestment(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="10,000"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="final-value" className="text-sm font-medium text-gray-700">
                          Final Value
                        </Label>
                        <Input
                          id="final-value"
                          type="number"
                          value={finalValue}
                          onChange={(e) => setFinalValue(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="12,000"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">Time Period</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            type="number"
                            value={timePeriod}
                            onChange={(e) => setTimePeriod(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="1"
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
                    </TabsContent>

                    <TabsContent value="investment" className="space-y-6 mt-6">
                      <div className="space-y-3">
                        <Label htmlFor="investment-amount" className="text-sm font-medium text-gray-700">
                          Initial Investment
                        </Label>
                        <Input
                          id="investment-amount"
                          type="number"
                          value={investmentAmount}
                          onChange={(e) => setInvestmentAmount(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="10,000"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="monthly-contribution" className="text-sm font-medium text-gray-700">
                          Monthly Contribution
                        </Label>
                        <Input
                          id="monthly-contribution"
                          type="number"
                          value={monthlyContribution}
                          onChange={(e) => setMonthlyContribution(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="500"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="annual-return" className="text-sm font-medium text-gray-700">
                          Expected Annual Return (%)
                        </Label>
                        <Input
                          id="annual-return"
                          type="number"
                          value={annualReturn}
                          onChange={(e) => setAnnualReturn(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="8"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="investment-years" className="text-sm font-medium text-gray-700">
                          Investment Period (Years)
                        </Label>
                        <Input
                          id="investment-years"
                          type="number"
                          value={investmentYears}
                          onChange={(e) => setInvestmentYears(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="5"
                          min="1"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="business" className="space-y-6 mt-6">
                      <div className="space-y-3">
                        <Label htmlFor="project-cost" className="text-sm font-medium text-gray-700">
                          Project Cost
                        </Label>
                        <Input
                          id="project-cost"
                          type="number"
                          value={projectCost}
                          onChange={(e) => setProjectCost(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="50,000"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="annual-revenue" className="text-sm font-medium text-gray-700">
                          Annual Revenue
                        </Label>
                        <Input
                          id="annual-revenue"
                          type="number"
                          value={annualRevenue}
                          onChange={(e) => setAnnualRevenue(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="20,000"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="annual-costs" className="text-sm font-medium text-gray-700">
                          Annual Operating Costs
                        </Label>
                        <Input
                          id="annual-costs"
                          type="number"
                          value={annualCosts}
                          onChange={(e) => setAnnualCosts(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="5,000"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="project-duration" className="text-sm font-medium text-gray-700">
                          Project Duration (Years)
                        </Label>
                        <Input
                          id="project-duration"
                          type="number"
                          value={projectDuration}
                          onChange={(e) => setProjectDuration(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="3"
                          min="1"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      onClick={calculationType === 'basic' ? calculateBasicROI : calculationType === 'investment' ? calculateInvestmentROI : calculateBusinessROI}
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Calculate ROI
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
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">ROI Analysis</h2>
                  
                  {result ? (
                    <div className="space-y-6">
                      {/* ROI Display */}
                      <div className="bg-white rounded-lg p-6 border border-gray-100">
                        <div className="text-center space-y-2">
                          <div className="text-sm text-gray-600">Return on Investment</div>
                          <div className={`text-4xl font-bold ${result.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercentage(result.roi)}
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
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Final Value</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(result.finalValue)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Total Gain/Loss</span>
                          <span className={`font-semibold ${result.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {result.totalGain >= 0 ? '+' : ''}{formatCurrency(result.totalGain)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Annualized ROI</span>
                          <span className={`font-semibold ${result.annualizedROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercentage(result.annualizedROI)}
                          </span>
                        </div>
                        {calculationType === 'business' && result.breakEvenTime > 0 && (
                          <div className="flex justify-between items-center py-3">
                            <span className="text-gray-600">Break-even Time</span>
                            <span className="font-semibold text-gray-900">
                              {result.breakEvenTime.toFixed(1)} years
                            </span>
                          </div>
                        )}
                      </div>

                      {/* ROI Interpretation */}
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Interpretation</h3>
                        <div className={`p-4 rounded-lg border ${
                          result.roi >= 20 ? 'bg-green-50 border-green-200' :
                          result.roi >= 10 ? 'bg-yellow-50 border-yellow-200' :
                          result.roi >= 0 ? 'bg-blue-50 border-blue-200' :
                          'bg-red-50 border-red-200'
                        }`}>
                          <div className={`text-sm ${
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
                    <div className="text-center py-12">
                      <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Enter investment details and click calculate to see ROI analysis</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Educational Content */}
          <div className="mt-12 space-y-12">
            {/* What is ROI Section */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What is ROI (Return on Investment)?</h2>
                <div className="prose prose-lg max-w-none text-gray-600">
                  <p className="text-lg leading-relaxed mb-6">
                    <strong>Return on Investment (ROI)</strong> is a fundamental financial metric used to evaluate the efficiency and profitability of an investment. 
                    ROI measures how much profit or loss an investment generates relative to its cost, expressed as a percentage. 
                    This powerful calculation helps investors, businesses, and individuals make informed financial decisions by comparing the potential returns of different investment opportunities.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-semibold text-blue-900 mb-3">ROI Formula</h3>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-700 mb-2">
                        ROI = (Gain from Investment - Cost of Investment) / Cost of Investment × 100%
                      </div>
                      <p className="text-blue-600">Also expressed as: ROI = (Net Profit / Investment Cost) × 100%</p>
                    </div>
                  </div>

                  <p className="text-lg leading-relaxed">
                    Our free ROI calculator simplifies this process by automatically computing returns for various investment types, 
                    including basic investments, compound investment strategies, and business projects. Whether you're evaluating 
                    stock market investments, real estate opportunities, business ventures, or educational investments, 
                    understanding ROI is crucial for maximizing your financial success.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How to Use Section */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Use the ROI Calculator</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold text-blue-600">1</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Basic ROI Calculation</h3>
                    <p className="text-gray-600">
                      Enter your initial investment amount and final value to calculate simple ROI. 
                      Perfect for evaluating stock trades, bond investments, or any straightforward investment scenario.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold text-green-600">2</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Investment ROI</h3>
                    <p className="text-gray-600">
                      Calculate returns for investments with regular contributions, such as 401(k) plans, 
                      monthly savings, or systematic investment plans (SIP) with compound growth.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold text-purple-600">3</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Business ROI</h3>
                    <p className="text-gray-600">
                      Evaluate business projects by entering project costs, expected revenue, and operating expenses. 
                      Essential for capital allocation decisions and project prioritization.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits for Different Audiences */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">ROI Calculator Benefits by Audience</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-white text-xl font-bold">📚</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Students & New Investors</h3>
                    <div className="space-y-3 text-gray-700">
                      <p><strong>Learn Investment Fundamentals:</strong> Understand how returns work across different investment types and time horizons.</p>
                      <p><strong>Education Planning:</strong> Calculate the return on investment for college courses, certifications, or educational programs using our <a href="/tools/education-loan-calculator" className="text-blue-600 hover:text-blue-700 underline">Education Loan Calculator</a>.</p>
                      <p><strong>First-Time Investing:</strong> Compare potential returns from stocks, bonds, and <a href="/tools/compound-interest-calculator" className="text-blue-600 hover:text-blue-700 underline">compound interest</a> investments.</p>
                      <p><strong>Goal Setting:</strong> Plan for financial milestones like buying a car or saving for a down payment with our <a href="/tools/savings-goal-calculator" className="text-blue-600 hover:text-blue-700 underline">Savings Goal Calculator</a>.</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-white text-xl font-bold">💼</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Working Professionals</h3>
                    <div className="space-y-3 text-gray-700">
                      <p><strong>Retirement Planning:</strong> Optimize 401(k) and IRA contributions with our comprehensive <a href="/tools/retirement-calculator" className="text-green-600 hover:text-green-700 underline">Retirement Calculator</a>.</p>
                      <p><strong>Career Investment:</strong> Evaluate the ROI of professional certifications, MBA programs, or skill development courses.</p>
                      <p><strong>Home Ownership:</strong> Analyze real estate investments and mortgage decisions using our <a href="/tools/mortgage-calculator" className="text-green-600 hover:text-green-700 underline">Mortgage Calculator</a>.</p>
                      <p><strong>Stock Portfolio Management:</strong> Track and optimize your investment portfolio performance with detailed ROI analysis.</p>
                      <p><strong>Debt Management:</strong> Compare investment returns with debt payoff strategies using our <a href="/tools/debt-payoff-calculator" className="text-green-600 hover:text-green-700 underline">Debt Payoff Calculator</a>.</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-xl">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-white text-xl font-bold">🏢</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Owners & Entrepreneurs</h3>
                    <div className="space-y-3 text-gray-700">
                      <p><strong>Business Financing:</strong> Evaluate loan options and capital investments with our <a href="/tools/business-loan-calculator" className="text-purple-600 hover:text-purple-700 underline">Business Loan Calculator</a>.</p>
                      <p><strong>Marketing ROI:</strong> Measure advertising campaign effectiveness and customer acquisition costs across different channels.</p>
                      <p><strong>Equipment & Technology:</strong> Justify capital expenditures on machinery, software, or technology upgrades.</p>
                      <p><strong>Expansion Analysis:</strong> Evaluate new location openings, product launches, or market expansion opportunities.</p>
                      <p><strong>Investment Decisions:</strong> Compare business reinvestment options with external investment opportunities.</p>
                      <p><strong>Break-Even Planning:</strong> Determine project viability with our <a href="/tools/break-even-calculator" className="text-purple-600 hover:text-purple-700 underline">Break-Even Calculator</a>.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Use Cases Section */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Comprehensive ROI Calculator Use Cases</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">📈 Investment Analysis</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong className="text-gray-900">Stock Market Investments:</strong>
                          <span className="text-gray-600"> Calculate returns on individual stocks, ETFs, or mutual funds with dividend reinvestment</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong className="text-gray-900">Real Estate Investments:</strong>
                          <span className="text-gray-600"> Evaluate rental properties, REITs, and property appreciation using our <a href="/tools/mortgage-calculator" className="text-blue-600 hover:text-blue-700 underline">Mortgage Calculator</a></span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong className="text-gray-900">Cryptocurrency Trading:</strong>
                          <span className="text-gray-600"> Analyze digital asset investment performance and trading strategies</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong className="text-gray-900">Retirement Accounts:</strong>
                          <span className="text-gray-600"> Project 401(k), IRA, and pension growth with our <a href="/tools/retirement-calculator" className="text-blue-600 hover:text-blue-700 underline">Retirement Calculator</a></span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong className="text-gray-900">SIP Investments:</strong>
                          <span className="text-gray-600"> Calculate systematic investment plan returns with our <a href="/tools/sip-calculator" className="text-blue-600 hover:text-blue-700 underline">SIP Calculator</a></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">🏢 Business Applications</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong className="text-gray-900">Marketing Campaigns:</strong>
                          <span className="text-gray-600"> Measure advertising spend effectiveness, customer acquisition costs, and campaign performance</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong className="text-gray-900">Equipment & Technology:</strong>
                          <span className="text-gray-600"> Justify capital expenditures on machinery, software, and technology upgrades</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong className="text-gray-900">Employee Training:</strong>
                          <span className="text-gray-600"> Calculate returns on employee development, certification programs, and skill training</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong className="text-gray-900">Business Loans:</strong>
                          <span className="text-gray-600"> Evaluate financing options and loan terms with our <a href="/tools/business-loan-calculator" className="text-green-600 hover:text-green-700 underline">Business Loan Calculator</a></span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong className="text-gray-900">Process Optimization:</strong>
                          <span className="text-gray-600"> Assess efficiency initiatives, automation projects, and operational improvements</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">🔗 Related Financial Planning Tools</h3>
                  <p className="text-gray-600 mb-4">
                    Maximize your ROI analysis by combining it with our other financial calculators for comprehensive planning:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <a href="/tools/compound-interest-calculator" className="group text-center p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300">
                      <i className="fas fa-chart-line text-green-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-800">Compound Interest</div>
                      <div className="text-xs text-gray-500 mt-1">Growth calculation</div>
                    </a>
                    <a href="/tools/simple-interest-calculator" className="group text-center p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300">
                      <i className="fas fa-percentage text-blue-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-800">Simple Interest</div>
                      <div className="text-xs text-gray-500 mt-1">Basic calculation</div>
                    </a>
                    <a href="/tools/investment-return-calculator" className="group text-center p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300">
                      <i className="fas fa-chart-area text-purple-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-800">Investment Returns</div>
                      <div className="text-xs text-gray-500 mt-1">Portfolio analysis</div>
                    </a>
                    <a href="/tools/net-worth-calculator" className="group text-center p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300">
                      <i className="fas fa-coins text-yellow-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-800">Net Worth</div>
                      <div className="text-xs text-gray-500 mt-1">Wealth tracking</div>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Understanding Results Section */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Understanding Your ROI Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">ROI Interpretation Guide</h3>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                        <div className="flex items-center mb-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          <strong className="text-green-800">Excellent ROI (20%+)</strong>
                        </div>
                        <p className="text-green-700 text-sm">Outstanding investment performance, significantly above market averages</p>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                        <div className="flex items-center mb-2">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                          <strong className="text-blue-800">Good ROI (10-20%)</strong>
                        </div>
                        <p className="text-blue-700 text-sm">Solid returns that beat inflation and many traditional investments</p>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                        <div className="flex items-center mb-2">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                          <strong className="text-yellow-800">Average ROI (5-10%)</strong>
                        </div>
                        <p className="text-yellow-700 text-sm">Modest returns, comparable to market indices and savings accounts</p>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-red-50 border-red-200">
                        <div className="flex items-center mb-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                          <strong className="text-red-800">Poor ROI (Below 5% or Negative)</strong>
                        </div>
                        <p className="text-red-700 text-sm">Underperforming investments that may require reassessment</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">Key Metrics Explained</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <strong className="text-gray-900">Annualized ROI:</strong>
                        <p className="text-gray-600 text-sm">
                          Shows the equivalent yearly return rate, essential for comparing investments over different time periods.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <strong className="text-gray-900">Total Gain/Loss:</strong>
                        <p className="text-gray-600 text-sm">
                          The absolute dollar amount gained or lost, helping you understand the actual financial impact.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <strong className="text-gray-900">Break-even Time:</strong>
                        <p className="text-gray-600 text-sm">
                          For business investments, this shows how long it takes to recover your initial investment.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <strong className="text-gray-900">Final Value:</strong>
                        <p className="text-gray-600 text-sm">
                          The total worth of your investment at the end of the period, including principal and gains.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips and Best Practices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">ROI Best Practices</h3>
                  <div className="space-y-4">
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong className="text-gray-900">Consider Time Value:</strong>
                          <span> Account for inflation and opportunity costs when evaluating long-term investments</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong className="text-gray-900">Include All Costs:</strong>
                          <span> Factor in fees, taxes, maintenance costs, and other expenses</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong className="text-gray-900">Risk Assessment:</strong>
                          <span> Balance high ROI potential with investment risk tolerance</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong className="text-gray-900">Regular Reviews:</strong>
                          <span> Monitor and recalculate ROI periodically to track performance</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong className="text-gray-900">Diversification:</strong>
                          <span> Use ROI analysis to build a balanced investment portfolio</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Common ROI Mistakes to Avoid</h3>
                  <div className="space-y-4">
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong className="text-gray-900">Ignoring Inflation:</strong>
                          <span> Not accounting for purchasing power erosion over time</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong className="text-gray-900">Short-term Focus:</strong>
                          <span> Making decisions based solely on recent performance</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong className="text-gray-900">Hidden Costs:</strong>
                          <span> Overlooking transaction fees, management fees, and taxes</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong className="text-gray-900">Cherry-picking Data:</strong>
                          <span> Selecting favorable time periods that don't represent true performance</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong className="text-gray-900">Unrealistic Expectations:</strong>
                          <span> Expecting consistently high returns without considering market volatility</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">ROI Calculator - Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">What is a good ROI percentage?</h4>
                      <p className="text-gray-600">A good ROI depends on the investment type and risk level. Stock market investments averaging 10-15% annually are excellent, while business projects often target 20%+ ROI. Real estate typically yields 8-12%, and our <a href="/tools/compound-interest-calculator" className="text-blue-600 hover:text-blue-700 underline">Compound Interest Calculator</a> can help you understand long-term growth potential.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">How do I calculate ROI for multiple investments?</h4>
                      <p className="text-gray-600">Calculate ROI for each investment separately, then determine your portfolio's weighted average ROI based on investment amounts and individual returns. Use our <a href="/tools/investment-return-calculator" className="text-blue-600 hover:text-blue-700 underline">Investment Return Calculator</a> for comprehensive portfolio analysis.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Should I include dividends in ROI calculations?</h4>
                      <p className="text-gray-600">Yes, always include dividends, interest payments, rental income, and other cash flows generated by your investment to get the total return on investment. This provides a complete picture of your investment performance.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">How does ROI differ from simple and compound interest?</h4>
                      <p className="text-gray-600">ROI measures overall investment performance, while interest calculations focus on growth rates. Compare using our <a href="/tools/simple-interest-calculator" className="text-blue-600 hover:text-blue-700 underline">Simple Interest Calculator</a> for basic growth or <a href="/tools/compound-interest-calculator" className="text-blue-600 hover:text-blue-700 underline">Compound Interest Calculator</a> for reinvested earnings.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">What's the best ROI calculator for business decisions?</h4>
                      <p className="text-gray-600">Our business ROI feature handles project costs, revenues, and operating expenses. Combine it with our <a href="/tools/business-loan-calculator" className="text-blue-600 hover:text-blue-700 underline">Business Loan Calculator</a> and <a href="/tools/break-even-calculator" className="text-blue-600 hover:text-blue-700 underline">Break-Even Calculator</a> for comprehensive business analysis.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between ROI and annualized ROI?</h4>
                      <p className="text-gray-600">ROI shows total return over the entire period, while annualized ROI converts this to an equivalent yearly rate, making it easier to compare investments with different time horizons. Annualized ROI is crucial for comparing short-term vs. long-term investments.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Can ROI be negative?</h4>
                      <p className="text-gray-600">Yes, negative ROI indicates a loss on your investment. This occurs when the final value is less than the initial investment amount. Use our <a href="/tools/debt-payoff-calculator" className="text-blue-600 hover:text-blue-700 underline">Debt Payoff Calculator</a> to compare paying down debt vs. investing.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibent text-gray-900 mb-2">How often should I calculate ROI?</h4>
                      <p className="text-gray-600">Review ROI quarterly for active investments and annually for long-term investments. However, avoid making frequent changes based on short-term fluctuations. Use our <a href="/tools/retirement-calculator" className="text-blue-600 hover:text-blue-700 underline">Retirement Calculator</a> for long-term planning.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">How do I factor in taxes when calculating ROI?</h4>
                      <p className="text-gray-600">Calculate ROI using after-tax returns for accurate analysis. Consider capital gains taxes, dividend taxes, and tax-advantaged accounts like 401(k)s and IRAs. Our calculators can help you understand pre-tax vs. post-tax scenarios.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Is this ROI calculator suitable for real estate investments?</h4>
                      <p className="text-gray-600">Yes! Use our basic ROI calculator for property appreciation or the business ROI feature for rental properties. For mortgage-specific calculations, check our <a href="/tools/mortgage-calculator" className="text-blue-600 hover:text-blue-700 underline">Mortgage Calculator</a> to understand financing costs.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Pro Tip: Maximize Your ROI Analysis</h3>
                  <p className="text-blue-800 mb-3">
                    Get the most accurate ROI calculations by using our suite of financial tools together:
                  </p>
                  <ul className="text-blue-700 space-y-2 text-sm">
                    <li>• Start with our <a href="/tools/savings-goal-calculator" className="underline hover:text-blue-900">Savings Goal Calculator</a> to set investment targets</li>
                    <li>• Use <a href="/tools/compound-interest-calculator" className="underline hover:text-blue-900">Compound Interest Calculator</a> for growth projections</li>
                    <li>• Calculate loan impacts with our <a href="/tools/loan-calculator" className="underline hover:text-blue-900">Loan Calculator</a></li>
                    <li>• Plan for retirement with our <a href="/tools/retirement-calculator" className="underline hover:text-blue-900">Retirement Calculator</a></li>
                    <li>• Track your progress with our <a href="/tools/net-worth-calculator" className="underline hover:text-blue-900">Net Worth Calculator</a></li>
                  </ul>
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

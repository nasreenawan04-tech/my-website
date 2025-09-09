
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Calculator, TrendingUp } from 'lucide-react';

interface InvestmentResult {
  finalValue: number;
  totalReturn: number;
  absoluteReturn: number;
  annualizedReturn: number;
  totalInterestEarned: number;
  roi: number;
}

const InvestmentReturnCalculator = () => {
  const [initialInvestment, setInitialInvestment] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('');
  const [investmentPeriod, setInvestmentPeriod] = useState('');
  const [periodType, setPeriodType] = useState('years');
  const [compoundingFrequency, setCompoundingFrequency] = useState('monthly');
  const [currency, setCurrency] = useState('USD');
  const [inflationRate, setInflationRate] = useState('');
  const [result, setResult] = useState<InvestmentResult | null>(null);

  const calculateInvestmentReturn = () => {
    const principal = parseFloat(initialInvestment);
    const monthlyAdd = parseFloat(monthlyContribution) || 0;
    const annualRate = parseFloat(expectedReturn) / 100;
    const years = periodType === 'years' ? parseFloat(investmentPeriod) : parseFloat(investmentPeriod) / 12;
    const inflation = parseFloat(inflationRate) / 100 || 0;

    if (principal && annualRate && years) {
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
      const absoluteReturn = (totalReturn / totalInvested) * 100;
      const annualizedReturn = Math.pow(finalValue / totalInvested, 1 / years) - 1;
      const roi = (totalReturn / totalInvested) * 100;

      // Adjust for inflation if provided
      const realValue = inflation > 0 ? finalValue / Math.pow(1 + inflation, years) : finalValue;

      setResult({
        finalValue: Math.round(finalValue * 100) / 100,
        totalReturn: Math.round(totalReturn * 100) / 100,
        absoluteReturn: Math.round(absoluteReturn * 100) / 100,
        annualizedReturn: Math.round(annualizedReturn * 10000) / 100,
        totalInterestEarned: Math.round(totalReturn * 100) / 100,
        roi: Math.round(roi * 100) / 100
      });
    }
  };

  const resetCalculator = () => {
    setInitialInvestment('');
    setMonthlyContribution('');
    setExpectedReturn('');
    setInvestmentPeriod('');
    setPeriodType('years');
    setCompoundingFrequency('monthly');
    setCurrency('USD');
    setInflationRate('');
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
    <>
      <Helmet>
        <title>Investment Return Calculator - Calculate Investment Returns | ToolsHub</title>
        <meta name="description" content="Free investment return calculator to calculate returns on investments with compound interest, monthly contributions, and inflation adjustment." />
        <meta name="keywords" content="investment calculator, return on investment, compound interest calculator, investment growth calculator" />
        <meta property="og:title" content="Investment Return Calculator - Calculate Investment Returns | ToolsHub" />
        <meta property="og:description" content="Free investment return calculator to calculate returns on investments with compound interest, monthly contributions, and inflation adjustment." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/investment-return-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-investment-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="gradient-hero text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="text-3xl w-10 h-10" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Investment Return Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate investment returns with compound interest, monthly contributions, and inflation adjustment worldwide
              </p>
            </div>
          </section>

          {/* Calculator Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-currency">
                            <SelectValue placeholder="Select currency" />
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
                      <div className="space-y-3">
                        <Label htmlFor="initial-investment" className="text-sm font-medium text-gray-700">
                          Initial Investment Amount
                        </Label>
                        <Input
                          id="initial-investment"
                          type="number"
                          value={initialInvestment}
                          onChange={(e) => setInitialInvestment(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter initial investment"
                          min="0"
                          step="0.01"
                          data-testid="input-initial-investment"
                        />
                      </div>

                      {/* Monthly Contribution */}
                      <div className="space-y-3">
                        <Label htmlFor="monthly-contribution" className="text-sm font-medium text-gray-700">
                          Monthly Contribution (Optional)
                        </Label>
                        <Input
                          id="monthly-contribution"
                          type="number"
                          value={monthlyContribution}
                          onChange={(e) => setMonthlyContribution(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter monthly contribution"
                          min="0"
                          step="0.01"
                          data-testid="input-monthly-contribution"
                        />
                      </div>

                      {/* Expected Annual Return */}
                      <div className="space-y-3">
                        <Label htmlFor="expected-return" className="text-sm font-medium text-gray-700">
                          Expected Annual Return (%)
                        </Label>
                        <Input
                          id="expected-return"
                          type="number"
                          value={expectedReturn}
                          onChange={(e) => setExpectedReturn(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter expected return rate"
                          min="0"
                          max="100"
                          step="0.01"
                          data-testid="input-expected-return"
                        />
                      </div>

                      {/* Investment Period */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">Investment Period</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            type="number"
                            value={investmentPeriod}
                            onChange={(e) => setInvestmentPeriod(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="Enter period"
                            min="1"
                            data-testid="input-investment-period"
                          />
                          <Select value={periodType} onValueChange={setPeriodType}>
                            <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-period-type">
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
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">Compounding Frequency</Label>
                        <Select value={compoundingFrequency} onValueChange={setCompoundingFrequency}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-compounding">
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

                      {/* Inflation Rate */}
                      <div className="space-y-3">
                        <Label htmlFor="inflation-rate" className="text-sm font-medium text-gray-700">
                          Annual Inflation Rate (% - Optional)
                        </Label>
                        <Input
                          id="inflation-rate"
                          type="number"
                          value={inflationRate}
                          onChange={(e) => setInflationRate(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter inflation rate"
                          min="0"
                          max="100"
                          step="0.01"
                          data-testid="input-inflation-rate"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateInvestmentReturn}
                          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate
                        </Button>
                        <Button
                          onClick={resetCalculator}
                          variant="outline"
                          className="h-12 px-8 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-lg"
                          data-testid="button-reset"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>

                    {/* Results Section */}
                    <div className="bg-gray-50 rounded-xl p-8">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Investment Returns</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="investment-results">
                          {/* Final Investment Value */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Final Investment Value</span>
                              <span className="text-2xl font-bold text-green-600" data-testid="text-final-value">
                                {formatCurrency(result.finalValue)}
                              </span>
                            </div>
                          </div>

                          {/* Total Return */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Total Return</span>
                              <span className="text-xl font-bold text-blue-600" data-testid="text-total-return">
                                {formatCurrency(result.totalReturn)}
                              </span>
                            </div>
                          </div>

                          {/* Return Metrics */}
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Absolute Return</span>
                              <span className="font-semibold" data-testid="text-absolute-return">
                                {result.absoluteReturn}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Annualized Return</span>
                              <span className="font-semibold" data-testid="text-annualized-return">
                                {result.annualizedReturn}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">ROI</span>
                              <span className="font-semibold" data-testid="text-roi">
                                {result.roi}%
                              </span>
                            </div>
                          </div>

                          {/* Visual Progress Bar */}
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Investment Growth</h3>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <div 
                                  className="h-6 bg-gradient-to-r from-green-400 to-green-600 rounded"
                                  style={{ width: `${Math.min((result.totalReturn / result.finalValue) * 100, 100)}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Initial Investment + Contributions</span>
                                <span className="text-green-600 font-semibold">Returns Earned</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <TrendingUp className="w-16 h-16 text-gray-400 mb-4 mx-auto" />
                          <p className="text-gray-500">Enter investment details to calculate returns</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-12">
                {/* What Is Investment Return Calculator */}
                <section className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">What is an Investment Return Calculator?</h2>
                  <div className="prose max-w-none">
                    <p className="text-lg text-gray-600 leading-relaxed mb-6">
                      An investment return calculator is a powerful financial tool that helps investors estimate the future value of their investments 
                      based on various parameters such as initial investment amount, monthly contributions, expected annual return rate, and investment 
                      duration. This calculator uses compound interest formulas to project how your money will grow over time, making it an essential 
                      tool for financial planning and investment decision-making.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed mb-6">
                      Our advanced investment return calculator supports multiple currencies, various compounding frequencies, and inflation adjustment features, 
                      providing comprehensive analysis for both novice and experienced investors worldwide. Whether you're planning for retirement, 
                      saving for a major purchase, or evaluating different investment opportunities, this tool simplifies complex calculations and helps 
                      you make informed financial decisions.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      The calculator integrates seamlessly with other financial planning tools on our platform. Use it alongside our 
                      <a href="/tools/compound-interest-calculator" className="text-blue-600 hover:text-blue-700 underline mx-1">Compound Interest Calculator</a> 
                      for detailed growth analysis, or combine it with our 
                      <a href="/tools/retirement-calculator" className="text-blue-600 hover:text-blue-700 underline mx-1">Retirement Calculator</a> 
                      and <a href="/tools/sip-calculator" className="text-blue-600 hover:text-blue-700 underline mx-1">SIP Calculator</a> 
                      for comprehensive retirement planning strategies.
                    </p>
                  </div>
                </section>

                {/* Benefits for Different Audiences */}
                <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Investment Return Calculator Benefits for Every Investor</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Students */}
                    <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-2xl">🎓</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">For Students</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 mt-2"></div>
                          <span>Calculate education loan impact with our <a href="/tools/education-loan-calculator" className="text-green-600 hover:text-green-700 underline">Education Loan Calculator</a></span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 mt-2"></div>
                          <span>Plan small investments while studying (₹500-2000/month)</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 mt-2"></div>
                          <span>Understand compound interest benefits for early investing</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 mt-2"></div>
                          <span>Learn financial planning fundamentals with practical calculations</span>
                        </li>
                      </ul>
                    </div>

                    {/* Young Professionals */}
                    <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-2xl">💼</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">For Young Professionals</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 mt-2"></div>
                          <span>Optimize salary investments using <a href="/tools/salary-to-hourly-calculator" className="text-blue-600 hover:text-blue-700 underline">Salary Calculator</a></span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 mt-2"></div>
                          <span>Build emergency funds with high-yield savings projections</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 mt-2"></div>
                          <span>Plan for major purchases (car, home down payment)</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 mt-2"></div>
                          <span>Compare investment options: stocks, mutual funds, ETFs</span>
                        </li>
                      </ul>
                    </div>

                    {/* Experienced Professionals */}
                    <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-2xl">👔</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">For Experienced Professionals</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3 mt-2"></div>
                          <span>Accelerate retirement planning with our <a href="/tools/retirement-calculator" className="text-purple-600 hover:text-purple-700 underline">Retirement Calculator</a></span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3 mt-2"></div>
                          <span>Evaluate portfolio rebalancing strategies</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3 mt-2"></div>
                          <span>Calculate children's education funding needs</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3 mt-2"></div>
                          <span>Optimize tax-advantaged investment accounts</span>
                        </li>
                      </ul>
                    </div>

                    {/* Business Owners */}
                    <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-2xl">🏢</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">For Business Owners</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3 mt-2"></div>
                          <span>Analyze business investment ROI with <a href="/tools/roi-calculator" className="text-orange-600 hover:text-orange-700 underline">ROI Calculator</a></span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3 mt-2"></div>
                          <span>Plan equipment financing vs. investment trade-offs</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3 mt-2"></div>
                          <span>Evaluate business expansion funding options</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3 mt-2"></div>
                          <span>Calculate business loan impacts using <a href="/tools/business-loan-calculator" className="text-orange-600 hover:text-orange-700 underline">Business Loan Calculator</a></span>
                        </li>
                      </ul>
                    </div>

                    {/* Retirees & Pre-Retirees */}
                    <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-500">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-2xl">🏖️</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">For Retirees & Pre-Retirees</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3 mt-2"></div>
                          <span>Plan withdrawal strategies from retirement accounts</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3 mt-2"></div>
                          <span>Calculate inflation-adjusted income needs</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3 mt-2"></div>
                          <span>Evaluate conservative investment portfolio returns</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3 mt-2"></div>
                          <span>Plan legacy and estate investment strategies</span>
                        </li>
                      </ul>
                    </div>

                    {/* Investors & Traders */}
                    <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-indigo-500">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-2xl">📈</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">For Active Investors & Traders</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3 mt-2"></div>
                          <span>Calculate stock profits with <a href="/tools/stock-profit-calculator" className="text-indigo-600 hover:text-indigo-700 underline">Stock Profit Calculator</a></span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3 mt-2"></div>
                          <span>Analyze crypto investment returns with <a href="/tools/cryptocurrency-converter" className="text-indigo-600 hover:text-indigo-700 underline">Crypto Converter</a></span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3 mt-2"></div>
                          <span>Compare different asset class performance</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3 mt-2"></div>
                          <span>Model portfolio diversification strategies</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* How Investment Returns Work */}
                <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">How Investment Returns and Compound Interest Work</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">The Power of Compounding</h3>
                      <p className="text-gray-600 mb-4">
                        Compound interest is often called the "eighth wonder of the world" because it allows your investment returns to generate 
                        their own returns over time. Unlike simple interest, which only earns returns on the principal amount, compound interest 
                        earns returns on both the principal and previously earned returns.
                      </p>
                      <p className="text-gray-600 mb-4">
                        For example, if you invest $10,000 at 8% annual return, after one year you'll have $10,800. In the second year, 
                        you earn 8% on the full $10,800, not just the original $10,000. This compounding effect accelerates wealth building 
                        significantly over longer time periods.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Investment Return Factors</h3>
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                          <h4 className="font-semibold text-gray-900 mb-2">Time Horizon</h4>
                          <p className="text-gray-600 text-sm">Longer investment periods allow more time for compound growth to work its magic.</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                          <h4 className="font-semibold text-gray-900 mb-2">Return Rate</h4>
                          <p className="text-gray-600 text-sm">Higher expected returns lead to greater wealth accumulation, but often come with increased risk.</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                          <h4 className="font-semibold text-gray-900 mb-2">Regular Contributions</h4>
                          <p className="text-gray-600 text-sm">Consistent monthly additions can dramatically increase your final investment value.</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
                          <h4 className="font-semibold text-gray-900 mb-2">Compounding Frequency</h4>
                          <p className="text-gray-600 text-sm">More frequent compounding (daily vs. annually) can slightly increase total returns.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Investment Return Calculator Uses */}
                <section className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Comprehensive Investment Return Calculator Use Cases</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Retirement Planning */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Retirement Planning</h3>
                      <p className="text-gray-600 mb-4">
                        Calculate how much your 401(k), IRA, or other retirement investments will grow over time. 
                        Combine with our <a href="/tools/retirement-calculator" className="text-blue-600 hover:text-blue-700 underline">Retirement Calculator</a> 
                        for comprehensive retirement planning.
                      </p>
                      <div className="text-sm text-blue-600 font-medium mb-2">Example: $500/month for 30 years at 7% return = $611,729</div>
                      <div className="text-xs text-gray-500">Also use: <a href="/tools/compound-interest-calculator" className="text-blue-500 hover:text-blue-600 underline">Compound Interest Calculator</a></div>
                    </div>

                    {/* Education Funding */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Calculator className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Education Funding</h3>
                      <p className="text-gray-600 mb-4">
                        Plan and save for college expenses by calculating investment growth for education savings accounts like 529 plans. 
                        Compare with <a href="/tools/education-loan-calculator" className="text-green-600 hover:text-green-700 underline">Education Loan costs</a>.
                      </p>
                      <div className="text-sm text-green-600 font-medium mb-2">Example: $300/month for 18 years at 6% return = $131,380</div>
                      <div className="text-xs text-gray-500">Also use: <a href="/tools/savings-goal-calculator" className="text-green-500 hover:text-green-600 underline">Savings Goal Calculator</a></div>
                    </div>

                    {/* Stock Portfolio Growth */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Stock Portfolio Growth</h3>
                      <p className="text-gray-600 mb-4">
                        Evaluate potential returns from stock market investments, mutual funds, and ETF portfolios. 
                        Use our <a href="/tools/stock-profit-calculator" className="text-purple-600 hover:text-purple-700 underline">Stock Profit Calculator</a> 
                        for individual stock analysis.
                      </p>
                      <div className="text-sm text-purple-600 font-medium mb-2">Example: $10,000 initial + $200/month at 9% return = $78,954</div>
                      <div className="text-xs text-gray-500">Also use: <a href="/tools/roi-calculator" className="text-purple-500 hover:text-purple-600 underline">ROI Calculator</a></div>
                    </div>

                    {/* Emergency Fund Building */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                        <Calculator className="w-6 h-6 text-red-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Emergency Fund Building</h3>
                      <p className="text-gray-600 mb-4">
                        Calculate growth of high-yield savings accounts, money market funds, and other safe investment options. 
                        Track your progress with our <a href="/tools/net-worth-calculator" className="text-red-600 hover:text-red-700 underline">Net Worth Calculator</a>.
                      </p>
                      <div className="text-sm text-red-600 font-medium mb-2">Example: $250/month at 4% return for 5 years = $16,598</div>
                      <div className="text-xs text-gray-500">Also use: <a href="/tools/simple-interest-calculator" className="text-red-500 hover:text-red-600 underline">Simple Interest Calculator</a></div>
                    </div>

                    {/* Real Estate Investment */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6 text-yellow-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Real Estate Investment</h3>
                      <p className="text-gray-600 mb-4">
                        Evaluate returns from REITs, rental property investments, and real estate crowdfunding platforms. 
                        Compare with property financing using our <a href="/tools/home-loan-calculator" className="text-yellow-600 hover:text-yellow-700 underline">Home Loan Calculator</a>.
                      </p>
                      <div className="text-sm text-yellow-600 font-medium mb-2">Example: $5,000 REIT investment at 8% annual return</div>
                      <div className="text-xs text-gray-500">Also use: <a href="/tools/mortgage-calculator" className="text-yellow-500 hover:text-yellow-600 underline">Mortgage Calculator</a></div>
                    </div>

                    {/* Business Investment */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                        <Calculator className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Business Investment</h3>
                      <p className="text-gray-600 mb-4">
                        Project returns on business investments, equipment purchases, and expansion funding. 
                        Analyze financing options with our <a href="/tools/business-loan-calculator" className="text-indigo-600 hover:text-indigo-700 underline">Business Loan Calculator</a>.
                      </p>
                      <div className="text-sm text-indigo-600 font-medium mb-2">Example: $50,000 equipment investment ROI calculation</div>
                      <div className="text-xs text-gray-500">Also use: <a href="/tools/break-even-calculator" className="text-indigo-500 hover:text-indigo-600 underline">Break-Even Calculator</a></div>
                    </div>

                    {/* SIP & Mutual Fund Planning */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6 text-teal-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">SIP & Mutual Fund Planning</h3>
                      <p className="text-gray-600 mb-4">
                        Calculate systematic investment plan returns and mutual fund growth projections. 
                        Use our dedicated <a href="/tools/sip-calculator" className="text-teal-600 hover:text-teal-700 underline">SIP Calculator</a> 
                        for detailed mutual fund analysis.
                      </p>
                      <div className="text-sm text-teal-600 font-medium mb-2">Example: ₹5,000/month SIP for 15 years at 12% return = ₹37.5 Lakh</div>
                      <div className="text-xs text-gray-500">Popular in India: Equity SIP, ELSS, Index Funds</div>
                    </div>

                    {/* Debt vs Investment Analysis */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                        <Calculator className="w-6 h-6 text-orange-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Debt vs Investment Analysis</h3>
                      <p className="text-gray-600 mb-4">
                        Compare investment returns against debt interest rates to optimize financial decisions. 
                        Use our <a href="/tools/debt-payoff-calculator" className="text-orange-600 hover:text-orange-700 underline">Debt Payoff Calculator</a> 
                        for comprehensive debt analysis.
                      </p>
                      <div className="text-sm text-orange-600 font-medium mb-2">Example: 8% investment return vs 15% credit card debt</div>
                      <div className="text-xs text-gray-500">Also use: <a href="/tools/credit-card-interest-calculator" className="text-orange-500 hover:text-orange-600 underline">Credit Card Calculator</a></div>
                    </div>

                    {/* Cryptocurrency Investment */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6 text-pink-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Cryptocurrency Investment</h3>
                      <p className="text-gray-600 mb-4">
                        Model cryptocurrency investment scenarios with high volatility considerations. 
                        Track crypto values with our <a href="/tools/cryptocurrency-converter" className="text-pink-600 hover:text-pink-700 underline">Cryptocurrency Converter</a>.
                      </p>
                      <div className="text-sm text-pink-600 font-medium mb-2">Example: $100/month DCA into Bitcoin/Ethereum</div>
                      <div className="text-xs text-gray-500">High risk, high reward - use only 5-10% of portfolio</div>
                    </div>
                  </div>
                </section>

                {/* Investment Return Formula */}
                <section className="bg-gray-50 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Investment Return Calculation Formula</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-blue-900 mb-4">Compound Interest Formula</h3>
                      <div className="bg-white rounded-lg p-4 font-mono text-sm mb-4">
                        A = P(1 + r/n)^(nt)
                      </div>
                      <div className="space-y-2 text-sm text-blue-800">
                        <p><strong>A</strong> = Final amount</p>
                        <p><strong>P</strong> = Principal (initial investment)</p>
                        <p><strong>r</strong> = Annual interest rate (decimal)</p>
                        <p><strong>n</strong> = Compounding frequency per year</p>
                        <p><strong>t</strong> = Number of years</p>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-green-900 mb-4">Monthly Contributions Formula</h3>
                      <div className="bg-white rounded-lg p-4 font-mono text-sm mb-4">
                        FV = PMT × [((1 + r)^n - 1) / r]
                      </div>
                      <div className="space-y-2 text-sm text-green-800">
                        <p><strong>FV</strong> = Future value of contributions</p>
                        <p><strong>PMT</strong> = Monthly payment amount</p>
                        <p><strong>r</strong> = Monthly interest rate</p>
                        <p><strong>n</strong> = Total number of payments</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Investment Tips and Best Practices */}
                <section className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Investment Tips and Best Practices</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">💡 Smart Investment Strategies</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                          <div>
                            <strong className="text-gray-900">Start Early:</strong>
                            <p className="text-gray-600 text-sm mt-1">Time is your greatest asset in investing. Even small amounts invested early can grow significantly through compound interest.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                          <div>
                            <strong className="text-gray-900">Diversify Your Portfolio:</strong>
                            <p className="text-gray-600 text-sm mt-1">Spread your investments across different asset classes, sectors, and geographic regions to reduce risk.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                          <div>
                            <strong className="text-gray-900">Dollar-Cost Averaging:</strong>
                            <p className="text-gray-600 text-sm mt-1">Invest fixed amounts regularly to smooth out market volatility and reduce timing risk.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                          <div>
                            <strong className="text-gray-900">Consider Inflation:</strong>
                            <p className="text-gray-600 text-sm mt-1">Factor in inflation when calculating real returns. Aim for returns that exceed inflation rates to maintain purchasing power.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">⚠️ Risk Management</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                          <div>
                            <strong className="text-gray-900">Understand Risk Tolerance:</strong>
                            <p className="text-gray-600 text-sm mt-1">Higher potential returns typically come with higher risk. Assess your comfort level with market volatility.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                          <div>
                            <strong className="text-gray-900">Emergency Fund First:</strong>
                            <p className="text-gray-600 text-sm mt-1">Build 3-6 months of expenses in emergency savings before investing in higher-risk assets.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                          <div>
                            <strong className="text-gray-900">Avoid Emotional Decisions:</strong>
                            <p className="text-gray-600 text-sm mt-1">Stick to your long-term investment plan and avoid making impulsive decisions based on short-term market movements.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                          <div>
                            <strong className="text-gray-900">Regular Review and Rebalancing:</strong>
                            <p className="text-gray-600 text-sm mt-1">Periodically review your portfolio and rebalance to maintain your desired asset allocation.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Expected Return Rates by Investment Type */}
                <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Expected Return Rates by Investment Type</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 border-l-4 border-green-500">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Stock Market (S&P 500)</h3>
                      <div className="text-3xl font-bold text-green-600 mb-2">7-10%</div>
                      <p className="text-sm text-green-700">Historical average annual return over long periods, but with significant year-to-year volatility.</p>
                    </div>
                    <div className="bg-white rounded-lg p-6 border-l-4 border-blue-500">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Corporate Bonds</h3>
                      <div className="text-3xl font-bold text-blue-600 mb-2">4-6%</div>
                      <p className="text-sm text-blue-700">More stable than stocks with lower but more predictable returns, varying by credit quality.</p>
                    </div>
                    <div className="bg-white rounded-lg p-6 border-l-4 border-purple-500">
                      <h3 className="text-lg font-semibold text-purple-900 mb-3">Real Estate (REITs)</h3>
                      <div className="text-3xl font-bold text-purple-600 mb-2">6-8%</div>
                      <p className="text-sm text-purple-700">Real Estate Investment Trusts provide exposure to real estate markets with dividend income.</p>
                    </div>
                    <div className="bg-white rounded-lg p-6 border-l-4 border-yellow-500">
                      <h3 className="text-lg font-semibold text-yellow-900 mb-3">High-Yield Savings</h3>
                      <div className="text-3xl font-bold text-yellow-600 mb-2">2-5%</div>
                      <p className="text-sm text-yellow-700">FDIC-insured accounts with minimal risk but lower returns, suitable for emergency funds.</p>
                    </div>
                    <div className="bg-white rounded-lg p-6 border-l-4 border-red-500">
                      <h3 className="text-lg font-semibold text-red-900 mb-3">International Stocks</h3>
                      <div className="text-3xl font-bold text-red-600 mb-2">6-9%</div>
                      <p className="text-sm text-red-700">Diversification benefits but with currency and political risks in emerging markets.</p>
                    </div>
                    <div className="bg-white rounded-lg p-6 border-l-4 border-indigo-500">
                      <h3 className="text-lg font-semibold text-indigo-900 mb-3">Government Bonds</h3>
                      <div className="text-3xl font-bold text-indigo-600 mb-2">2-4%</div>
                      <p className="text-sm text-indigo-700">Ultra-safe investments backed by government creditworthiness with lower returns.</p>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Disclaimer:</strong> These are historical averages and past performance doesn't guarantee future results. 
                      Actual returns can vary significantly based on market conditions, economic factors, and individual investment choices.
                    </p>
                  </div>
                </section>

                {/* Related Financial Calculators */}
                <section className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Complete Your Financial Planning with These Tools</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Investment Tools */}
                    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">📈 Investment Tools</h3>
                      <div className="space-y-3">
                        <a href="/tools/sip-calculator" className="block text-blue-600 hover:text-blue-700 text-sm border-b border-gray-100 pb-2">
                          SIP Calculator →
                        </a>
                        <a href="/tools/compound-interest-calculator" className="block text-blue-600 hover:text-blue-700 text-sm border-b border-gray-100 pb-2">
                          Compound Interest Calculator →
                        </a>
                        <a href="/tools/stock-profit-calculator" className="block text-blue-600 hover:text-blue-700 text-sm border-b border-gray-100 pb-2">
                          Stock Profit Calculator →
                        </a>
                        <a href="/tools/roi-calculator" className="block text-blue-600 hover:text-blue-700 text-sm border-b border-gray-100 pb-2">
                          ROI Calculator →
                        </a>
                        <a href="/tools/cryptocurrency-converter" className="block text-blue-600 hover:text-blue-700 text-sm">
                          Cryptocurrency Converter →
                        </a>
                      </div>
                    </div>

                    {/* Retirement & Savings */}
                    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">🏖️ Retirement & Savings</h3>
                      <div className="space-y-3">
                        <a href="/tools/retirement-calculator" className="block text-green-600 hover:text-green-700 text-sm border-b border-gray-100 pb-2">
                          Retirement Calculator →
                        </a>
                        <a href="/tools/savings-goal-calculator" className="block text-green-600 hover:text-green-700 text-sm border-b border-gray-100 pb-2">
                          Savings Goal Calculator →
                        </a>
                        <a href="/tools/net-worth-calculator" className="block text-green-600 hover:text-green-700 text-sm border-b border-gray-100 pb-2">
                          Net Worth Calculator →
                        </a>
                        <a href="/tools/simple-interest-calculator" className="block text-green-600 hover:text-green-700 text-sm border-b border-gray-100 pb-2">
                          Simple Interest Calculator →
                        </a>
                        <a href="/tools/inflation-calculator" className="block text-green-600 hover:text-green-700 text-sm">
                          Inflation Calculator →
                        </a>
                      </div>
                    </div>

                    {/* Loans & Debt */}
                    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">💳 Loans & Debt</h3>
                      <div className="space-y-3">
                        <a href="/tools/debt-payoff-calculator" className="block text-red-600 hover:text-red-700 text-sm border-b border-gray-100 pb-2">
                          Debt Payoff Calculator →
                        </a>
                        <a href="/tools/loan-calculator" className="block text-red-600 hover:text-red-700 text-sm border-b border-gray-100 pb-2">
                          Loan Calculator →
                        </a>
                        <a href="/tools/emi-calculator" className="block text-red-600 hover:text-red-700 text-sm border-b border-gray-100 pb-2">
                          EMI Calculator →
                        </a>
                        <a href="/tools/credit-card-interest-calculator" className="block text-red-600 hover:text-red-700 text-sm border-b border-gray-100 pb-2">
                          Credit Card Calculator →
                        </a>
                        <a href="/tools/mortgage-calculator" className="block text-red-600 hover:text-red-700 text-sm">
                          Mortgage Calculator →
                        </a>
                      </div>
                    </div>

                    {/* Business & Professional */}
                    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">🏢 Business Tools</h3>
                      <div className="space-y-3">
                        <a href="/tools/business-loan-calculator" className="block text-purple-600 hover:text-purple-700 text-sm border-b border-gray-100 pb-2">
                          Business Loan Calculator →
                        </a>
                        <a href="/tools/break-even-calculator" className="block text-purple-600 hover:text-purple-700 text-sm border-b border-gray-100 pb-2">
                          Break-Even Calculator →
                        </a>
                        <a href="/tools/salary-to-hourly-calculator" className="block text-purple-600 hover:text-purple-700 text-sm border-b border-gray-100 pb-2">
                          Salary Calculator →
                        </a>
                        <a href="/tools/education-loan-calculator" className="block text-purple-600 hover:text-purple-700 text-sm border-b border-gray-100 pb-2">
                          Education Loan Calculator →
                        </a>
                        <a href="/tools/car-loan-calculator" className="block text-purple-600 hover:text-purple-700 text-sm">
                          Car Loan Calculator →
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white text-center">
                    <h3 className="text-xl font-semibold mb-2">Build Your Complete Financial Strategy</h3>
                    <p className="text-blue-100 mb-4">
                      Combine multiple calculators to create a comprehensive financial plan. Start with investment projections, 
                      optimize your debt strategy, and track your progress toward financial independence.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">Investment Planning</span>
                      <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">Debt Management</span>
                      <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">Retirement Planning</span>
                      <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">Business Finance</span>
                    </div>
                  </div>
                </section>

                {/* Investment Strategy Guide */}
                <section className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Complete Investment Strategy Guide</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-6">🎯 Goal-Based Investment Planning</h3>
                      <div className="space-y-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Short-term Goals (1-3 years)</h4>
                          <ul className="text-gray-600 space-y-1 text-sm">
                            <li>• Emergency fund: 3-6 months expenses</li>
                            <li>• Vacation fund: Calculate with our <a href="/tools/savings-goal-calculator" className="text-blue-600 hover:text-blue-700 underline">Savings Goal Calculator</a></li>
                            <li>• Car purchase: Use <a href="/tools/car-loan-calculator" className="text-blue-600 hover:text-blue-700 underline">Car Loan Calculator</a></li>
                            <li>• Wedding expenses</li>
                          </ul>
                        </div>
                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Medium-term Goals (3-10 years)</h4>
                          <ul className="text-gray-600 space-y-1 text-sm">
                            <li>• Home down payment: Plan with <a href="/tools/home-loan-calculator" className="text-green-600 hover:text-green-700 underline">Home Loan Calculator</a></li>
                            <li>• Children's education: Use <a href="/tools/education-loan-calculator" className="text-green-600 hover:text-green-700 underline">Education Calculator</a></li>
                            <li>• Business investment</li>
                            <li>• Debt payoff: <a href="/tools/debt-payoff-calculator" className="text-green-600 hover:text-green-700 underline">Debt Payoff Calculator</a></li>
                          </ul>
                        </div>
                        <div className="border-l-4 border-purple-500 pl-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Long-term Goals (10+ years)</h4>
                          <ul className="text-gray-600 space-y-1 text-sm">
                            <li>• Retirement planning: <a href="/tools/retirement-calculator" className="text-purple-600 hover:text-purple-700 underline">Retirement Calculator</a></li>
                            <li>• Wealth building</li>
                            <li>• Legacy planning</li>
                            <li>• Financial independence</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-6">📊 Investment Options by Time Horizon</h3>
                      <div className="space-y-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 mb-3">Conservative (1-3 years)</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-medium">High-yield savings:</span>
                              <span className="text-blue-700 ml-1">3-5%</span>
                            </div>
                            <div>
                              <span className="font-medium">Treasury bills:</span>
                              <span className="text-blue-700 ml-1">4-5%</span>
                            </div>
                            <div>
                              <span className="font-medium">CDs:</span>
                              <span className="text-blue-700 ml-1">4-6%</span>
                            </div>
                            <div>
                              <span className="font-medium">Money market:</span>
                              <span className="text-blue-700 ml-1">3-4%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-semibold text-green-900 mb-3">Moderate (3-10 years)</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-medium">Bond funds:</span>
                              <span className="text-green-700 ml-1">4-7%</span>
                            </div>
                            <div>
                              <span className="font-medium">Balanced funds:</span>
                              <span className="text-green-700 ml-1">6-8%</span>
                            </div>
                            <div>
                              <span className="font-medium">REITs:</span>
                              <span className="text-green-700 ml-1">6-9%</span>
                            </div>
                            <div>
                              <span className="font-medium">Hybrid SIP:</span>
                              <span className="text-green-700 ml-1">8-10%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h4 className="font-semibold text-purple-900 mb-3">Aggressive (10+ years)</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-medium">Equity SIP:</span>
                              <span className="text-purple-700 ml-1">10-15%</span>
                            </div>
                            <div>
                              <span className="font-medium">Index funds:</span>
                              <span className="text-purple-700 ml-1">8-12%</span>
                            </div>
                            <div>
                              <span className="font-medium">Growth stocks:</span>
                              <span className="text-purple-700 ml-1">8-15%</span>
                            </div>
                            <div>
                              <span className="font-medium">Tech stocks:</span>
                              <span className="text-purple-700 ml-1">10-20%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* FAQ Section */}
                <section className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">How accurate are investment return calculators?</h4>
                      <p className="text-gray-600">Investment return calculators provide estimates based on the inputs you provide. They assume consistent returns, which rarely occurs in real markets. Use them for planning purposes, but remember that actual results will vary due to market volatility, fees, taxes, and economic conditions. For more precise calculations, combine this tool with our <a href="/tools/compound-interest-calculator" className="text-blue-600 hover:text-blue-700 underline">Compound Interest Calculator</a> and <a href="/tools/inflation-calculator" className="text-blue-600 hover:text-blue-700 underline">Inflation Calculator</a>.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between nominal and real returns?</h4>
                      <p className="text-gray-600">Nominal returns are the raw percentage gains without adjusting for inflation. Real returns account for inflation's impact on purchasing power. For example, a 7% nominal return with 3% inflation equals a 4% real return. Always consider inflation when planning long-term investments. Use our <a href="/tools/inflation-calculator" className="text-blue-600 hover:text-blue-700 underline">Inflation Calculator</a> to understand how inflation affects your purchasing power over time.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">How do taxes affect investment returns?</h4>
                      <p className="text-gray-600">Taxes can significantly reduce investment returns. Capital gains taxes apply when you sell investments for a profit, while dividends and interest are taxed as income. Tax-advantaged accounts like 401(k)s and IRAs can help minimize tax impact on your investments. For stock investments specifically, use our <a href="/tools/stock-profit-calculator" className="text-blue-600 hover:text-blue-700 underline">Stock Profit Calculator</a> which includes tax considerations.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Should I include fees in my return calculations?</h4>
                      <p className="text-gray-600">Yes, investment fees (expense ratios, management fees, transaction costs) can significantly impact long-term returns. A 1% annual fee might seem small but can reduce your total returns by 20% or more over 30 years due to the compounding effect. When calculating SIP returns, our <a href="/tools/sip-calculator" className="text-blue-600 hover:text-blue-700 underline">SIP Calculator</a> helps you factor in mutual fund expense ratios.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">How often should I recalculate my investment projections?</h4>
                      <p className="text-gray-600">Review your investment projections annually or when your financial situation changes significantly. Market conditions, personal income changes, and life events may require adjusting your investment strategy and return expectations. Track your overall progress with our <a href="/tools/net-worth-calculator" className="text-blue-600 hover:text-blue-700 underline">Net Worth Calculator</a> to see if you're meeting your investment goals.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">What's a realistic expected return for retirement planning?</h4>
                      <p className="text-gray-600">For long-term retirement planning, many financial advisors suggest using 6-8% expected returns for diversified portfolios. This accounts for a mix of stocks and bonds while being somewhat conservative compared to historical stock market averages. Use our <a href="/tools/retirement-calculator" className="text-blue-600 hover:text-blue-700 underline">Retirement Calculator</a> to determine how much you need to save monthly to reach your retirement goals.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Should I invest or pay off debt first?</h4>
                      <p className="text-gray-600">This depends on interest rates and your risk tolerance. Generally, pay off high-interest debt (&gt;8-10%) before investing, as guaranteed savings often outweigh potential investment gains. For lower interest debt, investing might be better. Use our <a href="/tools/debt-payoff-calculator" className="text-blue-600 hover:text-blue-700 underline">Debt Payoff Calculator</a> to compare scenarios and make informed decisions.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">How do I choose between lump sum and SIP investments?</h4>
                      <p className="text-gray-600">Lump sum investing can be more effective if markets rise consistently, but SIP (Systematic Investment Plan) reduces timing risk through dollar-cost averaging. SIP is better for regular income earners and volatile markets. Compare both strategies using our <a href="/tools/sip-calculator" className="text-blue-600 hover:text-blue-700 underline">SIP Calculator</a> to see which works better for your situation.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">What percentage of income should I invest?</h4>
                      <p className="text-gray-600">Financial experts typically recommend investing 10-20% of your income, but this varies based on age, income, debt, and goals. The 50/30/20 rule suggests 20% for savings and investments. Start with whatever you can afford and gradually increase. Our <a href="/tools/salary-to-hourly-calculator" className="text-blue-600 hover:text-blue-700 underline">Salary Calculator</a> can help you determine your available investment amount.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">How do I factor in market volatility?</h4>
                      <p className="text-gray-600">Market volatility is inevitable, but long-term investing helps smooth out short-term fluctuations. Use conservative return estimates, maintain emergency funds, and avoid panic selling during market downturns. Consider dollar-cost averaging through SIPs to reduce volatility impact. Our investment calculator provides average returns - actual year-to-year results will vary significantly.</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default InvestmentReturnCalculator;

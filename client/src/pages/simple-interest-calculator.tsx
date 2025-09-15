
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SimpleInterestResult {
  simpleInterest: number;
  totalAmount: number;
  principalAmount: number;
  monthlyInterest: number;
  yearlyBreakdown: Array<{
    year: number;
    interestEarned: number;
    totalAmount: number;
    cumulativeInterest: number;
  }>;
}

export default function SimpleInterestCalculator() {
  const [principal, setPrincipal] = useState('10000');
  const [interestRate, setInterestRate] = useState('8');
  const [timePeriod, setTimePeriod] = useState('5');
  const [timeUnit, setTimeUnit] = useState('years');
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<SimpleInterestResult | null>(null);

  const calculateSimpleInterest = () => {
    const p = parseFloat(principal);
    const r = parseFloat(interestRate) / 100;
    const t = timeUnit === 'years' ? parseFloat(timePeriod) : parseFloat(timePeriod) / 12;

    if (p <= 0 || r <= 0 || t <= 0) return;

    // Simple Interest Formula: SI = P × R × T
    const simpleInterest = p * r * t;
    const totalAmount = p + simpleInterest;
    const monthlyInterest = simpleInterest / (t * 12);

    // Calculate yearly breakdown
    const yearlyBreakdown = [];
    const years = Math.ceil(t);
    
    for (let year = 1; year <= years; year++) {
      const yearTime = Math.min(year, t);
      const cumulativeInterest = p * r * yearTime;
      const interestEarned = year === 1 ? cumulativeInterest : p * r;
      const totalAmountYear = p + cumulativeInterest;
      
      yearlyBreakdown.push({
        year,
        interestEarned: year <= t ? interestEarned : 0,
        totalAmount: totalAmountYear,
        cumulativeInterest
      });
    }

    setResult({
      simpleInterest,
      totalAmount,
      principalAmount: p,
      monthlyInterest,
      yearlyBreakdown
    });
  };

  const resetCalculator = () => {
    setPrincipal('10000');
    setInterestRate('8');
    setTimePeriod('5');
    setTimeUnit('years');
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
        <title>Simple Interest Calculator - Calculate Interest Earnings Online | DapsiWow</title>
        <meta name="description" content="Free simple interest calculator for loans, savings, and investments. Calculate interest using the SI = P × R × T formula. Get instant results with detailed breakdowns, yearly projections, and multiple currency support. Professional-grade financial calculator." />
        <meta name="keywords" content="simple interest calculator, interest calculator, loan calculator, savings calculator, financial calculator, simple interest formula, calculate interest, investment calculator, principal interest, annual interest rate, SI formula" />
        <meta property="og:title" content="Simple Interest Calculator - Calculate Interest Earnings | DapsiWow" />
        <meta property="og:description" content="Calculate simple interest on loans and investments with our free professional calculator. Get instant results with detailed breakdown and yearly projections." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://dapsiwow.com/simple-interest-Calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Simple Interest Calculator",
            "description": "Professional simple interest calculator for loans, savings, and investments with detailed breakdown and multiple currency support",
            "url": "https://dapsiwow.com/simple-interest-Calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
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
                <span className="text-sm font-medium text-blue-700">Professional Interest Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Simple Interest
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate interest earnings on loans, savings, and investments with precision using the SI = P × R × T formula
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Interest Configuration</h2>
                    <p className="text-gray-600">Enter your investment details to calculate simple interest earnings</p>
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

                    {/* Principal Amount */}
                    <div className="space-y-3">
                      <Label htmlFor="principal" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Principal Amount
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="principal"
                          type="number"
                          value={principal}
                          onChange={(e) => setPrincipal(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="10,000"
                          data-testid="input-principal"
                        />
                      </div>
                    </div>

                    {/* Interest Rate */}
                    <div className="space-y-3">
                      <Label htmlFor="interest-rate" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Annual Interest Rate
                      </Label>
                      <div className="relative">
                        <Input
                          id="interest-rate"
                          type="number"
                          value={interestRate}
                          onChange={(e) => setInterestRate(e.target.value)}
                          className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="8.00"
                          step="0.01"
                          data-testid="input-interest-rate"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                      </div>
                    </div>

                    {/* Time Period */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Time Period</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="number"
                          value={timePeriod}
                          onChange={(e) => setTimePeriod(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="5"
                          min="1"
                          data-testid="input-time-period"
                        />
                        <Select value={timeUnit} onValueChange={setTimeUnit}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-time-unit">
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

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateSimpleInterest}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Interest
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
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="interest-results">
                      {/* Simple Interest Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Simple Interest Earned</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-simple-interest">
                          {formatCurrency(result.simpleInterest)}
                        </div>
                      </div>

                      {/* Interest Breakdown */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Principal Amount</span>
                            <span className="font-bold text-gray-900" data-testid="text-principal-amount">
                              {formatCurrency(result.principalAmount)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Total Amount</span>
                            <span className="font-bold text-green-600" data-testid="text-total-amount">
                              {formatCurrency(result.totalAmount)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Monthly Interest</span>
                            <span className="font-bold text-blue-600" data-testid="text-monthly-interest">
                              {formatCurrency(result.monthlyInterest)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Interest Rate</span>
                            <span className="font-bold text-gray-900">
                              {interestRate}% per year
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Yearly Breakdown */}
                      {result.yearlyBreakdown.length > 0 && (
                        <div className="mt-8">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Yearly Breakdown</h3>
                          <div className="max-h-60 overflow-y-auto space-y-2">
                            {result.yearlyBreakdown.slice(0, 5).map((year) => (
                              <div key={year.year} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium text-gray-900">Year {year.year}</span>
                                  <span className="font-bold text-green-600">
                                    {formatCurrency(year.totalAmount)}
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
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">%</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter investment details and calculate to see results</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive SEO Content Section */}
          <div className="mt-16 space-y-12">
            {/* What is Simple Interest */}
            <section className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 lg:p-12 shadow-xl border border-gray-100">
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Understanding Simple Interest Calculator</h2>
                <p className="text-xl text-gray-700 leading-relaxed mb-8">
                  Simple interest is a fundamental financial concept that calculates interest earnings or charges based solely on the original principal amount. 
                  Unlike compound interest, simple interest does not accumulate on previously earned interest, making it one of the most straightforward 
                  methods for calculating returns on investments, loans, and savings accounts.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Simple Interest Formula Explained</h3>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 mb-6">
                    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-center mb-4">
                      SI = P × R × T
                    </div>
                    <div className="space-y-3 text-gray-700">
                      <div className="flex justify-between">
                        <strong className="text-blue-700">SI</strong>
                        <span>Simple Interest Amount</span>
                      </div>
                      <div className="flex justify-between">
                        <strong className="text-blue-700">P</strong>
                        <span>Principal Amount (Initial Investment)</span>
                      </div>
                      <div className="flex justify-between">
                        <strong className="text-blue-700">R</strong>
                        <span>Annual Interest Rate (as decimal)</span>
                      </div>
                      <div className="flex justify-between">
                        <strong className="text-blue-700">T</strong>
                        <span>Time Period in Years</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    The simple interest formula is the foundation for calculating interest on various financial products. 
                    To convert percentage to decimal, divide by 100 (e.g., 8% = 0.08). For monthly or daily calculations, 
                    adjust the rate and time period accordingly.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Characteristics of Simple Interest</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-bold text-gray-900 mb-2">Linear Growth Pattern</h4>
                      <p className="text-gray-700">Interest earnings remain constant for each time period, creating a predictable linear growth pattern over time.</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-bold text-gray-900 mb-2">Principal-Only Calculation</h4>
                      <p className="text-gray-700">Interest is calculated exclusively on the original principal amount, never on accumulated interest.</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-bold text-gray-900 mb-2">Easy Computation</h4>
                      <p className="text-gray-700">The straightforward formula makes it ideal for quick calculations and financial planning scenarios.</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-bold text-gray-900 mb-2">Transparency</h4>
                      <p className="text-gray-700">The simple calculation method provides clear visibility into how interest is determined and accumulated.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Applications and Use Cases */}
            <section className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 lg:p-12 shadow-xl border border-gray-100">
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">When to Use Simple Interest Calculator</h2>
                <p className="text-xl text-gray-700 leading-relaxed mb-8">
                  Simple interest calculations are prevalent across various financial instruments and scenarios. Understanding when and how 
                  simple interest applies can help you make informed decisions about loans, investments, and savings strategies.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Short-Term Lending</h3>
                  <div className="space-y-3 text-gray-700">
                    <p className="font-medium">Personal Loans (3-12 months)</p>
                    <p className="font-medium">Payday Advances</p>
                    <p className="font-medium">Bridge Financing</p>
                    <p className="font-medium">Equipment Financing</p>
                    <p className="font-medium">Seasonal Business Loans</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Simple interest on short-term loans provides borrowers with transparent cost calculations and predictable payment schedules.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Fixed-Return Investments</h3>
                  <div className="space-y-3 text-gray-700">
                    <p className="font-medium">Fixed Deposit Accounts</p>
                    <p className="font-medium">Certificate of Deposits (CDs)</p>
                    <p className="font-medium">Treasury Bills</p>
                    <p className="font-medium">Government Bonds</p>
                    <p className="font-medium">Corporate Bonds (some)</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Conservative investors often prefer simple interest products for their predictable returns and lower risk profiles.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Educational & Planning</h3>
                  <div className="space-y-3 text-gray-700">
                    <p className="font-medium">Financial Literacy Programs</p>
                    <p className="font-medium">Investment Education</p>
                    <p className="font-medium">Loan Comparison Analysis</p>
                    <p className="font-medium">Budget Planning</p>
                    <p className="font-medium">Retirement Calculations</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Simple interest serves as an excellent foundation for understanding more complex financial concepts and calculations.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Real-World Simple Interest Applications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3">Banking and Finance</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Many banks use simple interest for calculating returns on fixed deposits, especially for shorter terms. 
                      Small credit unions and community banks often employ simple interest for personal loans to provide 
                      transparent pricing to their members.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3">Business Applications</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Businesses use simple interest calculations for invoice financing, trade credit terms, and 
                      short-term cash flow management. Accounts receivable factoring often employs simple interest 
                      structures for clarity and ease of calculation.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Detailed Examples and Comparisons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                <CardContent className="p-8 lg:p-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Practical Simple Interest Example</h3>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6">
                    <h4 className="font-bold text-gray-900 mb-4">Investment Scenario:</h4>
                    <div className="space-y-3 text-gray-700">
                      <div className="flex justify-between">
                        <span className="font-medium">Principal Amount:</span>
                        <span className="font-bold text-blue-600">$25,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Annual Interest Rate:</span>
                        <span className="font-bold text-blue-600">6.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Investment Period:</span>
                        <span className="font-bold text-blue-600">4 years</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Calculation:</span>
                        <span className="font-mono text-gray-900">25,000 × 0.065 × 4</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Simple Interest Earned:</span>
                        <span className="font-bold text-blue-600 text-lg">$6,500</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Total Amount After 4 Years:</span>
                        <span className="font-bold text-green-600 text-lg">$31,500</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Annual Interest Income:</span>
                        <span className="font-bold text-purple-600">$1,625</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                <CardContent className="p-8 lg:p-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Simple vs Compound Interest Comparison</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Simple Interest</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Interest on principal only</li>
                        <li>• Linear growth</li>
                        <li>• Easy to calculate</li>
                        <li>• Better for borrowers</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Compound Interest</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Interest on principal + interest</li>
                        <li>• Exponential growth</li>
                        <li>• More complex calculation</li>
                        <li>• Better for investors</li>
                      </ul>
                    </div>

                    <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                      <strong>Key Takeaway:</strong> For the same principal, rate, and time, 
                      compound interest always yields higher returns than simple interest.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <section className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">How is simple interest different from compound interest?</h3>
                    <p className="text-gray-700">
                      Simple interest is calculated only on the original principal amount, while compound interest 
                      is calculated on both the principal and previously earned interest. This makes compound 
                      interest grow faster over time.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">When should I use simple interest calculations?</h3>
                    <p className="text-gray-700">
                      Use simple interest for short-term loans, bonds, certificates of deposit, and when you need 
                      quick calculations. It's also useful for comparing loan offers and understanding basic 
                      financial concepts.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I convert monthly rates to annual rates?</h3>
                    <p className="text-gray-700">
                      Yes, multiply the monthly rate by 12 to get the annual rate. For example, a 1% monthly 
                      rate equals 12% annual rate for simple interest calculations.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Is simple interest better for borrowers or lenders?</h3>
                    <p className="text-gray-700">
                      Simple interest is generally better for borrowers because they pay less total interest 
                      compared to compound interest. For lenders and investors, compound interest typically 
                      provides higher returns.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">How accurate is this calculator?</h3>
                    <p className="text-gray-700">
                      Our calculator uses the standard simple interest formula and provides accurate results 
                      for planning purposes. For official loan calculations, always consult with your lender 
                      for exact terms and conditions.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I use this for investment planning?</h3>
                    <p className="text-gray-700">
                      Yes, this calculator is perfect for estimating returns on simple interest investments 
                      like bonds and fixed deposits. However, most long-term investments use compound interest.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Benefits for Different Audiences */}
            <section className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 lg:p-12 shadow-xl border border-gray-100">
              <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Who Benefits from Simple Interest Calculator</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Students */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Students & Learners</h3>
                  <div className="space-y-3 text-gray-700">
                    <p className="font-medium">Understanding basic financial concepts</p>
                    <p className="font-medium">Calculating student loan interest costs</p>
                    <p className="font-medium">Learning mathematical applications</p>
                    <p className="font-medium">Planning education expenses</p>
                    <p className="font-medium">Preparing for financial literacy exams</p>
                  </div>
                  <div className="mt-6 p-4 bg-white rounded-xl">
                    <p className="text-sm text-blue-700 font-medium">
                      Perfect for understanding how interest works before taking on student loans or starting investment journeys.
                    </p>
                  </div>
                </div>

                {/* Professionals */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Working Professionals</h3>
                  <div className="space-y-3 text-gray-700">
                    <p className="font-medium">Personal loan cost analysis</p>
                    <p className="font-medium">Quick investment return assessments</p>
                    <p className="font-medium">Emergency fund growth planning</p>
                    <p className="font-medium">Salary advance interest calculations</p>
                    <p className="font-medium">Financial goal milestone tracking</p>
                  </div>
                  <div className="mt-6 p-4 bg-white rounded-xl">
                    <p className="text-sm text-green-700 font-medium">
                      Essential for making informed decisions about personal finances and short-term borrowing needs.
                    </p>
                  </div>
                </div>

                {/* Business Owners */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Business Owners</h3>
                  <div className="space-y-3 text-gray-700">
                    <p className="font-medium">Short-term business loan evaluation</p>
                    <p className="font-medium">Cash flow interest impact analysis</p>
                    <p className="font-medium">Equipment financing cost assessment</p>
                    <p className="font-medium">Vendor payment term negotiations</p>
                    <p className="font-medium">Working capital requirement planning</p>
                  </div>
                  <div className="mt-6 p-4 bg-white rounded-xl">
                    <p className="text-sm text-purple-700 font-medium">
                      Critical for understanding the true cost of business financing and optimizing cash flow management.
                    </p>
                  </div>
                </div>

                {/* Investors */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Investors & Savers</h3>
                  <div className="space-y-3 text-gray-700">
                    <p className="font-medium">Fixed deposit return calculations</p>
                    <p className="font-medium">Bond yield analysis and comparison</p>
                    <p className="font-medium">Certificate of deposit planning</p>
                    <p className="font-medium">Treasury bill investment evaluation</p>
                    <p className="font-medium">Conservative portfolio construction</p>
                  </div>
                  <div className="mt-6 p-4 bg-white rounded-xl">
                    <p className="text-sm text-yellow-700 font-medium">
                      Ideal for conservative investors seeking predictable returns and risk-averse investment strategies.
                    </p>
                  </div>
                </div>

                {/* Seniors */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Retirees & Seniors</h3>
                  <div className="space-y-3 text-gray-700">
                    <p className="font-medium">Fixed income stream planning</p>
                    <p className="font-medium">Pension supplement calculations</p>
                    <p className="font-medium">Safe investment return projections</p>
                    <p className="font-medium">Healthcare financing interest costs</p>
                    <p className="font-medium">Estate planning financial considerations</p>
                  </div>
                  <div className="mt-6 p-4 bg-white rounded-xl">
                    <p className="text-sm text-indigo-700 font-medium">
                      Essential for retirement income planning and understanding guaranteed return investment options.
                    </p>
                  </div>
                </div>

                {/* Financial Advisors */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Financial Advisors</h3>
                  <div className="space-y-3 text-gray-700">
                    <p className="font-medium">Client consultation demonstrations</p>
                    <p className="font-medium">Quick scenario analysis tools</p>
                    <p className="font-medium">Educational workshop materials</p>
                    <p className="font-medium">Loan comparison presentations</p>
                    <p className="font-medium">Financial literacy training aids</p>
                  </div>
                  <div className="mt-6 p-4 bg-white rounded-xl">
                    <p className="text-sm text-red-700 font-medium">
                      Valuable for explaining basic interest concepts and demonstrating financial product differences to clients.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            

            {/* Benefits and Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                <CardContent className="p-8 lg:p-10">
                  <h3 className="text-3xl font-bold text-gray-900 mb-8">Benefits of Using Our Calculator</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-green-50 rounded-xl p-6">
                      <h4 className="font-bold text-green-800 mb-2">Instant Accurate Results</h4>
                      <p className="text-green-700">Get immediate calculations without manual computation errors or complex mathematical operations.</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h4 className="font-bold text-blue-800 mb-2">Multi-Currency Support</h4>
                      <p className="text-blue-700">Calculate in USD, EUR, GBP, INR, JPY, CAD, AUD, CNY, BRL, and MXN with proper formatting.</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-6">
                      <h4 className="font-bold text-purple-800 mb-2">Comprehensive Breakdown</h4>
                      <p className="text-purple-700">View yearly projections, monthly interest amounts, and detailed financial planning insights.</p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-6">
                      <h4 className="font-bold text-yellow-800 mb-2">Completely Free</h4>
                      <p className="text-yellow-700">No registration, subscriptions, or hidden fees. Professional-grade calculations at no cost.</p>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-6">
                      <h4 className="font-bold text-indigo-800 mb-2">Mobile Optimized</h4>
                      <p className="text-indigo-700">Responsive design works flawlessly on smartphones, tablets, and desktop computers.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                <CardContent className="p-8 lg:p-10">
                  <h3 className="text-3xl font-bold text-gray-900 mb-8">Professional Tips for Accuracy</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h4 className="font-bold text-blue-800 mb-2">Verify Interest Rate Format</h4>
                      <p className="text-blue-700">Always confirm you're using annual interest rates. Convert monthly or daily rates accordingly.</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-6">
                      <h4 className="font-bold text-green-800 mb-2">Consider Economic Factors</h4>
                      <p className="text-green-700">Factor in inflation rates and economic conditions for realistic long-term financial projections.</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-6">
                      <h4 className="font-bold text-purple-800 mb-2">Compare Multiple Scenarios</h4>
                      <p className="text-purple-700">Use different principal amounts and interest rates to understand how changes impact your returns.</p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-6">
                      <h4 className="font-bold text-yellow-800 mb-2">Verify with Institutions</h4>
                      <p className="text-yellow-700">Always confirm actual loan or investment terms with financial institutions before making decisions.</p>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-6">
                      <h4 className="font-bold text-indigo-800 mb-2">Plan for Flexibility</h4>
                      <p className="text-indigo-700">Consider various time periods and amounts to understand the impact of different financial strategies.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Simple Interest vs Other Interest Types */}
            <section className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Simple Interest vs Other Interest Calculation Methods</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 p-4 text-left font-semibold text-gray-900">Feature</th>
                      <th className="border border-gray-200 p-4 text-left font-semibold text-gray-900">Simple Interest</th>
                      <th className="border border-gray-200 p-4 text-left font-semibold text-gray-900">Compound Interest</th>
                      <th className="border border-gray-200 p-4 text-left font-semibold text-gray-900">APR</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 p-4 font-medium">Calculation Base</td>
                      <td className="border border-gray-200 p-4">Principal only</td>
                      <td className="border border-gray-200 p-4">Principal + accumulated interest</td>
                      <td className="border border-gray-200 p-4">Includes fees and charges</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-4 font-medium">Growth Pattern</td>
                      <td className="border border-gray-200 p-4">Linear</td>
                      <td className="border border-gray-200 p-4">Exponential</td>
                      <td className="border border-gray-200 p-4">Varies</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-4 font-medium">Best For</td>
                      <td className="border border-gray-200 p-4">Short-term loans, bonds</td>
                      <td className="border border-gray-200 p-4">Long-term investments</td>
                      <td className="border border-gray-200 p-4">Loan comparisons</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-4 font-medium">Complexity</td>
                      <td className="border border-gray-200 p-4">Simple</td>
                      <td className="border border-gray-200 p-4">Moderate</td>
                      <td className="border border-gray-200 p-4">Complex</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-4 font-medium">Method Type</td>
                      <td className="border border-gray-200 p-4">Basic calculation</td>
                      <td className="border border-gray-200 p-4">Advanced calculation</td>
                      <td className="border border-gray-200 p-4">Comprehensive rate calculation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

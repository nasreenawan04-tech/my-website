
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Percent, Calculator, TrendingUp, DollarSign, Clock, BookOpen } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Simple Interest Calculator - Calculate Interest Earnings Online | Free Tool</title>
        <meta name="description" content="Free simple interest calculator. Calculate interest earnings on loans, savings, and investments. Easy-to-use tool with breakdown, examples, and multiple currencies. Calculate simple interest formula SI = P × R × T." />
        <meta name="keywords" content="simple interest calculator, interest calculator, loan calculator, savings calculator, financial calculator, simple interest formula, calculate interest, investment calculator, principal interest, annual interest rate" />
        <meta property="og:title" content="Simple Interest Calculator - Free Online Tool" />
        <meta property="og:description" content="Calculate simple interest on loans and investments with our free calculator. Get instant results with detailed breakdown and yearly projections." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://toolshub.replit.app/simple-interest-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Simple Interest Calculator",
            "description": "Calculate simple interest on loans, savings, and investments with detailed breakdown",
            "url": "https://toolshub.replit.app/simple-interest-calculator",
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
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Percent className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Simple Interest Calculator
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Calculate simple interest on loans, savings accounts, and investments with our free online calculator. 
              Get instant results with detailed yearly breakdown and projections.
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
                        placeholder="5"
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

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      onClick={calculateSimpleInterest}
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      Calculate Interest
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
                      {/* Simple Interest */}
                      <div className="bg-white rounded-lg p-6 border border-gray-100">
                        <div className="text-sm text-gray-600 mb-1">Simple Interest Earned</div>
                        <div className="text-3xl font-bold text-blue-600">
                          {formatCurrency(result.simpleInterest)}
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
                          <span className="text-gray-600">Total Amount</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(result.totalAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Monthly Interest</span>
                          <span className="font-semibold text-blue-600">
                            {formatCurrency(result.monthlyInterest)}
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
                    <div className="text-center py-12">
                      <Percent className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Enter investment details and click calculate to see results</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive Information Section */}
          <div className="mt-16 space-y-12">
            {/* What is Simple Interest */}
            <section className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">What is Simple Interest?</h2>
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    Simple interest is a method of calculating interest earnings or charges based only on the original principal amount. 
                    Unlike compound interest, simple interest doesn't earn interest on previously accumulated interest, making it 
                    straightforward to calculate and understand.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Simple Interest Formula</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
                    <div className="text-2xl font-bold text-blue-800 text-center mb-2">SI = P × R × T</div>
                    <div className="text-sm text-blue-700 space-y-1">
                      <div><strong>SI</strong> = Simple Interest</div>
                      <div><strong>P</strong> = Principal Amount</div>
                      <div><strong>R</strong> = Annual Interest Rate (as decimal)</div>
                      <div><strong>T</strong> = Time Period in Years</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Characteristics</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">Interest calculated only on principal amount</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">Fixed interest amount each period</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">Linear growth over time</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">Easy to calculate and understand</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Use Cases */}
            <section className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">When is Simple Interest Used?</h2>
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    Simple interest is commonly used in various financial scenarios, particularly for short-term loans 
                    and specific types of investments where interest calculations need to be straightforward.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Short-term Loans</h3>
                  <ul className="text-gray-700 space-y-2 text-sm">
                    <li>• Payday loans</li>
                    <li>• Personal loans (some)</li>
                    <li>• Business loans</li>
                    <li>• Auto loans (some)</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Savings Products</h3>
                  <ul className="text-gray-700 space-y-2 text-sm">
                    <li>• Fixed deposits</li>
                    <li>• Certificates of deposit</li>
                    <li>• Treasury bills</li>
                    <li>• Government bonds</li>
                  </ul>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                    <Calculator className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Educational Context</h3>
                  <ul className="text-gray-700 space-y-2 text-sm">
                    <li>• Financial literacy</li>
                    <li>• Mathematics education</li>
                    <li>• Basic investment concepts</li>
                    <li>• Loan comparison</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Examples and Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Calculator className="w-8 h-8 text-blue-600" />
                    <h3 className="text-2xl font-semibold text-gray-900">Simple Interest Example</h3>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Scenario:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Principal: $10,000</li>
                      <li>• Interest Rate: 5% per year</li>
                      <li>• Time Period: 3 years</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Calculation:</span>
                      <span className="font-mono text-gray-900">10,000 × 0.05 × 3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Simple Interest:</span>
                      <span className="font-semibold text-blue-600">$1,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold text-green-600">$11,500</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <h3 className="text-2xl font-semibold text-gray-900">Simple vs Compound Interest</h3>
                  </div>
                  
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
            <section className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Who Benefits from Simple Interest Calculators?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Students */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Students & Learners</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• Understanding basic financial concepts</li>
                    <li>• Calculating student loan interest</li>
                    <li>• Learning mathematical applications</li>
                    <li>• Planning education expenses</li>
                    <li>• Preparing for financial literacy exams</li>
                  </ul>
                  <div className="mt-4 text-sm text-blue-700">
                    <strong>Tip:</strong> Use our <a href="/education-loan-calculator" className="underline hover:text-blue-800">Education Loan Calculator</a> for detailed student loan planning.
                  </div>
                </div>

                {/* Professionals */}
                <div className="bg-green-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Working Professionals</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• Personal loan calculations</li>
                    <li>• Quick investment assessments</li>
                    <li>• Emergency fund planning</li>
                    <li>• Salary advance interest</li>
                    <li>• Financial goal setting</li>
                  </ul>
                  <div className="mt-4 text-sm text-green-700">
                    <strong>Tip:</strong> Try our <a href="/salary-to-hourly-calculator" className="underline hover:text-green-800">Salary Calculator</a> and <a href="/savings-goal-calculator" className="underline hover:text-green-800">Savings Goal Calculator</a> for comprehensive planning.
                  </div>
                </div>

                {/* Business Owners */}
                <div className="bg-purple-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Owners</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• Short-term business loan costs</li>
                    <li>• Cash flow interest calculations</li>
                    <li>• Equipment financing analysis</li>
                    <li>• Vendor payment terms</li>
                    <li>• Working capital planning</li>
                  </ul>
                  <div className="mt-4 text-sm text-purple-700">
                    <strong>Tip:</strong> Use our <a href="/business-loan-calculator" className="underline hover:text-purple-800">Business Loan Calculator</a> for detailed business financing analysis.
                  </div>
                </div>

                {/* Investors */}
                <div className="bg-yellow-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Investors & Savers</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• Fixed deposit returns</li>
                    <li>• Bond yield calculations</li>
                    <li>• Certificate of deposit planning</li>
                    <li>• Treasury bill analysis</li>
                    <li>• Conservative investment planning</li>
                  </ul>
                  <div className="mt-4 text-sm text-yellow-700">
                    <strong>Tip:</strong> Compare with our <a href="/compound-interest-calculator" className="underline hover:text-yellow-800">Compound Interest Calculator</a> for long-term investments.
                  </div>
                </div>

                {/* Seniors */}
                <div className="bg-indigo-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Retirees & Seniors</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• Fixed income planning</li>
                    <li>• Pension supplement calculations</li>
                    <li>• Safe investment returns</li>
                    <li>• Healthcare loan interest</li>
                    <li>• Estate planning considerations</li>
                  </ul>
                  <div className="mt-4 text-sm text-indigo-700">
                    <strong>Tip:</strong> Check our <a href="/retirement-calculator" className="underline hover:text-indigo-800">Retirement Calculator</a> for comprehensive retirement planning.
                  </div>
                </div>

                {/* Financial Advisors */}
                <div className="bg-red-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Financial Advisors</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• Client consultation tools</li>
                    <li>• Quick scenario analysis</li>
                    <li>• Educational demonstrations</li>
                    <li>• Loan comparison presentations</li>
                    <li>• Financial literacy training</li>
                  </ul>
                  <div className="mt-4 text-sm text-red-700">
                    <strong>Tip:</strong> Use our <a href="/loan-calculator" className="underline hover:text-red-800">Loan Calculator</a> and <a href="/emi-calculator" className="underline hover:text-red-800">EMI Calculator</a> for client presentations.
                  </div>
                </div>
              </div>
            </section>

            {/* Related Financial Tools */}
            <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Related Financial Calculators</h2>
              <p className="text-lg text-gray-600 text-center mb-8">
                Explore our comprehensive suite of financial calculators to make informed decisions about loans, investments, and savings.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <a href="/compound-interest-calculator" className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Compound Interest Calculator</h3>
                  <p className="text-gray-600 text-sm">Calculate exponential growth with compound interest for long-term investments.</p>
                </a>

                <a href="/loan-calculator" className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Loan Calculator</h3>
                  <p className="text-gray-600 text-sm">Calculate monthly payments and total interest for various loan types.</p>
                </a>

                <a href="/emi-calculator" className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Calculator className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">EMI Calculator</h3>
                  <p className="text-gray-600 text-sm">Calculate Equated Monthly Installments for loans and mortgages.</p>
                </a>

                <a href="/mortgage-calculator" className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Mortgage Calculator</h3>
                  <p className="text-gray-600 text-sm">Plan your home purchase with detailed mortgage calculations.</p>
                </a>

                <a href="/investment-return-calculator" className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Investment Return Calculator</h3>
                  <p className="text-gray-600 text-sm">Analyze potential returns on various investment options.</p>
                </a>

                <a href="/sip-calculator" className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <DollarSign className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">SIP Calculator</h3>
                  <p className="text-gray-600 text-sm">Calculate returns from Systematic Investment Plans in mutual funds.</p>
                </a>

                <a href="/savings-goal-calculator" className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Savings Goal Calculator</h3>
                  <p className="text-gray-600 text-sm">Plan monthly savings to reach your financial goals.</p>
                </a>

                <a href="/retirement-calculator" className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Retirement Calculator</h3>
                  <p className="text-gray-600 text-sm">Plan for a secure retirement with our comprehensive calculator.</p>
                </a>
              </div>
            </section>

            {/* Benefits and Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900">Benefits of Using Our Calculator</h3>
                  </div>
                  
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700"><strong>Instant Results:</strong> Get immediate calculations without manual math</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700"><strong>Multiple Currencies:</strong> Calculate in USD, EUR, GBP, INR, and more</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700"><strong>Detailed Breakdown:</strong> See yearly projections and monthly interest</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700"><strong>Free to Use:</strong> No registration or payment required</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700"><strong>Mobile Friendly:</strong> Works perfectly on all devices</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900">Tips for Better Results</h3>
                  </div>
                  
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700"><strong>Double-check rates:</strong> Ensure you're using annual interest rates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700"><strong>Consider inflation:</strong> Factor in inflation for long-term calculations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700"><strong>Compare options:</strong> Use different scenarios to compare investments</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700"><strong>Verify terms:</strong> Always confirm actual terms with financial institutions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700"><strong>Use scenarios:</strong> Try different amounts and rates to understand impacts</span>
                    </li>
                  </ul>
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
                      <td className="border border-gray-200 p-4 font-medium">Related Calculator</td>
                      <td className="border border-gray-200 p-4">This calculator</td>
                      <td className="border border-gray-200 p-4">
                        <a href="/compound-interest-calculator" className="text-blue-600 hover:text-blue-700 underline">
                          Compound Interest Calculator
                        </a>
                      </td>
                      <td className="border border-gray-200 p-4">
                        <a href="/loan-calculator" className="text-blue-600 hover:text-blue-700 underline">
                          Loan Calculator
                        </a>
                      </td>
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

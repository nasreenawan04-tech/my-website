
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreditCardResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  timeToPayOff: number;
  interestSavings?: number;
  timeSavings?: number;
  paymentSchedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export default function CreditCardInterestCalculator() {
  const [currentBalance, setCurrentBalance] = useState('5000');
  const [annualAPR, setAnnualAPR] = useState('18.99');
  const [paymentStrategy, setPaymentStrategy] = useState('minimum');
  const [minimumPayment, setMinimumPayment] = useState('150');
  const [fixedPayment, setFixedPayment] = useState('200');
  const [targetMonths, setTargetMonths] = useState('24');
  const [currency, setCurrency] = useState('USD');
  const [showSchedule, setShowSchedule] = useState(false);
  const [result, setResult] = useState<CreditCardResult | null>(null);

  const calculateCreditCard = () => {
    const balance = parseFloat(currentBalance);
    const apr = parseFloat(annualAPR) / 100;
    const monthlyRate = apr / 12;

    if (balance <= 0 || apr <= 0) return;

    let monthlyPayment = 0;
    let months = 0;

    // Determine payment amount based on strategy
    if (paymentStrategy === 'minimum') {
      monthlyPayment = parseFloat(minimumPayment);
    } else if (paymentStrategy === 'fixed') {
      monthlyPayment = parseFloat(fixedPayment);
    } else if (paymentStrategy === 'target') {
      months = parseFloat(targetMonths);
      // Calculate required payment for target months
      if (monthlyRate > 0) {
        monthlyPayment = (balance * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
      } else {
        monthlyPayment = balance / months;
      }
    }

    if (monthlyPayment <= 0) return;

    // Calculate payoff schedule
    const paymentSchedule = [];
    let remainingBalance = balance;
    let totalPaid = 0;
    let monthCount = 0;
    const maxMonths = 600; // 50 years max to prevent infinite loops

    while (remainingBalance > 0.01 && monthCount < maxMonths) {
      const interestPayment = remainingBalance * monthlyRate;
      let principalPayment = Math.min(monthlyPayment - interestPayment, remainingBalance);

      if (principalPayment <= 0) {
        // Payment too low to cover interest
        break;
      }

      remainingBalance -= principalPayment;
      totalPaid += monthlyPayment;
      monthCount++;

      if (monthCount <= 60) { // Store first 5 years for display
        paymentSchedule.push({
          month: monthCount,
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
          balance: Math.max(0, remainingBalance)
        });
      }

      if (remainingBalance <= 0.01) break;
    }

    const totalPayment = totalPaid;
    const totalInterest = totalPayment - balance;

    // Calculate comparison with minimum payment if doing fixed or target
    let interestSavings, timeSavings;
    if (paymentStrategy !== 'minimum' && minimumPayment) {
      const minPayment = parseFloat(minimumPayment);
      let minBalance = balance;
      let minTotalPaid = 0;
      let minMonthCount = 0;

      while (minBalance > 0.01 && minMonthCount < maxMonths) {
        const interestPayment = minBalance * monthlyRate;
        const principalPayment = Math.min(minPayment - interestPayment, minBalance);

        if (principalPayment <= 0) break;

        minBalance -= principalPayment;
        minTotalPaid += minPayment;
        minMonthCount++;
      }

      const minTotalInterest = minTotalPaid - balance;
      interestSavings = minTotalInterest - totalInterest;
      timeSavings = minMonthCount - monthCount;
    }

    setResult({
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      timeToPayOff: monthCount,
      interestSavings: interestSavings ? Math.round(interestSavings * 100) / 100 : undefined,
      timeSavings: timeSavings,
      paymentSchedule
    });
  };

  const resetCalculator = () => {
    setCurrentBalance('5000');
    setAnnualAPR('18.99');
    setPaymentStrategy('minimum');
    setMinimumPayment('150');
    setFixedPayment('200');
    setTargetMonths('24');
    setCurrency('USD');
    setShowSchedule(false);
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

  const formatTime = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
      return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Credit Card Interest Calculator - Calculate Payoff Time & Interest Costs | DapsiWow</title>
        <meta name="description" content="Free credit card interest calculator to calculate payoff time, total interest costs, and monthly payments. Compare payment strategies and find the best way to become debt-free. Support for multiple currencies worldwide." />
        <meta name="keywords" content="credit card interest calculator, credit card payoff calculator, debt payoff calculator, minimum payment calculator, credit card debt calculator, interest calculator, monthly payment calculator, debt consolidation calculator, credit card balance calculator" />
        <meta property="og:title" content="Credit Card Interest Calculator - Calculate Payoff Time & Interest Costs | DapsiWow" />
        <meta property="og:description" content="Free credit card interest calculator for calculating payoff time, total interest costs, and optimal payment strategies. Get debt-free faster with smart payment planning." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/credit-card-interest-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Credit Card Interest Calculator",
            "description": "Free online credit card interest calculator to calculate payoff time, total interest costs, and monthly payments. Compare different payment strategies to become debt-free faster.",
            "url": "https://dapsiwow.com/tools/credit-card-interest-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate credit card payoff time",
              "Compare payment strategies",
              "Interest cost analysis",
              "Debt elimination planning",
              "Multiple currency support",
              "Payment schedule breakdown"
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
                <span className="text-sm font-medium text-blue-700">Professional Credit Card Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Credit Card
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Payoff Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate payoff time, total interest costs, and find the optimal payment strategy to become debt-free
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Credit Card Details</h2>
                    <p className="text-gray-600">Enter your credit card information to calculate payoff scenarios</p>
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

                    {/* Current Balance */}
                    <div className="space-y-3">
                      <Label htmlFor="current-balance" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Current Balance
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="current-balance"
                          type="number"
                          value={currentBalance}
                          onChange={(e) => setCurrentBalance(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="5,000"
                          data-testid="input-current-balance"
                        />
                      </div>
                    </div>

                    {/* Annual APR */}
                    <div className="space-y-3">
                      <Label htmlFor="annual-apr" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Annual APR
                      </Label>
                      <div className="relative">
                        <Input
                          id="annual-apr"
                          type="number"
                          value={annualAPR}
                          onChange={(e) => setAnnualAPR(e.target.value)}
                          className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="18.99"
                          step="0.01"
                          data-testid="input-annual-apr"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                      </div>
                    </div>

                    {/* Payment Strategy */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Payment Strategy</Label>
                      <Select value={paymentStrategy} onValueChange={setPaymentStrategy}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-payment-strategy">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minimum">Minimum Payment Only</SelectItem>
                          <SelectItem value="fixed">Fixed Monthly Payment</SelectItem>
                          <SelectItem value="target">Target Payoff Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Payment Amount Inputs */}
                  <div className="space-y-6 border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-900">Payment Configuration</h3>

                    {/* Minimum Payment */}
                    <div className="space-y-3">
                      <Label htmlFor="minimum-payment" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Minimum Monthly Payment
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="minimum-payment"
                          type="number"
                          value={minimumPayment}
                          onChange={(e) => setMinimumPayment(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="150"
                          data-testid="input-minimum-payment"
                        />
                      </div>
                      <p className="text-sm text-gray-500">Usually 2-3% of current balance</p>
                    </div>

                    {/* Fixed Payment (if selected) */}
                    {paymentStrategy === 'fixed' && (
                      <div className="space-y-3 bg-gray-50 rounded-xl p-6">
                        <Label htmlFor="fixed-payment" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Fixed Monthly Payment
                        </Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                          <Input
                            id="fixed-payment"
                            type="number"
                            value={fixedPayment}
                            onChange={(e) => setFixedPayment(e.target.value)}
                            className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            placeholder="200"
                            data-testid="input-fixed-payment"
                          />
                        </div>
                        <p className="text-sm text-gray-500">Choose a higher amount to pay off debt faster</p>
                      </div>
                    )}

                    {/* Target Months (if selected) */}
                    {paymentStrategy === 'target' && (
                      <div className="space-y-3 bg-gray-50 rounded-xl p-6">
                        <Label htmlFor="target-months" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Target Payoff Time (Months)
                        </Label>
                        <Input
                          id="target-months"
                          type="number"
                          value={targetMonths}
                          onChange={(e) => setTargetMonths(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="24"
                          min="1"
                          data-testid="input-target-months"
                        />
                        <p className="text-sm text-gray-500">We'll calculate the required monthly payment</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateCreditCard}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Payoff
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
                        onClick={() => setShowSchedule(!showSchedule)}
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        data-testid="button-show-schedule"
                      >
                        {showSchedule ? 'Hide' : 'Show'} Payment Schedule
                      </Button>
                    </div>
                  )}
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Results</h2>

                  {result ? (
                    <div className="space-y-6" data-testid="credit-card-results">
                      {/* Monthly Payment Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Monthly Payment</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-monthly-payment">
                          {formatCurrency(result.monthlyPayment)}
                        </div>
                      </div>

                      {/* Payoff Summary */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Payoff Time</span>
                            <span className="font-bold text-gray-900" data-testid="text-payoff-time">
                              {formatTime(result.timeToPayOff)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Total Interest</span>
                            <span className="font-bold text-red-600" data-testid="text-total-interest">
                              {formatCurrency(result.totalInterest)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Total Payment</span>
                            <span className="font-bold text-gray-900" data-testid="text-total-payment">
                              {formatCurrency(result.totalPayment)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Savings Comparison */}
                      {(result.interestSavings !== undefined && result.timeSavings !== undefined) && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                          <h4 className="font-bold text-green-800 mb-4 text-lg">Savings vs Minimum Payment</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium">Interest Saved:</span>
                              <span className="font-bold text-green-800 text-lg" data-testid="text-interest-savings">
                                {formatCurrency(result.interestSavings)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium">Time Saved:</span>
                              <span className="font-bold text-green-800 text-lg" data-testid="text-time-savings">
                                {formatTime(result.timeSavings)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Interest Rate Warning */}
                      {parseFloat(annualAPR) > 25 && (
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                          <h4 className="font-bold text-orange-800 mb-2">High Interest Rate Alert</h4>
                          <p className="text-orange-700 text-sm">
                            Consider balance transfer or debt consolidation options to reduce interest costs.
                          </p>
                        </div>
                      )}

                      {/* Visual Progress Bar */}
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Interest vs Principal</h3>
                        <div className="space-y-2">
                          <div className="flex items-center h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${(parseFloat(currentBalance) / result.totalPayment) * 100}%` }}
                            ></div>
                            <div
                              className="h-full bg-red-400"
                              style={{ width: `${(result.totalInterest / result.totalPayment) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                              Principal ({Math.round((parseFloat(currentBalance) / result.totalPayment) * 100)}%)
                            </span>
                            <span className="flex items-center">
                              <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                              Interest ({Math.round((result.totalInterest / result.totalPayment) * 100)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">💳</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter credit card details to calculate payoff scenarios</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Schedule */}
          {result && showSchedule && (
            <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Payment Schedule (First 5 Years)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <th className="px-6 py-4 text-left font-bold text-gray-900 rounded-l-lg">Payment #</th>
                        <th className="px-6 py-4 text-right font-bold text-gray-900">Payment</th>
                        <th className="px-6 py-4 text-right font-bold text-gray-900">Principal</th>
                        <th className="px-6 py-4 text-right font-bold text-gray-900">Interest</th>
                        <th className="px-6 py-4 text-right font-bold text-gray-900 rounded-r-lg">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.paymentSchedule.map((payment, index) => (
                        <tr key={index} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{payment.month}</td>
                          <td className="px-6 py-4 text-right text-gray-900 font-medium">
                            {formatCurrency(payment.payment)}
                          </td>
                          <td className="px-6 py-4 text-right text-green-600 font-bold">
                            {formatCurrency(payment.principal)}
                          </td>
                          <td className="px-6 py-4 text-right text-red-600 font-medium">
                            {formatCurrency(payment.interest)}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-900 font-bold">
                            {formatCurrency(payment.balance)}
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Credit Card Interest?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Credit card interest is the cost of borrowing money on your credit card, expressed as an Annual 
                    Percentage Rate (APR). When you carry a balance from month to month, the credit card company 
                    charges interest on the outstanding amount.
                  </p>
                  <p>
                    Our credit card interest calculator helps you understand the true cost of credit card debt by 
                    showing you exactly how long it will take to pay off your balance and how much interest you'll 
                    pay based on different payment strategies.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How Credit Card Interest Works</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Credit card companies calculate interest daily using your average daily balance. The monthly 
                    interest rate is your APR divided by 12. This compounds monthly, making debt grow quickly if 
                    you only make minimum payments.
                  </p>
                  <p>
                    Understanding how interest is calculated empowers you to make informed decisions about payment 
                    strategies, balance transfers, and debt consolidation options to minimize interest costs.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Features of Our Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Multiple payment strategy comparisons</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Accurate payoff time calculations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Total interest cost analysis</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Detailed payment schedule breakdown</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for 10+ international currencies</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Payment Strategy Benefits</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Compare minimum vs fixed payment strategies</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Calculate required payments for target payoff dates</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Visualize interest savings with higher payments</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Plan debt elimination timeline effectively</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Free to use with no registration required</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Credit Card Debt Strategies */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Credit Card Debt Payoff Strategies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Debt Avalanche Method</h4>
                    <p className="text-gray-600">
                      Pay minimums on all cards, then put extra money toward the card with the highest interest rate. 
                      This method saves the most money in interest charges over time, making it mathematically optimal 
                      for debt elimination.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Debt Snowball Method</h4>
                    <p className="text-gray-600">
                      Pay minimums on all cards, then focus extra payments on the smallest balance first. This method 
                      provides psychological wins early on, building momentum and motivation to continue paying off debt.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Balance Transfer Strategy</h4>
                    <p className="text-gray-600">
                      Transfer high-interest debt to a card with a lower interest rate or promotional 0% APR period. 
                      This can significantly reduce interest costs, but requires discipline to avoid accumulating new debt.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Debt Consolidation</h4>
                    <p className="text-gray-600">
                      Combine multiple credit card debts into a single personal loan with a lower interest rate. 
                      This simplifies payments and can reduce overall interest costs while providing a fixed payoff timeline.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Understanding Credit Card Terms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Credit Card Terms Explained</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Annual Percentage Rate (APR)</h4>
                      <p className="text-sm">The yearly interest rate charged on outstanding balances. This includes interest and fees, giving you the true cost of borrowing.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Minimum Payment</h4>
                      <p className="text-sm">The smallest amount you must pay each month to keep your account in good standing, typically 2-3% of your balance.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Grace Period</h4>
                      <p className="text-sm">The time between your statement date and payment due date when no interest is charged on new purchases if you pay in full.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Credit Utilization</h4>
                      <p className="text-sm">The percentage of your available credit that you're using. Keeping this below 30% helps maintain a good credit score.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Tips to Minimize Interest Costs</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Pay More Than Minimum</h4>
                      <p className="text-sm text-blue-700">Even paying $25-50 extra monthly can significantly reduce payoff time and interest costs.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Make Bi-Weekly Payments</h4>
                      <p className="text-sm text-green-700">Split your monthly payment in half and pay every two weeks to reduce average daily balance.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Target High-Interest Cards First</h4>
                      <p className="text-sm text-orange-700">Focus extra payments on cards with the highest APR to maximize interest savings.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Avoid Cash Advances</h4>
                      <p className="text-sm text-purple-700">Cash advances typically have higher interest rates and no grace period, making them expensive.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Credit Card Interest FAQs */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about Credit Card Interest</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How is credit card interest calculated daily?</h4>
                      <p className="text-gray-600 text-sm">Interest is calculated by dividing your APR by 365 to get the daily rate, then multiplying by your average daily balance. This amount is added to your balance each day.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What happens if I only make minimum payments?</h4>
                      <p className="text-gray-600 text-sm">Making only minimum payments extends payoff time significantly and maximizes interest costs. A $5,000 balance at 18% APR takes over 20 years to pay off with minimums.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I negotiate my credit card interest rate?</h4>
                      <p className="text-gray-600 text-sm">Yes, if you have good payment history and credit score, call your card issuer to request a lower APR. Many cardholders successfully negotiate rate reductions.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">When does credit card interest start accruing?</h4>
                      <p className="text-gray-600 text-sm">Interest starts accruing immediately on cash advances and balance transfers. For purchases, it begins after the grace period ends if you carry a balance.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the difference between APR and interest rate?</h4>
                      <p className="text-gray-600 text-sm">APR includes the interest rate plus fees, giving you the true cost of borrowing. The interest rate is just the percentage charged on your balance.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How can I avoid paying credit card interest?</h4>
                      <p className="text-gray-600 text-sm">Pay your full statement balance by the due date each month. This maintains your grace period and prevents interest charges on new purchases.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Are there tax benefits to credit card interest?</h4>
                      <p className="text-gray-600 text-sm">Generally no, personal credit card interest is not tax-deductible. Business credit card interest used for business purposes may be deductible.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's a good credit card APR?</h4>
                      <p className="text-gray-600 text-sm">A good APR is typically below 15% for excellent credit, though rates vary by card type. Compare offers and consider 0% introductory APR cards for large purchases.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Credit Score Impact */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Credit Score Impact</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      High credit card balances and missed payments significantly impact your credit score, affecting future borrowing costs.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Positive Factors:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>On-time payments (35% of score)</li>
                        <li>Low credit utilization</li>
                        <li>Long credit history</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-800 text-sm">Negative Factors:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-red-700">
                        <li>Late or missed payments</li>
                        <li>High credit utilization</li>
                        <li>Maxed-out credit cards</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Debt Management Tools</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Various tools and strategies can help you manage credit card debt more effectively and reduce interest costs.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Helpful Tools:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Debt consolidation loans</li>
                        <li>Balance transfer cards</li>
                        <li>Budgeting apps</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Professional Help:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Credit counseling services</li>
                        <li>Debt management plans</li>
                        <li>Financial advisors</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Prevention Strategies</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      The best way to avoid credit card interest is to prevent debt accumulation through smart spending habits.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Smart Habits:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Create and stick to a budget</li>
                        <li>Build an emergency fund</li>
                        <li>Use credit cards responsibly</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-orange-800 text-sm">Warning Signs:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-orange-700">
                        <li>Making minimum payments only</li>
                        <li>Using cards for basic necessities</li>
                        <li>Maxing out credit limits</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Planning Integration */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Integrating Debt Payoff with Financial Planning</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Emergency Fund Priority</h4>
                    <div className="space-y-3 text-gray-600">
                      <p className="text-sm">
                        While paying off high-interest debt is crucial, maintaining a small emergency fund ($500-1000) 
                        prevents you from accumulating new debt when unexpected expenses arise.
                      </p>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Balanced Approach:</h5>
                        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                          <li>Build $1,000 emergency fund first</li>
                          <li>Focus on high-interest debt elimination</li>
                          <li>Return to building full emergency fund</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Long-term Wealth Building</h4>
                    <div className="space-y-3 text-gray-600">
                      <p className="text-sm">
                        Once you've eliminated high-interest credit card debt, redirect those payments toward building 
                        wealth through investments, retirement savings, and other financial goals.
                      </p>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">Next Steps:</h5>
                        <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                          <li>Maximize employer 401(k) match</li>
                          <li>Build 3-6 month emergency fund</li>
                          <li>Invest in diversified portfolio</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Pro Tip</h4>
                  <p className="text-blue-700 text-sm">
                    Use our credit card calculator regularly to track your progress and stay motivated. Seeing your 
                    balance decrease and payoff date approach provides powerful psychological reinforcement for 
                    maintaining good financial habits.
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

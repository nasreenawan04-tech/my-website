
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HomeLoanResult {
  emi: number;
  totalAmount: number;
  totalInterest: number;
  principalAmount: number;
  interestPercentage: number;
  amortizationSchedule: Array<{
    month: number;
    emi: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export default function HomeLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState('500000');
  const [interestRate, setInterestRate] = useState('8.50');
  const [loanTenure, setLoanTenure] = useState('20');
  const [tenureType, setTenureType] = useState('years');
  const [processingFee, setProcessingFee] = useState('0');
  const [currency, setCurrency] = useState('USD');
  const [downPayment, setDownPayment] = useState('100000');
  const [showSchedule, setShowSchedule] = useState(false);
  const [result, setResult] = useState<HomeLoanResult | null>(null);

  const calculateHomeLoan = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
    const tenure = tenureType === 'years' ? parseFloat(loanTenure) * 12 : parseFloat(loanTenure);

    if (principal && rate && tenure) {
      // EMI calculation using the standard formula
      // EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]
      const emi = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);
      const totalAmount = emi * tenure;
      const totalInterest = totalAmount - principal;
      const interestPercentage = (totalInterest / totalAmount) * 100;

      // Generate amortization schedule (first 5 years)
      const amortizationSchedule = [];
      let currentBalance = principal;
      
      for (let month = 1; month <= Math.min(60, tenure) && currentBalance > 1; month++) {
        const interestPayment = currentBalance * rate;
        const principalPayment = Math.min(emi - interestPayment, currentBalance);
        
        currentBalance -= principalPayment;
        
        amortizationSchedule.push({
          month,
          emi: Math.round(emi * 100) / 100,
          principal: Math.round(principalPayment * 100) / 100,
          interest: Math.round(interestPayment * 100) / 100,
          balance: Math.max(0, Math.round(currentBalance * 100) / 100)
        });
        
        if (currentBalance <= 1) break;
      }

      setResult({
        emi: Math.round(emi * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        principalAmount: principal,
        interestPercentage: Math.round(interestPercentage * 100) / 100,
        amortizationSchedule
      });
    } else if (principal && rate === 0 && tenure) {
      // Handle 0% interest rate
      const emi = principal / tenure;
      const totalAmount = principal;

      setResult({
        emi: Math.round(emi * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalInterest: 0,
        principalAmount: principal,
        interestPercentage: 0,
        amortizationSchedule: []
      });
    }
  };

  const resetCalculator = () => {
    setLoanAmount('500000');
    setInterestRate('8.50');
    setLoanTenure('20');
    setTenureType('years');
    setProcessingFee('0');
    setCurrency('USD');
    setDownPayment('100000');
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

  const calculateProcessingFee = () => {
    const fee = parseFloat(processingFee) || 0;
    return fee;
  };

  const getPropertyValue = () => {
    const loanAmt = parseFloat(loanAmount) || 0;
    const downPmt = parseFloat(downPayment) || 0;
    return loanAmt + downPmt;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Home Loan Calculator - Calculate Home Loan EMI & Mortgage Payments | DapsiWow</title>
        <meta name="description" content="Free home loan EMI calculator to calculate monthly mortgage payments, total interest, and loan costs. Plan your home purchase with accurate home loan estimates and payment schedules." />
        <meta name="keywords" content="home loan calculator, home loan EMI, mortgage EMI calculator, housing loan calculator, property loan calculator, home finance, mortgage payments, real estate investment, home loan EMI, mortgage payment calculator, housing finance calculator" />
        <meta property="og:title" content="Home Loan Calculator - Calculate Home Loan EMI & Mortgage Payments | DapsiWow" />
        <meta property="og:description" content="Free home loan EMI calculator with down payment analysis, processing fees, and detailed payment schedules. Calculate accurate monthly mortgage payments instantly." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/home-loan-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Home Loan Calculator",
            "description": "Free online home loan EMI calculator to calculate mortgage payments, total interest costs, and loan expenses for home purchases. Features down payment analysis and detailed payment schedules.",
            "url": "https://dapsiwow.com/tools/home-loan-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate home loan EMI for any amount",
              "Support for multiple currencies",
              "Down payment analysis",
              "Processing fee calculations",
              "Detailed amortization schedule",
              "Mortgage payment planning"
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
                <span className="text-sm font-medium text-blue-700">Professional Home Loan Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight" data-testid="text-page-title">
                Home Loan
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate your home loan EMI, total interest, and monthly mortgage payments for informed property investment decisions
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Home Loan Configuration</h2>
                    <p className="text-gray-600">Enter your home loan details to get accurate EMI calculations</p>
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

                    {/* Home Loan Amount */}
                    <div className="space-y-3">
                      <Label htmlFor="loan-amount" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Home Loan Amount
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="loan-amount"
                          type="number"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="500,000"
                          min="0"
                          step="1000"
                          data-testid="input-loan-amount"
                        />
                      </div>
                    </div>

                    {/* Down Payment */}
                    <div className="space-y-3">
                      <Label htmlFor="down-payment" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Down Payment
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="down-payment"
                          type="number"
                          value={downPayment}
                          onChange={(e) => setDownPayment(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="100,000"
                          min="0"
                          step="1000"
                          data-testid="input-down-payment"
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
                          placeholder="8.50"
                          min="0"
                          max="30"
                          step="0.01"
                          data-testid="input-interest-rate"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                      </div>
                    </div>

                    {/* Loan Tenure */}
                    <div className="space-y-3 md:col-span-2">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Loan Term</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="number"
                          value={loanTenure}
                          onChange={(e) => setLoanTenure(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="20"
                          min="1"
                          data-testid="input-loan-tenure"
                        />
                        <Select value={tenureType} onValueChange={setTenureType}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-tenure-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="years">Years</SelectItem>
                            <SelectItem value="months">Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Processing Fee */}
                    <div className="space-y-3">
                      <Label htmlFor="processing-fee" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Processing Fee (Optional)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="processing-fee"
                          type="number"
                          value={processingFee}
                          onChange={(e) => setProcessingFee(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="2,500"
                          min="0"
                          step="100"
                          data-testid="input-processing-fee"
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        One-time fee charged by the lender for processing your home loan
                      </p>
                    </div>
                  </div>

                  {/* Property Value Display */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Total Property Value</span>
                      <span className="text-2xl font-bold text-blue-900">
                        {formatCurrency(getPropertyValue())}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
                      Loan Amount + Down Payment = Total Property Cost
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateHomeLoan}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Home Loan EMI
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
                    <div className="space-y-6" data-testid="home-loan-results">
                      {/* Monthly EMI Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Monthly EMI</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-monthly-emi">
                          {formatCurrency(result.emi)}
                        </div>
                      </div>

                      {/* Payment Breakdown */}
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
                            <span className="font-medium text-gray-700">Total Interest</span>
                            <span className="font-bold text-orange-600" data-testid="text-total-interest">
                              {formatCurrency(result.totalInterest)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Total Amount</span>
                            <span className="font-bold text-gray-900" data-testid="text-total-amount">
                              {formatCurrency(result.totalAmount)}
                            </span>
                          </div>
                        </div>
                        {calculateProcessingFee() > 0 && (
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Processing Fee</span>
                              <span className="font-bold text-orange-600" data-testid="text-processing-fee">
                                {formatCurrency(calculateProcessingFee())}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Home Loan Guidelines */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <h4 className="font-bold text-green-800 mb-4 text-lg">Home Loan Guidelines</h4>
                        <div className="space-y-2 text-sm text-green-700">
                          <p>• EMI should not exceed 40% of monthly income</p>
                          <p>• Consider property taxes and maintenance costs</p>
                          <p>• Factor in home insurance premiums</p>
                          <p>• Keep emergency fund for 6-12 months of EMI</p>
                          <p>• Property value: {formatCurrency(getPropertyValue())}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">🏠</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter home loan details to calculate your EMI</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Schedule */}
          {result && showSchedule && result.amortizationSchedule.length > 0 && (
            <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Payment Schedule (First 5 Years)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <th className="px-6 py-4 text-left font-bold text-gray-900 rounded-l-lg">Payment #</th>
                        <th className="px-6 py-4 text-right font-bold text-gray-900">EMI</th>
                        <th className="px-6 py-4 text-right font-bold text-gray-900">Principal</th>
                        <th className="px-6 py-4 text-right font-bold text-gray-900">Interest</th>
                        <th className="px-6 py-4 text-right font-bold text-gray-900 rounded-r-lg">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.amortizationSchedule.map((payment, index) => (
                        <tr key={index} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{payment.month}</td>
                          <td className="px-6 py-4 text-right text-gray-900 font-medium">
                            {formatCurrency(payment.emi)}
                          </td>
                          <td className="px-6 py-4 text-right text-green-600 font-bold">
                            {formatCurrency(payment.principal)}
                          </td>
                          <td className="px-6 py-4 text-right text-orange-600 font-medium">
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Home Loan Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A home loan calculator is an essential financial planning tool that helps you estimate your monthly 
                    mortgage payments, total interest costs, and overall loan expenses before purchasing a property. Our 
                    free online home loan EMI calculator provides accurate calculations based on your loan amount, interest rate, 
                    and repayment tenure.
                  </p>
                  <p>
                    Whether you're a first-time homebuyer or looking to refinance your existing mortgage, this calculator 
                    helps you understand the financial commitment involved in home ownership. With support for multiple 
                    currencies and detailed payment breakdowns, you can make informed decisions about your property investment.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Calculate Home Loan EMI?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    The home loan EMI formula is: EMI = [P x R x (1+R)^N] / [(1+R)^N-1]
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>P = Principal home loan amount</li>
                    <li>R = Monthly interest rate (Annual rate ÷ 12)</li>
                    <li>N = Number of monthly installments</li>
                  </ul>
                  <p>
                    Our calculator automatically applies this formula and includes additional factors like down payment 
                    analysis, processing fees, and total property value calculations to give you a comprehensive view 
                    of your home financing costs.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Features of Our Home Loan Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for 10+ international currencies</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Down payment analysis and property value calculation</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Processing fee inclusion for accurate cost estimation</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Detailed amortization schedule</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Mobile-friendly responsive design</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Using Our Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Plan your home purchase budget effectively</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Compare different loan scenarios and lenders</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Understand the impact of down payment amounts</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Make informed decisions about loan tenure</span>
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
            {/* Home Loan Types Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Types of Home Loans for EMI Calculation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Fixed-Rate Mortgages</h4>
                    <p className="text-gray-600">
                      Fixed-rate home loans maintain the same interest rate throughout the loan tenure, providing 
                      predictable monthly payments. Use our calculator to determine exact EMI amounts for budget planning.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Adjustable-Rate Mortgages (ARM)</h4>
                    <p className="text-gray-600">
                      ARM loans have interest rates that fluctuate based on market conditions. Our calculator helps 
                      estimate initial payments and understand rate adjustment impacts on your EMI.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">FHA Loans</h4>
                    <p className="text-gray-600">
                      Federal Housing Administration loans offer lower down payment options for qualified buyers. 
                      Calculate EMI with different down payment scenarios to find the best fit for your budget.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">VA Loans</h4>
                    <p className="text-gray-600">
                      Veterans Affairs loans provide favorable terms for eligible military personnel and veterans. 
                      Our calculator helps determine monthly payments with various VA loan configurations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Factors Affecting Home Loan EMI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Factors Affecting Home Loan EMI</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Loan Amount</h4>
                      <p className="text-sm">Higher loan amounts result in higher EMIs. Increase your down payment to reduce the loan amount and monthly payments.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Interest Rate</h4>
                      <p className="text-sm">Even a small difference in interest rates significantly affects total interest cost. Shop around for the best rates.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Loan Tenure</h4>
                      <p className="text-sm">Longer tenure reduces EMI but increases total interest. Balance monthly affordability with total cost.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Down Payment</h4>
                      <p className="text-sm">Higher down payments reduce loan amount and eliminate PMI costs, significantly lowering monthly payments.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Home Buying Strategies</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">28/36 Rule</h4>
                      <p className="text-sm text-blue-700">Spend no more than 28% of gross income on housing costs and 36% on total debt payments.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">20% Down Payment</h4>
                      <p className="text-sm text-green-700">Put down 20% to avoid private mortgage insurance (PMI) and secure better interest rates.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Pre-approval Strategy</h4>
                      <p className="text-sm text-orange-700">Get pre-approved to understand exact loan amounts and strengthen your buying position.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Rate Shopping</h4>
                      <p className="text-sm text-purple-700">Compare rates from multiple lenders within a 14-45 day window to minimize credit impact.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Home Loan FAQs Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about Home Loans</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What is the minimum down payment required?</h4>
                      <p className="text-gray-600 text-sm">Conventional loans typically require 5-20% down, while FHA loans allow as little as 3.5%. VA and USDA loans may require no down payment for qualified borrowers.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does my credit score affect home loan rates?</h4>
                      <p className="text-gray-600 text-sm">Higher credit scores qualify for lower interest rates. A score above 740 typically gets the best rates, while scores below 620 may require specialized loan programs.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What additional costs should I consider?</h4>
                      <p className="text-gray-600 text-sm">Beyond EMI, budget for property taxes, homeowners insurance, PMI (if applicable), HOA fees, and maintenance costs. These can add 20-40% to your monthly housing expense.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I pay off my home loan early?</h4>
                      <p className="text-gray-600 text-sm">Most home loans allow early payoff without penalties. Making extra principal payments or bi-weekly payments can significantly reduce the loan term and total interest paid.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I choose a 15-year or 30-year mortgage?</h4>
                      <p className="text-gray-600 text-sm">15-year mortgages have higher monthly payments but lower total interest costs. 30-year mortgages offer lower monthly payments with higher total costs. Choose based on your cash flow and financial goals.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What is private mortgage insurance (PMI)?</h4>
                      <p className="text-gray-600 text-sm">PMI protects lenders when down payments are less than 20%. It typically costs 0.3-1.5% of the loan amount annually and can be removed once you reach 20% equity.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does refinancing affect my EMI?</h4>
                      <p className="text-gray-600 text-sm">Refinancing to a lower rate can reduce your EMI and total interest costs. However, consider closing costs and how long you plan to stay in the home.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What happens if property values decline?</h4>
                      <p className="text-gray-600 text-sm">You'll continue paying the original loan amount even if property values drop. This is why it's important to buy within your means and plan for long-term ownership.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Home Loan vs Rent Analysis */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Home Loan vs Rent: Making the Right Decision</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">When to Buy with a Home Loan</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Planning to stay in the area for 5+ years</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Stable income and good credit score</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Have adequate down payment and emergency fund</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Monthly housing costs (including taxes/insurance) affordable</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">When Renting Makes Sense</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Uncertain about long-term location</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Limited down payment or poor credit</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Rent significantly lower than mortgage payment</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Want flexibility and no maintenance responsibilities</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Smart Analysis Tip</h4>
                  <p className="text-blue-700 text-sm">
                    Use our home loan calculator to determine monthly payments, then compare with rental costs including renter's 
                    insurance. Factor in tax benefits, appreciation potential, and the value of building equity versus investing 
                    the down payment elsewhere.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Closing Costs and Additional Expenses */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Closing Costs</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Closing costs typically range from 2-5% of the loan amount and include various fees and expenses.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Common Closing Costs:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Loan origination fees (0.5-1%)</li>
                        <li>Appraisal fees ($300-600)</li>
                        <li>Home inspection ($300-500)</li>
                        <li>Title insurance and search</li>
                        <li>Attorney fees</li>
                        <li>Recording fees</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Ongoing Expenses</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Beyond your EMI, budget for these recurring homeownership expenses.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-orange-800 text-sm">Monthly/Annual Costs:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-orange-700">
                        <li>Property taxes (1-3% of home value)</li>
                        <li>Homeowners insurance ($800-2000/year)</li>
                        <li>PMI (if down payment &lt; 20%)</li>
                        <li>HOA fees (varies by community)</li>
                        <li>Maintenance (1-3% of home value)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Tax Benefits</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Home loans offer several tax advantages that can reduce your effective borrowing cost.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-800 text-sm">Available Deductions:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-purple-700">
                        <li>Mortgage interest deduction</li>
                        <li>Property tax deduction</li>
                        <li>PMI deduction (income limits apply)</li>
                        <li>Points deduction (if paid upfront)</li>
                        <li>Home office deduction (if applicable)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

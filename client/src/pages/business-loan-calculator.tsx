import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BusinessLoanResult {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  yearlyPayment: number;
  debtServiceCoverage: number;
  loanToValue: number;
  amortizationSchedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export default function BusinessLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState('250000');
  const [interestRate, setInterestRate] = useState('7.50');
  const [loanTerm, setLoanTerm] = useState('10');
  const [termUnit, setTermUnit] = useState('years');
  const [loanType, setLoanType] = useState('term-loan');
  const [businessRevenue, setBusinessRevenue] = useState('');
  const [collateralValue, setCollateralValue] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [showSchedule, setShowSchedule] = useState(false);
  const [result, setResult] = useState<BusinessLoanResult | null>(null);

  const calculateBusinessLoan = () => {
    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate) / 100;
    const rate = annualRate / 12; // Monthly interest rate
    const termMonths = termUnit === 'years' ? parseFloat(loanTerm) * 12 : parseFloat(loanTerm);
    const revenue = parseFloat(businessRevenue) || 0;
    const collateral = parseFloat(collateralValue) || 0;

    if (principal <= 0 || annualRate <= 0 || termMonths <= 0) return;

    // Business loan payment calculation using standard formula
    let monthlyPayment;
    
    if (loanType === 'line-of-credit') {
      // For line of credit, assume interest-only payments
      monthlyPayment = principal * rate;
    } else {
      // Standard term loan calculation
      monthlyPayment = (principal * rate * Math.pow(1 + rate, termMonths)) / (Math.pow(1 + rate, termMonths) - 1);
    }

    // Generate amortization schedule
    const amortizationSchedule = [];
    let currentBalance = principal;
    let totalInterestPaid = 0;

    for (let month = 1; month <= termMonths && currentBalance > 0.01; month++) {
      const interestPayment = currentBalance * rate;
      const principalPayment = loanType === 'line-of-credit' ? 0 : Math.min(monthlyPayment - interestPayment, currentBalance);
      
      if (loanType !== 'line-of-credit') {
        currentBalance -= principalPayment;
      }
      totalInterestPaid += interestPayment;

      if (month <= 60) { // Show first 5 years only in UI
        amortizationSchedule.push({
          month,
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
          balance: currentBalance
        });
      }
    }
    
    const totalAmount = loanType === 'line-of-credit' ? totalInterestPaid + principal : monthlyPayment * termMonths;
    const totalInterest = loanType === 'line-of-credit' ? totalInterestPaid : totalAmount - principal;
    const yearlyPayment = monthlyPayment * 12;
    
    // Business-specific metrics
    const debtServiceCoverage = revenue > 0 ? revenue / yearlyPayment : 0;
    const loanToValue = collateral > 0 ? (principal / collateral) * 100 : 0;

    setResult({
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      yearlyPayment: Math.round(yearlyPayment * 100) / 100,
      debtServiceCoverage: Math.round(debtServiceCoverage * 100) / 100,
      loanToValue: Math.round(loanToValue * 100) / 100,
      amortizationSchedule
    });
  };

  const resetCalculator = () => {
    setLoanAmount('250000');
    setInterestRate('7.50');
    setLoanTerm('10');
    setTermUnit('years');
    setLoanType('term-loan');
    setBusinessRevenue('');
    setCollateralValue('');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Business Loan Calculator - Calculate Commercial Loan Payments | DapsiWow</title>
        <meta name="description" content="Free business loan calculator to calculate monthly payments for SBA loans, equipment financing, working capital loans, and commercial mortgages. Get instant business loan analysis with debt service coverage and loan-to-value ratios." />
        <meta name="keywords" content="business loan calculator, commercial loan calculator, SBA loan calculator, equipment financing calculator, working capital loan calculator, commercial mortgage calculator, debt service coverage ratio, business financing calculator" />
        <meta property="og:title" content="Business Loan Calculator - Calculate Commercial Loan Payments | DapsiWow" />
        <meta property="og:description" content="Free business loan calculator for SBA loans, equipment financing, working capital loans with debt service coverage analysis. Calculate accurate monthly payments instantly." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/business-loan-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Business Loan Calculator",
            "description": "Free online business loan calculator to calculate monthly payments and analyze business financing options including SBA loans, equipment financing, working capital loans, and commercial mortgages.",
            "url": "https://dapsiwow.com/tools/business-loan-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate business loan payments",
              "Support for multiple loan types",
              "Debt service coverage ratio analysis",
              "Loan-to-value ratio calculation",
              "Amortization schedule generation",
              "Multi-currency support"
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
                <span className="text-sm font-medium text-blue-700">Professional Business Loan Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Business Loan
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate business loan payments with debt service coverage analysis for SBA loans, equipment financing, and commercial mortgages
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Business Loan Configuration</h2>
                    <p className="text-gray-600">Enter your business loan details to get accurate payment calculations and financial analysis</p>
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

                    {/* Loan Type */}
                    <div className="space-y-3">
                      <Label htmlFor="loan-type" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Loan Type
                      </Label>
                      <Select value={loanType} onValueChange={setLoanType}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-loan-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="term-loan">Term Loan</SelectItem>
                          <SelectItem value="sba-loan">SBA Loan</SelectItem>
                          <SelectItem value="equipment-loan">Equipment Financing</SelectItem>
                          <SelectItem value="line-of-credit">Line of Credit</SelectItem>
                          <SelectItem value="working-capital">Working Capital Loan</SelectItem>
                          <SelectItem value="commercial-mortgage">Commercial Mortgage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Loan Amount */}
                    <div className="space-y-3">
                      <Label htmlFor="loan-amount" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Loan Amount
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="loan-amount"
                          type="number"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="250,000"
                          data-testid="input-loan-amount"
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
                          placeholder="7.50"
                          step="0.01"
                          data-testid="input-interest-rate"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                      </div>
                    </div>

                    {/* Loan Term */}
                    <div className="md:col-span-2 space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Loan Term</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="number"
                          value={loanTerm}
                          onChange={(e) => setLoanTerm(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="10"
                          min="1"
                          data-testid="input-loan-term"
                        />
                        <Select value={termUnit} onValueChange={setTermUnit}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-term-unit">
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

                  {/* Business Information */}
                  <div className="space-y-6 border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-900">Business Information (Optional)</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="business-revenue" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Annual Business Revenue
                        </Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                          <Input
                            id="business-revenue"
                            type="number"
                            value={businessRevenue}
                            onChange={(e) => setBusinessRevenue(e.target.value)}
                            className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            placeholder="500,000"
                            data-testid="input-business-revenue"
                          />
                        </div>
                        <p className="text-sm text-gray-500">Used to calculate debt service coverage ratio</p>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="collateral-value" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Collateral Value
                        </Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                          <Input
                            id="collateral-value"
                            type="number"
                            value={collateralValue}
                            onChange={(e) => setCollateralValue(e.target.value)}
                            className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            placeholder="300,000"
                            data-testid="input-collateral-value"
                          />
                        </div>
                        <p className="text-sm text-gray-500">Used to calculate loan-to-value ratio</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateBusinessLoan}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Business Loan
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Loan Analysis</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="business-loan-results">
                      {/* Monthly Payment Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                          {loanType === 'line-of-credit' ? 'Monthly Interest Payment' : 'Monthly Payment'}
                        </div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-monthly-payment">
                          {formatCurrency(result.monthlyPayment)}
                        </div>
                      </div>

                      {/* Payment Breakdown */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Annual Payment</span>
                            <span className="font-bold text-gray-900" data-testid="text-yearly-payment">
                              {formatCurrency(result.yearlyPayment)}
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
                      </div>

                      {/* Business Metrics */}
                      {(result.debtServiceCoverage > 0 || result.loanToValue > 0) && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-gray-900 text-lg">Business Metrics</h4>
                          
                          {result.debtServiceCoverage > 0 && (
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-blue-700">Debt Service Coverage Ratio</span>
                                <span className={`font-bold text-lg ${result.debtServiceCoverage >= 1.25 ? 'text-green-600' : result.debtServiceCoverage >= 1.0 ? 'text-yellow-600' : 'text-red-600'}`} data-testid="text-debt-service-coverage">
                                  {result.debtServiceCoverage.toFixed(2)}x
                                </span>
                              </div>
                              <p className="text-sm text-blue-600">
                                {result.debtServiceCoverage >= 1.25 ? 'Excellent - Strong ability to service debt' : 
                                 result.debtServiceCoverage >= 1.0 ? 'Good - Adequate ability to service debt' : 
                                 'Poor - May struggle to service debt'}
                              </p>
                            </div>
                          )}
                          
                          {result.loanToValue > 0 && (
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-purple-700">Loan-to-Value Ratio</span>
                                <span className={`font-bold text-lg ${result.loanToValue <= 80 ? 'text-green-600' : result.loanToValue <= 90 ? 'text-yellow-600' : 'text-red-600'}`} data-testid="text-loan-to-value">
                                  {result.loanToValue.toFixed(1)}%
                                </span>
                              </div>
                              <p className="text-sm text-purple-600">
                                {result.loanToValue <= 80 ? 'Low risk - Good collateral coverage' : 
                                 result.loanToValue <= 90 ? 'Moderate risk - Acceptable collateral' : 
                                 'High risk - Limited collateral coverage'}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Loan Type Information */}
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Loan Type</span>
                          <span className="font-bold text-blue-600">
                            {loanType === 'term-loan' ? 'Term Loan' :
                             loanType === 'sba-loan' ? 'SBA Loan' :
                             loanType === 'equipment-loan' ? 'Equipment Financing' :
                             loanType === 'line-of-credit' ? 'Line of Credit' :
                             loanType === 'working-capital' ? 'Working Capital Loan' :
                             'Commercial Mortgage'}
                          </span>
                        </div>
                        {loanType === 'line-of-credit' && (
                          <p className="text-sm text-gray-500 mt-2">
                            Note: Line of credit shows interest-only payments. Principal repayment terms may vary.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">$</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter business loan details to see payment analysis</p>
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
                      {result.amortizationSchedule.map((payment, index) => (
                        <tr key={index} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{payment.month}</td>
                          <td className="px-6 py-4 text-right text-gray-900 font-medium">
                            {formatCurrency(payment.payment)}
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

          {/* SEO Content Sections */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Business Loan Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A business loan calculator is an essential financial tool that helps entrepreneurs and business owners 
                    determine monthly payments, total interest costs, and debt service obligations for commercial financing. 
                    Our advanced calculator provides accurate calculations for various business loan types including SBA loans, 
                    equipment financing, working capital loans, and commercial mortgages.
                  </p>
                  <p>
                    Beyond basic payment calculations, our business loan calculator analyzes critical financial metrics like 
                    debt service coverage ratio and loan-to-value ratios to help you understand loan feasibility and risk 
                    assessment from a lender's perspective.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How Business Loan Calculations Work</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Business loan calculations use the standard amortization formula: Payment = [P × R × (1+R)^N] / [(1+R)^N-1], 
                    where P is principal, R is monthly interest rate, and N is number of payments.
                  </p>
                  <p>
                    Our calculator also computes business-specific metrics including debt service coverage ratio (annual revenue 
                    divided by annual debt payments) and loan-to-value ratio (loan amount divided by collateral value) to provide 
                    comprehensive loan analysis for business decision-making.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Types of Business Loans</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>SBA Loans - Government-backed loans with favorable terms</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Equipment Financing - Loans secured by equipment purchases</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Working Capital Loans - Short-term financing for operations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Commercial Mortgages - Real estate financing for business properties</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Lines of Credit - Flexible revolving credit facilities</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Financial Metrics</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Debt Service Coverage Ratio - Measures ability to service debt payments</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Loan-to-Value Ratio - Assesses loan risk relative to collateral</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Monthly Cash Flow Impact - Understand payment effects on operations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Total Cost of Capital - Complete interest and fee analysis</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Amortization Schedule - Detailed payment breakdown over time</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Comprehensive SEO Content */}
          <div className="mt-12 space-y-8">
            {/* Business Loan Requirements */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Business Loan Requirements and Qualifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Credit Requirements</h4>
                    <p className="text-gray-600">
                      Most business loans require a personal credit score of 680+ for favorable rates, though some SBA loans 
                      accept scores as low as 580. Business credit history, while not always required for startups, strengthens 
                      applications significantly.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Financial Documentation</h4>
                    <p className="text-gray-600">
                      Lenders typically require 2-3 years of business tax returns, profit and loss statements, cash flow 
                      statements, balance sheets, and bank statements. Startups may substitute personal financial statements 
                      and business plans.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Cash Flow Analysis</h4>
                    <p className="text-gray-600">
                      Debt service coverage ratio of 1.25x or higher is preferred, meaning annual cash flow should exceed 
                      annual loan payments by 25%. This ensures adequate cash flow to service debt while maintaining operations.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Collateral and Down Payment</h4>
                    <p className="text-gray-600">
                      Equipment loans typically require 10-20% down payment, while commercial real estate may require 20-30%. 
                      SBA loans often have lower down payment requirements but longer processing times.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interest Rates and Terms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Business Loan Interest Rates</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">SBA Loans</h4>
                      <p className="text-sm">Typically 11.5% - 14.5% for SBA 7(a) loans, with rates tied to prime rate plus margin. Lower rates due to government guarantee.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Equipment Financing</h4>
                      <p className="text-sm">Usually 8% - 25% depending on equipment type and borrower creditworthiness. Equipment serves as collateral.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Working Capital Loans</h4>
                      <p className="text-sm">Range from 7% - 30% for term loans, with lines of credit often having variable rates based on prime rate.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Commercial Mortgages</h4>
                      <p className="text-sm">Generally 6% - 12% for commercial real estate, with rates varying by property type and loan-to-value ratio.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Loan Terms and Repayment</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Short-Term Loans</h4>
                      <p className="text-sm text-blue-700">3 months to 2 years for working capital and cash flow needs. Higher payments but less total interest.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Medium-Term Loans</h4>
                      <p className="text-sm text-green-700">2 to 7 years for equipment purchases and business expansion. Balanced payment amounts and interest costs.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Long-Term Loans</h4>
                      <p className="text-sm text-orange-700">7 to 25 years for real estate and major capital investments. Lower payments but higher total interest.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Flexible Options</h4>
                      <p className="text-sm text-purple-700">Seasonal payment schedules, interest-only periods, and balloon payments available for specific business needs.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Business Loan Application Process */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Business Loan Application Process</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                      <span className="text-blue-800 font-bold text-lg">1</span>
                    </div>
                    <h4 className="text-center font-semibold text-gray-800">Preparation Phase</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Gather financial statements and tax returns</li>
                      <li>• Prepare business plan and cash flow projections</li>
                      <li>• Check personal and business credit scores</li>
                      <li>• Calculate loan amount needed using our calculator</li>
                      <li>• Identify potential collateral assets</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                      <span className="text-green-800 font-bold text-lg">2</span>
                    </div>
                    <h4 className="text-center font-semibold text-gray-800">Application Submission</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Complete loan application with accurate information</li>
                      <li>• Submit required documentation packages</li>
                      <li>• Pay application fees if required</li>
                      <li>• Respond promptly to lender requests</li>
                      <li>• Schedule business site visits if needed</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                      <span className="text-purple-800 font-bold text-lg">3</span>
                    </div>
                    <h4 className="text-center font-semibold text-gray-800">Approval and Closing</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Undergo credit and business verification</li>
                      <li>• Review and negotiate loan terms</li>
                      <li>• Complete collateral appraisals</li>
                      <li>• Sign loan documents and agreements</li>
                      <li>• Receive funding and begin repayment schedule</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits and Considerations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Using Our Calculator</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Accurate Financial Planning</h4>
                      <p className="text-green-700 text-sm">Calculate exact monthly payments to ensure loan payments fit within your business cash flow projections.</p>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Loan Comparison Tool</h4>
                      <p className="text-blue-700 text-sm">Compare different loan amounts, terms, and rates to find the most cost-effective financing option for your business.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Risk Assessment</h4>
                      <p className="text-purple-700 text-sm">Analyze debt service coverage and loan-to-value ratios to understand loan feasibility from a lender's perspective.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Multi-Currency Support</h4>
                      <p className="text-orange-700 text-sm">Calculate business loans in multiple currencies for international businesses and cross-border transactions.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Important Considerations</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Total Cost Analysis</h4>
                      <p className="text-red-700 text-sm">Consider all costs including origination fees, closing costs, and ongoing fees beyond just the interest rate.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Cash Flow Impact</h4>
                      <p className="text-yellow-700 text-sm">Ensure monthly payments don't strain cash flow, especially during seasonal business fluctuations.</p>
                    </div>
                    <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-indigo-800 mb-2">Prepayment Options</h4>
                      <p className="text-indigo-700 text-sm">Understand prepayment penalties and opportunities to pay off loans early when business cash flow improves.</p>
                    </div>
                    <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Economic Factors</h4>
                      <p className="text-gray-700 text-sm">Consider interest rate trends and economic conditions that may affect variable rate loans and refinancing opportunities.</p>
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
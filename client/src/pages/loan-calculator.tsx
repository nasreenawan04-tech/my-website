import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LoanResult {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  amortizationSchedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
  extraPaymentSavings?: {
    timeSaved: number;
    interestSaved: number;
    newTotalInterest: number;
    newPayoffTime: number;
  };
}

interface ComparisonLoan {
  name: string;
  amount: number;
  rate: number;
  term: number;
  monthlyPayment: number;
  totalInterest: number;
}

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState('100000');
  const [interestRate, setInterestRate] = useState('5.50');
  const [loanTerm, setLoanTerm] = useState('30');
  const [termUnit, setTermUnit] = useState('years');
  const [paymentFrequency, setPaymentFrequency] = useState('monthly');
  const [extraPayment, setExtraPayment] = useState('0');
  const [showAmortization, setShowAmortization] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonLoans, setComparisonLoans] = useState<ComparisonLoan[]>([]);
  const [result, setResult] = useState<LoanResult | null>(null);

  const calculateLoan = () => {
    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate) / 100;
    const termMonths = termUnit === 'years' ? parseFloat(loanTerm) * 12 : parseFloat(loanTerm);
    const extraPmt = parseFloat(extraPayment) || 0;

    if (principal <= 0 || annualRate <= 0 || termMonths <= 0) return;

    // Adjust for payment frequency
    const paymentsPerYear = paymentFrequency === 'weekly' ? 52 :
                           paymentFrequency === 'biweekly' ? 26 : 12;
    const periodicRate = annualRate / paymentsPerYear;
    const totalPayments = termMonths * (paymentsPerYear / 12);

    // Calculate regular payment
    const regularPayment = (principal * periodicRate * Math.pow(1 + periodicRate, totalPayments)) /
                          (Math.pow(1 + periodicRate, totalPayments) - 1);

    // Calculate amortization schedule
    const amortizationSchedule = [];
    let currentBalance = principal;
    let totalInterestPaid = 0;
    let actualPayments = 0;

    for (let payment = 1; payment <= totalPayments && currentBalance > 0.01; payment++) {
      const interestPayment = currentBalance * periodicRate;
      const principalPayment = Math.min(regularPayment - interestPayment + extraPmt, currentBalance);
      currentBalance -= principalPayment;
      totalInterestPaid += interestPayment;
      actualPayments = payment;

      if (payment <= 60) { // Show first 5 years only in UI
        amortizationSchedule.push({
          month: payment,
          payment: regularPayment + (extraPmt > 0 ? extraPmt : 0),
          principal: principalPayment,
          interest: interestPayment,
          balance: currentBalance
        });
      }
    }

    // Calculate extra payment savings if applicable
    let extraPaymentSavings;
    if (extraPmt > 0) {
      // Calculate without extra payments for comparison
      const regularTotalAmount = regularPayment * totalPayments;
      const regularTotalInterest = regularTotalAmount - principal;

      extraPaymentSavings = {
        timeSaved: Math.max(0, totalPayments - actualPayments),
        interestSaved: Math.max(0, regularTotalInterest - totalInterestPaid),
        newTotalInterest: totalInterestPaid,
        newPayoffTime: actualPayments
      };
    }

    const monthlyEquivalent = regularPayment * (paymentsPerYear / 12);

    setResult({
      monthlyPayment: monthlyEquivalent,
      totalAmount: (regularPayment + extraPmt) * actualPayments,
      totalInterest: totalInterestPaid,
      amortizationSchedule,
      extraPaymentSavings
    });
  };

  const resetCalculator = () => {
    setLoanAmount('100000');
    setInterestRate('5.50');
    setLoanTerm('30');
    setTermUnit('years');
    setPaymentFrequency('monthly');
    setExtraPayment('0');
    setShowAmortization(false);
    setShowComparison(false);
    setComparisonLoans([]);
    setResult(null);
  };

  const addToComparison = () => {
    if (result) {
      const newLoan: ComparisonLoan = {
        name: `Loan ${comparisonLoans.length + 1}`,
        amount: parseFloat(loanAmount),
        rate: parseFloat(interestRate),
        term: parseFloat(loanTerm),
        monthlyPayment: result.monthlyPayment,
        totalInterest: result.totalInterest
      };
      setComparisonLoans([...comparisonLoans, newLoan]);
      setShowComparison(true);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Loan Calculator - Calculate Monthly Payments | DapsiWow</title>
        <meta name="description" content="Free loan calculator to calculate monthly payments, total interest, and amortization schedules. Compare personal loans, auto loans, mortgages, and business loans. Get instant results with our easy-to-use loan payment calculator." />
        <meta name="keywords" content="loan calculator, monthly payment calculator, loan payment, personal loan calculator, auto loan calculator, mortgage calculator" />
        <meta property="og:title" content="Loan Calculator - Calculate Monthly Payments | DapsiWow" />
        <meta property="og:description" content="Free loan calculator to calculate monthly payments, total interest, and amortization schedules for personal loans, auto loans, and mortgages." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/tools/loan-calculator" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/loan-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Loan Calculator",
            "description": "Free online loan calculator to calculate monthly payments, total interest, and create amortization schedules for any type of loan.",
            "url": "https://dapsiwow.com/tools/loan-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "permissions": "browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate monthly loan payments",
              "Generate amortization schedules",
              "Compare different loan options",
              "Calculate extra payment benefits",
              "Support for various payment frequencies"
            ],
            "provider": {
              "@type": "Organization",
              "name": "DapsiWow",
              "url": "https://dapsiwow.com"
            }
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Loan Calculator</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0">
                <span className="block">Smart Loan</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Calculate monthly payments, interest costs, and payment schedules for any loan with precision and clarity
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
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Loan Configuration</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your loan details to get accurate payment calculations</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    {/* Loan Amount */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="loan-amount" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Loan Amount
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                        <Input
                          id="loan-amount"
                          type="number"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                          placeholder="100,000"
                          data-testid="input-loan-amount"
                        />
                      </div>
                    </div>

                    {/* Interest Rate */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="interest-rate" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Annual Interest Rate
                      </Label>
                      <div className="relative">
                        <Input
                          id="interest-rate"
                          type="number"
                          value={interestRate}
                          onChange={(e) => setInterestRate(e.target.value)}
                          className="h-10 sm:h-12 md:h-14 pr-6 sm:pr-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                          placeholder="5.50"
                          step="0.01"
                          data-testid="input-interest-rate"
                        />
                        <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">%</span>
                      </div>
                    </div>

                    {/* Loan Term */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Loan Term</Label>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <Input
                          type="number"
                          value={loanTerm}
                          onChange={(e) => setLoanTerm(e.target.value)}
                          className="h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                          placeholder="30"
                          min="1"
                          data-testid="input-loan-term"
                        />
                        <Select value={termUnit} onValueChange={setTermUnit}>
                          <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-term-unit">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="years">Years</SelectItem>
                            <SelectItem value="months">Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Payment Frequency */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Payment Frequency</Label>
                      <Select value={paymentFrequency} onValueChange={setPaymentFrequency}>
                        <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-payment-frequency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Extra Payment */}
                    <div className="md:col-span-2 space-y-2 sm:space-y-3">
                      <Label htmlFor="extra-payment" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Extra Payment (Optional)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                        <Input
                          id="extra-payment"
                          type="number"
                          value={extraPayment}
                          onChange={(e) => setExtraPayment(e.target.value)}
                          className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                          placeholder="0"
                          min="0"
                          data-testid="input-extra-payment"
                        />
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">Additional amount to pay each period to reduce interest and loan term</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={calculateLoan}
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Loan
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>

                  {/* Advanced Options */}
                  {result && (
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-3 sm:pt-4">
                      <Button
                        onClick={() => setShowAmortization(!showAmortization)}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                        data-testid="button-amortization"
                      >
                        {showAmortization ? 'Hide' : 'Show'} Payment Schedule
                      </Button>
                      <Button
                        onClick={addToComparison}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                        data-testid="button-add-comparison"
                      >
                        Add to Comparison
                      </Button>
                    </div>
                  )}
                </div>

                {/* Results Section */}
                {result ? (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Loan Calculation Results</h2>

                    <div className="space-y-4 sm:space-y-6 md:space-y-8" data-testid="loan-results">
                      {/* Monthly Payment Highlight */}
                      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-blue-200 shadow-sm">
                        <div className="text-center space-y-2 sm:space-y-3">
                          <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Monthly Payment</div>
                          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 break-all" data-testid="text-monthly-payment">
                            {formatCurrency(result.monthlyPayment)}
                          </div>
                        </div>
                      </div>

                      {/* Payment Breakdown */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Principal Amount</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base break-all" data-testid="text-principal-amount">
                              {formatCurrency(parseFloat(loanAmount))}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Total Interest</span>
                            <span className="font-bold text-orange-600 text-sm sm:text-base break-all" data-testid="text-total-interest">
                              {formatCurrency(result.totalInterest)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Total Amount</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base break-all" data-testid="text-total-amount">
                              {formatCurrency(result.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Extra Payment Benefits */}
                      {result.extraPaymentSavings && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-green-200">
                          <h4 className="font-bold text-green-800 mb-3 sm:mb-4 text-base sm:text-lg">Extra Payment Benefits</h4>
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium text-sm sm:text-base">Interest Saved:</span>
                              <span className="font-bold text-green-800 text-sm sm:text-base md:text-lg break-all">
                                {formatCurrency(result.extraPaymentSavings.interestSaved)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium text-sm sm:text-base">Time Saved:</span>
                              <span className="font-bold text-green-800 text-sm sm:text-base md:text-lg">
                                {Math.round(result.extraPaymentSavings.timeSaved / (paymentFrequency === 'weekly' ? 52 : paymentFrequency === 'biweekly' ? 26 : 12))} years
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Results</h2>
                    <div className="text-center py-8 sm:py-12 md:py-16" data-testid="no-results">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">%</div>
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base md:text-lg px-4">Enter loan details and calculate to see results</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amortization Schedule */}
          {result && showAmortization && (
            <Card className="mt-6 sm:mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Payment Schedule (First 5 Years)</h3>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-gray-900 text-xs sm:text-sm rounded-l-lg">Payment #</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Payment</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Principal</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Interest</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm rounded-r-lg">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.amortizationSchedule.map((payment, index) => (
                        <tr key={index} className="hover:bg-blue-50 transition-colors">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-gray-900 text-xs sm:text-sm">{payment.month}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-gray-900 font-medium text-xs sm:text-sm">
                            {formatCurrency(payment.payment)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-green-600 font-bold text-xs sm:text-sm">
                            {formatCurrency(payment.principal)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-orange-600 font-medium text-xs sm:text-sm">
                            {formatCurrency(payment.interest)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-gray-900 font-bold text-xs sm:text-sm">
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

          {/* Loan Comparison */}
          {showComparison && comparisonLoans.length > 0 && (
            <Card className="mt-6 sm:mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Loan Comparison</h3>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-gray-900 text-xs sm:text-sm rounded-l-lg">Loan</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Amount</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Rate</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Term</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Monthly Payment</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm rounded-r-lg">Total Interest</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {comparisonLoans.map((loan, index) => (
                        <tr key={index} className="hover:bg-blue-50 transition-colors">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 font-bold text-xs sm:text-sm">{loan.name}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-gray-900 font-medium text-xs sm:text-sm">
                            {formatCurrency(loan.amount)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-gray-900 font-medium text-xs sm:text-sm">
                            {loan.rate}%
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-gray-900 font-medium text-xs sm:text-sm">
                            {loan.term} years
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-blue-600 font-bold text-xs sm:text-sm">
                            {formatCurrency(loan.monthlyPayment)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-orange-600 font-bold text-xs sm:text-sm">
                            {formatCurrency(loan.totalInterest)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 sm:mt-6">
                  <Button
                    onClick={() => setComparisonLoans([])}
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                  >
                    Clear Comparison
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Educational Content */}
          <div className="mt-16 space-y-12">
            {/* What is a Loan Calculator */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Loan Calculator?</h2>
                <div className="prose max-w-none text-gray-700 space-y-4 text-lg leading-relaxed">
                  <p>
                    A loan calculator is an essential financial tool that helps borrowers estimate their monthly loan payments,
                    total interest costs, and overall loan expenses before applying for financing. Our free online loan calculator
                    uses sophisticated algorithms to provide accurate calculations for personal loans, auto loans, home loans,
                    and business financing options.
                  </p>
                  <p>
                    Whether you're planning to finance a new car, consolidate debt, fund home improvements, or start a business,
                    our loan payment calculator gives you the insights needed to make informed financial decisions. The calculator
                    instantly computes your monthly payment amount, total interest over the loan term, and provides a detailed
                    amortization schedule showing how your payments are allocated between principal and interest.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Benefits and Use Cases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Benefits</h2>
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 pl-6">
                      <h3 className="font-bold text-gray-900 mb-2">Free and Accurate</h3>
                      <p className="text-gray-600">Get precise calculations without any cost or registration required.</p>
                    </div>

                    <div className="border-l-4 border-green-500 pl-6">
                      <h3 className="font-bold text-gray-900 mb-2">Instant Results</h3>
                      <p className="text-gray-600">Calculate loan payments in real-time as you adjust parameters.</p>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-6">
                      <h3 className="font-bold text-gray-900 mb-2">Compare Options</h3>
                      <p className="text-gray-600">Test different scenarios to find the best loan terms for your situation.</p>
                    </div>

                    <div className="border-l-4 border-orange-500 pl-6">
                      <h3 className="font-bold text-gray-900 mb-2">Budget Planning</h3>
                      <p className="text-gray-600">Plan your budget with accurate monthly payment estimates.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Use Cases</h2>
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 mb-2">Loan Shopping</h3>
                      <p className="text-gray-600 text-sm">Compare offers from different lenders to find the best rates and terms.</p>
                    </div>

                    <div className="bg-green-50 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 mb-2">Budget Planning</h3>
                      <p className="text-gray-600 text-sm">Determine if loan payments fit within your monthly budget before applying.</p>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 mb-2">Refinancing Analysis</h3>
                      <p className="text-gray-600 text-sm">Calculate potential savings from refinancing existing loans.</p>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 mb-2">Early Payoff Planning</h3>
                      <p className="text-gray-600 text-sm">See how extra payments can reduce total interest and loan term.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Who Benefits */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-lg rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Who Benefits from Our Loan Calculator?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Students & Graduates</h3>
                    <div className="space-y-2 text-gray-600">
                      <p className="text-sm">Education loan planning and debt management strategies</p>
                      <p className="text-sm">Student loan refinancing calculations</p>
                      <p className="text-sm">Post-graduation financial planning</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Working Professionals</h3>
                    <div className="space-y-2 text-gray-600">
                      <p className="text-sm">Personal loan planning for major purchases</p>
                      <p className="text-sm">Career transition financing</p>
                      <p className="text-sm">Professional development loan calculations</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Business Owners</h3>
                    <div className="space-y-2 text-gray-600">
                      <p className="text-sm">Business expansion loan planning</p>
                      <p className="text-sm">Equipment financing calculations</p>
                      <p className="text-sm">Working capital loan analysis</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Homeowners & Buyers</h3>
                    <div className="space-y-2 text-gray-600">
                      <p className="text-sm">Mortgage payment calculations</p>
                      <p className="text-sm">Home equity loan planning</p>
                      <p className="text-sm">Refinancing opportunity analysis</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Investors & Planners</h3>
                    <div className="space-y-2 text-gray-600">
                      <p className="text-sm">Investment property financing</p>
                      <p className="text-sm">Portfolio leverage calculations</p>
                      <p className="text-sm">Long-term financial planning</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Families & Couples</h3>
                    <div className="space-y-2 text-gray-600">
                      <p className="text-sm">Family financial planning</p>
                      <p className="text-sm">Major purchase financing</p>
                      <p className="text-sm">Joint loan responsibility planning</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">How accurate is this loan calculator?</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Our loan calculator provides highly accurate estimates using industry-standard amortization formulas.
                      However, actual loan terms may vary based on creditworthiness, lender policies, and additional fees
                      not included in basic calculations.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">What's the difference between APR and interest rate?</h3>
                    <p className="text-gray-600 leading-relaxed">
                      The interest rate is the annual cost of borrowing expressed as a percentage. APR includes the interest
                      rate plus additional fees and costs, giving you a more complete picture of the loan's total annual cost.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Should I choose a shorter or longer loan term?</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Shorter terms mean higher monthly payments but significantly less total interest. Longer terms offer
                      lower monthly payments but more total interest over the loan's lifetime. Choose based on your budget
                      and financial goals.
                    </p>
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
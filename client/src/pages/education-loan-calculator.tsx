
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EducationLoanResult {
  emi: number;
  totalAmount: number;
  totalInterest: number;
  principalAmount: number;
  interestPercentage: number;
  graceMonths: number;
  totalPaymentPeriod: number;
  interestDuringCourse: number;
  graceInterest: number;
  finalPrincipal: number;
  monthlySchedule: Array<{
    month: number;
    emi: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export default function EducationLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState('50000');
  const [interestRate, setInterestRate] = useState('9.5');
  const [courseDuration, setCourseDuration] = useState('4');
  const [gracePeriod, setGracePeriod] = useState('6');
  const [repaymentTenure, setRepaymentTenure] = useState('15');
  const [currency, setCurrency] = useState('USD');
  const [showSchedule, setShowSchedule] = useState(false);
  const [result, setResult] = useState<EducationLoanResult | null>(null);

  const calculateEducationLoan = () => {
    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate) / 100;
    const rate = annualRate / 12; // Monthly interest rate
    const courseMonths = parseFloat(courseDuration) * 12;
    const graceMonths = parseFloat(gracePeriod);
    const repaymentMonths = parseFloat(repaymentTenure) * 12;

    if (principal <= 0 || annualRate <= 0 || courseMonths <= 0 || repaymentMonths <= 0) return;

    // Calculate interest during course period (simple interest)
    const interestDuringCourse = principal * annualRate * (courseMonths / 12);
    
    // Total amount after course completion
    const totalAfterCourse = principal + interestDuringCourse;
    
    // Calculate interest during grace period (simple interest on accumulated amount)
    const graceInterest = totalAfterCourse * annualRate * (graceMonths / 12);
    
    // Final principal amount for EMI calculation
    const finalPrincipal = totalAfterCourse + graceInterest;

    // EMI calculation for repayment period using compound interest formula
    const emi = (finalPrincipal * rate * Math.pow(1 + rate, repaymentMonths)) / (Math.pow(1 + rate, repaymentMonths) - 1);
    
    const totalAmount = emi * repaymentMonths;
    const totalInterest = totalAmount - principal;
    const interestPercentage = (totalInterest / totalAmount) * 100;
    const totalPaymentPeriod = courseMonths + graceMonths + repaymentMonths;

    // Generate monthly schedule for first 5 years of repayment
    const monthlySchedule = [];
    let currentBalance = finalPrincipal;
    
    for (let month = 1; month <= Math.min(60, repaymentMonths) && currentBalance > 1; month++) {
      const interestPayment = currentBalance * rate;
      const principalPayment = Math.min(emi - interestPayment, currentBalance);
      currentBalance -= principalPayment;
      
      monthlySchedule.push({
        month,
        emi: emi,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, currentBalance)
      });
    }

    setResult({
      emi: Math.round(emi * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      principalAmount: principal,
      interestPercentage: Math.round(interestPercentage * 100) / 100,
      graceMonths: graceMonths,
      totalPaymentPeriod: Math.round(totalPaymentPeriod),
      interestDuringCourse: Math.round(interestDuringCourse * 100) / 100,
      graceInterest: Math.round(graceInterest * 100) / 100,
      finalPrincipal: Math.round(finalPrincipal * 100) / 100,
      monthlySchedule
    });
  };

  const resetCalculator = () => {
    setLoanAmount('50000');
    setInterestRate('9.5');
    setCourseDuration('4');
    setGracePeriod('6');
    setRepaymentTenure('15');
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
        <title>Education Loan Calculator - Student Loan EMI Calculator | DapsiWow</title>
        <meta name="description" content="Free education loan calculator with grace period and course duration support. Calculate student loan EMI, total interest, and repayment schedule for education financing. Support for multiple currencies worldwide." />
        <meta name="keywords" content="education loan calculator, student loan calculator, education loan EMI, student loan EMI, college loan calculator, university loan calculator, student finance calculator, education financing tool, study abroad loan calculator, academic loan EMI" />
        <meta property="og:title" content="Education Loan Calculator - Student Loan EMI Calculator | DapsiWow" />
        <meta property="og:description" content="Calculate education loan EMI with grace period support for students. Free online student loan calculator for domestic and international education financing." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/education-loan-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Education Loan Calculator",
            "description": "Free online education loan calculator to calculate student loan EMI with grace period and course duration support for education financing planning.",
            "url": "https://dapsiwow.com/tools/education-loan-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate education loan EMI",
              "Grace period support",
              "Course duration consideration",
              "Multiple currency support",
              "Repayment schedule generation",
              "Interest accumulation during studies"
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
                <span className="text-sm font-medium text-blue-700">Professional Education Loan Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Education Loan
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate student loan EMI with course duration, grace period, and comprehensive repayment analysis
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Education Loan Configuration</h2>
                    <p className="text-gray-600">Enter your education loan details for accurate EMI calculations</p>
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

                    {/* Loan Amount */}
                    <div className="space-y-3">
                      <Label htmlFor="loan-amount" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Total Loan Amount
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="loan-amount"
                          type="number"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="50,000"
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
                          placeholder="9.5"
                          step="0.01"
                          data-testid="input-interest-rate"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                      </div>
                    </div>

                    {/* Course Duration */}
                    <div className="space-y-3">
                      <Label htmlFor="course-duration" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Course Duration (Years)
                      </Label>
                      <Input
                        id="course-duration"
                        type="number"
                        value={courseDuration}
                        onChange={(e) => setCourseDuration(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        placeholder="4"
                        min="0.5"
                        max="10"
                        step="0.5"
                        data-testid="input-course-duration"
                      />
                    </div>

                    {/* Grace Period */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Grace Period</Label>
                      <Select value={gracePeriod} onValueChange={setGracePeriod}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-grace-period">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0 months</SelectItem>
                          <SelectItem value="3">3 months</SelectItem>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="9">9 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="18">18 months</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500">Period after course completion before EMI starts</p>
                    </div>

                    {/* Repayment Tenure */}
                    <div className="space-y-3">
                      <Label htmlFor="repayment-tenure" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Repayment Tenure (Years)
                      </Label>
                      <Input
                        id="repayment-tenure"
                        type="number"
                        value={repaymentTenure}
                        onChange={(e) => setRepaymentTenure(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        placeholder="15"
                        min="1"
                        max="30"
                        step="1"
                        data-testid="input-repayment-tenure"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateEducationLoan}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate EMI
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
                    <div className="space-y-6" data-testid="education-loan-results">
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
                            <span className="font-medium text-gray-700">Original Loan Amount</span>
                            <span className="font-bold text-gray-900" data-testid="text-principal-amount">
                              {formatCurrency(result.principalAmount)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Interest During Course</span>
                            <span className="font-bold text-orange-500">
                              {formatCurrency(result.interestDuringCourse)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Interest During Grace Period</span>
                            <span className="font-bold text-orange-500">
                              {formatCurrency(result.graceInterest)}
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
                            <span className="font-medium text-gray-700">Total Amount Payable</span>
                            <span className="font-bold text-gray-900" data-testid="text-total-amount">
                              {formatCurrency(result.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Information */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="font-bold text-blue-800 mb-4 text-lg">Timeline Information</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700 font-medium">Course Duration:</span>
                            <span className="font-bold text-blue-800">{courseDuration} years</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700 font-medium">Grace Period:</span>
                            <span className="font-bold text-blue-800">{result.graceMonths} months</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700 font-medium">Repayment Period:</span>
                            <span className="font-bold text-blue-800">{repaymentTenure} years</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700 font-medium">Interest as % of Total:</span>
                            <span className="font-bold text-blue-800">{result.interestPercentage}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Visual Breakdown */}
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Breakdown</h3>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div
                              className="h-4 bg-green-500 rounded-l"
                              style={{ width: `${(result.principalAmount / result.totalAmount) * 100}%` }}
                            ></div>
                            <div
                              className="h-4 bg-red-400 rounded-r"
                              style={{ width: `${(result.totalInterest / result.totalAmount) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                              Principal ({Math.round((result.principalAmount / result.totalAmount) * 100)}%)
                            </span>
                            <span className="flex items-center">
                              <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                              Interest ({Math.round((result.totalInterest / result.totalAmount) * 100)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">🎓</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter education loan details and calculate to see EMI results</p>
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
                        <th className="px-6 py-4 text-right font-bold text-gray-900">EMI</th>
                        <th className="px-6 py-4 text-right font-bold text-gray-900">Principal</th>
                        <th className="px-6 py-4 text-right font-bold text-gray-900">Interest</th>
                        <th className="px-6 py-4 text-right font-bold text-gray-900 rounded-r-lg">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.monthlySchedule.map((payment, index) => (
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is an Education Loan?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    An education loan is a specialized financial product designed to help students fund their academic pursuits, 
                    whether for undergraduate, postgraduate, or professional courses. Unlike regular loans, education loans offer 
                    unique benefits like interest accrual during the study period and grace periods before repayment begins.
                  </p>
                  <p>
                    Our education loan calculator helps you understand the true cost of financing your education by calculating 
                    the monthly EMI, total interest payable, and the impact of grace periods on your overall loan burden. This 
                    comprehensive tool supports multiple currencies and provides detailed repayment schedules.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How Education Loans Work</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Education loans typically work in phases: the disbursement phase during your course, where interest 
                    accumulates on the disbursed amount; the grace period after course completion, where you can find 
                    employment; and finally, the repayment phase with fixed monthly EMIs.
                  </p>
                  <p>
                    Interest calculation for education loans is unique as it compounds during the study period and grace 
                    period, adding to the principal amount for EMI calculation. Our calculator accounts for these 
                    complexities to give you accurate projections for better financial planning.
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
                    <span>Comprehensive course duration consideration</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Flexible grace period options (0-18 months)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Interest accumulation during study period</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Multiple international currencies supported</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Detailed repayment schedule generation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits for Students</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Plan education financing before course admission</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Compare loan offers from different lenders</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Understand post-graduation financial obligations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Plan career choices based on EMI affordability</span>
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
            {/* Types of Education Loans */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Types of Education Loans</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Domestic Education Loans</h4>
                    <p className="text-gray-600">
                      Loans for pursuing education within your home country, typically offering lower interest rates 
                      and simpler documentation. These loans often have government backing and may include tax benefits 
                      for borrowers and their families.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">International Education Loans</h4>
                    <p className="text-gray-600">
                      Financing for overseas education, covering tuition fees, living expenses, and travel costs. 
                      These loans typically have higher limits but may require collateral or co-signers due to 
                      higher risk and currency fluctuation factors.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Professional Course Loans</h4>
                    <p className="text-gray-600">
                      Specialized loans for professional courses like medicine, engineering, law, or management. 
                      These often have course-specific terms and may offer employment-linked repayment options 
                      based on future earning potential.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Skill Development Loans</h4>
                    <p className="text-gray-600">
                      Loans for vocational training, certification courses, and skill enhancement programs. 
                      These are typically smaller amounts with shorter tenure but play a crucial role in 
                      career advancement and professional development.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Education Loan Planning */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Education Loan Planning Tips</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Start Early</h4>
                      <p className="text-sm">Begin researching loan options and improving credit scores at least 6-12 months before course commencement.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Compare Multiple Lenders</h4>
                      <p className="text-sm">Interest rates can vary significantly between banks and NBFCs. Even a 0.5% difference can save thousands over the loan tenure.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Understand Total Cost</h4>
                      <p className="text-sm">Consider processing fees, insurance, and other charges alongside interest rates when comparing loan options.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Plan for Grace Period</h4>
                      <p className="text-sm">Use the grace period wisely to secure employment and build an emergency fund before EMI payments begin.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Repayment Strategies</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Income-Based Planning</h4>
                      <p className="text-sm text-blue-700">Ensure EMI doesn't exceed 30-40% of your expected starting salary to maintain financial stability.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Prepayment Strategy</h4>
                      <p className="text-sm text-green-700">Make partial prepayments from bonuses or salary increments to reduce principal and save on interest.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Tax Benefits</h4>
                      <p className="text-sm text-orange-700">Utilize Section 80E tax deductions on interest payments to reduce overall education financing cost.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Emergency Fund</h4>
                      <p className="text-sm text-purple-700">Maintain 3-6 months of EMI amount as emergency fund to handle unexpected financial situations.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Education Loan FAQs */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about Education Loans</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What is the maximum loan amount available for education?</h4>
                      <p className="text-gray-600 text-sm">Education loan amounts vary by country and lender. In India, loans up to ₹1.5 crores are available for overseas education, while domestic education loans typically go up to ₹50 lakhs without collateral.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I get an education loan without collateral?</h4>
                      <p className="text-gray-600 text-sm">Yes, many lenders offer unsecured education loans up to certain limits (typically ₹40-50 lakhs in India, $100,000-150,000 in the US) based on academic merit, course prospects, and co-applicant's financial profile.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What expenses are covered under education loans?</h4>
                      <p className="text-gray-600 text-sm">Education loans typically cover tuition fees, accommodation, books, equipment, travel expenses (for international education), insurance, and other course-related expenses. Living expenses are also covered for overseas education.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does the grace period work in education loans?</h4>
                      <p className="text-gray-600 text-sm">The grace period (moratorium) is the time after course completion before EMI starts. During this period, only simple interest may be charged, which gets added to the principal for EMI calculation.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Are there tax benefits on education loan interest?</h4>
                      <p className="text-gray-600 text-sm">Yes, in many countries including India, interest paid on education loans is eligible for tax deduction. In India, Section 80E allows full deduction of interest paid for up to 8 years without any upper limit.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What happens if I'm unable to repay the education loan?</h4>
                      <p className="text-gray-600 text-sm">Most lenders offer restructuring options including extended tenure, reduced EMI, or additional moratorium. However, defaults can affect credit score and may lead to legal action or asset seizure if collateral was provided.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I prepay my education loan partially?</h4>
                      <p className="text-gray-600 text-sm">Yes, most education loans allow partial prepayment without penalties after a certain period (usually 6-12 months). This can significantly reduce your interest burden and loan tenure.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What credit score is required for education loans?</h4>
                      <p className="text-gray-600 text-sm">For secured loans, a credit score of 650+ is typically acceptable. For unsecured loans, lenders prefer scores of 750+ for students or co-applicants. First-time borrowers may get loans based on co-applicant's credit profile.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Undergraduate Education</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Bachelor's degree financing typically involves lower loan amounts but longer career payback periods.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Popular Fields:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Engineering and Technology</li>
                        <li>Medicine and Healthcare</li>
                        <li>Business and Commerce</li>
                        <li>Science and Research</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Financing Tips:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Consider merit scholarships</li>
                        <li>Explore government schemes</li>
                        <li>Plan for career-oriented courses</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Postgraduate Education</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Master's and doctoral programs often have higher ROI but require substantial upfront investment.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">High-Value Programs:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>MBA and Management</li>
                        <li>Data Science and AI</li>
                        <li>Specialized Medicine</li>
                        <li>International Relations</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Loan Advantages:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Higher loan limits</li>
                        <li>Better interest rates</li>
                        <li>Strong placement support</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Professional Courses</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Specialized professional training and certification programs with focused career outcomes.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Popular Options:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Digital Marketing</li>
                        <li>Cybersecurity</li>
                        <li>Financial Planning</li>
                        <li>Project Management</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Benefits:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Shorter duration</li>
                        <li>Quick ROI</li>
                        <li>Industry recognition</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* International Education Considerations */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">International Education Loan Considerations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Currency Risk Management</h4>
                      <p className="text-blue-700 text-sm">Foreign education loans involve currency fluctuation risks. Consider forex rates when calculating total loan cost and plan for potential currency appreciation.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Comprehensive Coverage</h4>
                      <p className="text-green-700 text-sm">International education loans typically cover tuition, living expenses, travel, insurance, and emergency expenses, providing complete financial support.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Higher Loan Limits</h4>
                      <p className="text-orange-700 text-sm">Overseas education loans offer higher limits (up to $150,000-200,000) to cover expensive international programs and living costs.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Collateral Requirements</h4>
                      <p className="text-purple-700 text-sm">High-value international loans often require collateral like property or investments, though some lenders offer unsecured options for premium institutions.</p>
                    </div>
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Documentation Complexity</h4>
                      <p className="text-red-700 text-sm">International loans require extensive documentation including university admission letters, cost estimates, visa approvals, and financial statements.</p>
                    </div>
                    <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-indigo-800 mb-2">Post-Study Work Options</h4>
                      <p className="text-indigo-700 text-sm">Consider countries with favorable post-study work visas when planning repayment, as local employment can significantly ease EMI burden.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Career ROI Analysis */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Education Loan vs Career ROI Analysis</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">High ROI Career Paths</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Technology and Software Engineering (3-5 year payback period)</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Medicine and Specialized Healthcare (5-8 year payback period)</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">MBA from Top Institutions (2-4 year payback period)</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Data Science and Analytics (2-3 year payback period)</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">ROI Calculation Tips</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Compare average starting salaries with total education cost</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Factor in career growth potential and salary increments</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Consider industry demand and job market stability</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Include non-monetary benefits like job satisfaction and flexibility</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Smart Investment Strategy</h4>
                  <p className="text-blue-700 text-sm">
                    Use our education loan calculator to determine if the monthly EMI burden aligns with your expected career 
                    earnings. Ideally, your EMI should not exceed 30-40% of your expected starting salary, leaving room for 
                    other expenses and savings while building a strong financial foundation for your future.
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
